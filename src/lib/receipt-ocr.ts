export async function verifyReceiptRecipient(url: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { matched: false, warning: "Receipt saved. Automatic recipient verification is unavailable; admin will verify it." };

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_RECEIPT_OCR_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: "Inspect this payment receipt. Find the recipient/account name. Return JSON only: {"recipient":"...","matched":true|false}. matched is true only if the recipient contains the exact name Leonard mary philip udoh, ignoring case and punctuation." },
            { type: "input_image", image_url: url },
          ],
        }],
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error("OCR unavailable");
    const text = data.output_text || "";
    const parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    if (parsed.matched) return { matched: true };
    return { matched: false, warning: `Warning: the receipt recipient does not appear to contain "Leonard mary philip udoh". Please confirm the recipient before admin review.` };
  } catch {
    return { matched: false, warning: "Receipt saved. Automatic recipient verification could not be completed; admin will verify it manually." };
  }
}
