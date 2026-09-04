type ReceiptVerification = {
  matched: boolean;
  recipient?: string;
  accountNumber?: string;
  amount?: number;
  transactionRef?: string;
  warning?: string;
};

const EXPECTED_ACCOUNT = "8037624782";
const EXPECTED_NAME = "Leonard mary philip udoh";

function normalize(value: unknown) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeDigits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function nameMatches(value: unknown) {
  const actual = normalize(value);
  const expected = normalize(EXPECTED_NAME);

  if (!actual || !expected) return false;
  if (actual.includes(expected)) return true;

  const expectedTokens = EXPECTED_NAME.toLowerCase().split(/\s+/);
  const actualText = String(value ?? "").toLowerCase();
  return expectedTokens.every((token) => actualText.includes(token));
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;

  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function parseAmount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);

  const text = String(value ?? "").replace(/,/g, "");
  const match = text.match(/(?:₦|NGN)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (!match) return undefined;

  const amount = Number(match[1]);
  return Number.isFinite(amount) ? Math.round(amount) : undefined;
}

function refMatches(actual: unknown, expected: string) {
  const a = normalizeDigits(actual);
  const e = normalizeDigits(expected);
  if (!a || !e) return false;
  return a === e || a.includes(e) || e.includes(a);
}

/**
 * Vision OCR + recipient verification for an OPay payment receipt.
 *
 * Security rule:
 * - An exact account-number match is the strongest signal.
 * - A full recipient-name match is accepted when the account number is not
 *   visible/readable.
 * - OCR is never allowed to approve a payment; admin approval remains final.
 */
export async function verifyReceiptRecipient(
  url: string,
  options: {
    expectedAmount?: number;
    expectedTransactionRef?: string;
  } = {}
): Promise<ReceiptVerification> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      matched: false,
      warning:
        "Receipt saved. Automatic OCR verification is unavailable because OPENAI_API_KEY is not configured; admin will verify it.",
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model:
          process.env.OPENAI_RECEIPT_OCR_MODEL ||
          process.env.OPENAI_MODEL ||
          "gpt-4.1-mini",
        temperature: 0,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `You are verifying an OPay payment receipt for LeonardX.

Extract only information that is visibly present on the receipt. Do not guess.

Expected recipient:
- Account number: ${EXPECTED_ACCOUNT}
- Account name: ${EXPECTED_NAME}
${options.expectedAmount ? `- Expected amount: ₦${options.expectedAmount.toLocaleString()}` : ""}
${options.expectedTransactionRef ? `- Expected transaction reference: ${options.expectedTransactionRef}` : ""}

Return JSON only:
{
  "recipient": "visible recipient/account name or empty string",
  "accountNumber": "visible recipient/account number or empty string",
  "amount": number or null,
  "transactionRef": "visible transaction reference or empty string",
  "recipientAccountMatches": true or false,
  "recipientNameMatches": true or false,
  "amountMatches": true or false or null,
  "transactionRefMatches": true or false or null
}

Rules:
1. recipientAccountMatches is true ONLY when the visible recipient account number is exactly ${EXPECTED_ACCOUNT} after removing spaces, dashes, and other punctuation.
2. recipientNameMatches is true when the visible recipient name clearly contains all words in "${EXPECTED_NAME}", ignoring case, punctuation and spacing.
3. amountMatches is true only when the visible amount equals the expected amount; use null if the amount is not readable.
4. transactionRefMatches is true only when the visible reference clearly matches the expected reference; use null if it is not readable.
5. Never invent missing values.`,
              },
              {
                type: "input_image",
                image_url: url,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const detail =
        typeof data?.error?.message === "string"
          ? data.error.message
          : `OpenAI OCR returned HTTP ${response.status}.`;
      throw new Error(detail);
    }

    const text = typeof data.output_text === "string" ? data.output_text : "";
    const parsed = extractJson(text);

    if (!parsed) {
      throw new Error("OCR returned an unreadable response.");
    }

    const recipient =
      typeof parsed.recipient === "string" ? parsed.recipient.trim() : "";
    const accountNumber =
      typeof parsed.accountNumber === "string"
        ? parsed.accountNumber.trim()
        : "";
    const transactionRef =
      typeof parsed.transactionRef === "string"
        ? parsed.transactionRef.trim()
        : "";

    const accountMatched =
      parsed.recipientAccountMatches === true ||
      normalizeDigits(accountNumber) === EXPECTED_ACCOUNT;

    const nameMatched =
      parsed.recipientNameMatches === true || nameMatches(recipient);

    const matched = accountMatched || nameMatched;
    const amount = parseAmount(parsed.amount);

    const amountChecked = options.expectedAmount
      ? parsed.amount != null
        ? amount === options.expectedAmount
        : null
      : null;

    const referenceChecked = options.expectedTransactionRef
      ? transactionRef
        ? refMatches(transactionRef, options.expectedTransactionRef)
        : null
      : null;

    const warnings: string[] = [];

    if (!matched) {
      warnings.push(
        `OCR could not verify the LeonardX recipient (${EXPECTED_ACCOUNT} / ${EXPECTED_NAME}).`
      );
    }

    if (amountChecked === false) {
      warnings.push(
        `OCR found an amount that does not match the expected ₦${options.expectedAmount!.toLocaleString()}.`
      );
    }

    if (referenceChecked === false) {
      warnings.push(
        "OCR found a transaction reference that does not match the reference entered in the form."
      );
    }

    if (!warnings.length) {
      return {
        matched: true,
        recipient,
        accountNumber,
        amount,
        transactionRef,
      };
    }

    return {
      matched,
      recipient,
      accountNumber,
      amount,
      transactionRef,
      warning: warnings.join(" "),
    };
  } catch (error) {
    console.error("Receipt OCR verification failed:", error);

    return {
      matched: false,
      warning:
        error instanceof Error
          ? `Receipt saved. Automatic OCR verification failed: ${error.message} Admin will verify it manually.`
          : "Receipt saved. Automatic OCR verification failed; admin will verify it manually.",
    };
  }
}
