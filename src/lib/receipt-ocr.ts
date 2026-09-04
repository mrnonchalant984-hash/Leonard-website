type ReceiptVerification = {
  matched: boolean;
  recipient?: string;
  accountNumber?: string;
  confidence?: number;
  warning?: string;
};

const EXPECTED_NAME = "Leonard mary philip udoh";
const EXPECTED_ACCOUNT = "0837624782";

function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function digits(value: unknown) {
  return String(value ?? "").replace(/\D/g, "");
}

function parseModelJson(text: string): Record<string, unknown> {
  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    const value = JSON.parse(match[0]);
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
}

function nameMatches(value: unknown) {
  const actual = normalize(value);
  const expected = normalize(EXPECTED_NAME);
  if (!actual) return false;
  if (actual.includes(expected)) return true;

  const expectedWords = expected.split(" ");
  const actualWords = new Set(actual.split(" "));
  const allWordsPresent = expectedWords.every((word) => actualWords.has(word));
  if (allWordsPresent) return true;

  // Handles harmless OCR punctuation/spacing and common missing middle-name noise.
  const firstLast = `${expectedWords[0]} ${expectedWords[expectedWords.length - 1]}`;
  return actual.includes(firstLast);
}

export async function verifyReceiptRecipient(url: string): Promise<ReceiptVerification> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      matched: false,
      warning: "Receipt saved. Automatic recipient verification is unavailable; admin will verify it.",
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
        model: process.env.OPENAI_RECEIPT_OCR_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
        temperature: 0,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `Read this OPay payment receipt carefully. This is OCR/document extraction, not a guess.

Extract the recipient/account details exactly as visible. Look especially for:
- Recipient/account name
- Recipient/account number

The expected LeonardX payment recipient is:
Name: ${EXPECTED_NAME}
Account number: ${EXPECTED_ACCOUNT}

Return JSON only:
{"recipient":"...","accountNumber":"...","confidence":0}

Rules:
- confidence is 0-100 and reflects how clearly the receipt shows the recipient details.
- If a field is not visible, return an empty string for that field.
- Never invent or infer missing characters.
- Do not mark a recipient as matching merely because the sender name is similar.
- The account number may be formatted with spaces; return the digits you can actually read.`,
              },
              {
                type: "input_image",
                image_url: url,
                detail: "high",
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Receipt OCR API error:", data);
      throw new Error(`OCR request failed (${response.status})`);
    }

    const text = typeof data.output_text === "string" ? data.output_text : "";
    const parsed = parseModelJson(text);
    const recipient = String(parsed.recipient ?? "").trim();
    const accountNumber = digits(parsed.accountNumber);
    const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));

    const nameMatch = nameMatches(recipient);
    const accountMatch = accountNumber === EXPECTED_ACCOUNT;

    // A clearly readable exact account number is strong evidence even if OCR
    // introduces a small name formatting difference. Name must still be present.
    const matched = nameMatch && (accountMatch || confidence >= 70);

    if (matched) {
      return { matched: true, recipient, accountNumber, confidence };
    }

    const details = [
      recipient ? `recipient read as "${recipient}"` : "recipient name was not clearly read",
      accountNumber ? `account number read as "${accountNumber}"` : "account number was not clearly read",
    ].join("; ");

    return {
      matched: false,
      recipient,
      accountNumber,
      confidence,
      warning: `Receipt was read, but the recipient could not be safely verified (${details}). Admin will verify it manually.`,
    };
  } catch (error) {
    console.error("Receipt OCR verification failed:", error);
    return {
      matched: false,
      warning: "Receipt saved. Automatic recipient verification could not be completed; admin will verify it manually.",
    };
  }
}
