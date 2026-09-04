"use client";

import { useState } from "react";

export default function EscrowClientCard({ jobId, amount, freelancerName, existingStatus }: { jobId: string; amount: number; freelancerName?: string; existingStatus?: string | null }) {
  const [ref, setRef] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    if (!ref.trim() || ref.trim().length < 10) return setMessage("Enter the OPay transaction reference (minimum 10 characters).");
    if (!receipt) return setMessage("Upload your payment receipt.");
    if (receipt.size > 5 * 1024 * 1024) return setMessage("Receipt must not exceed 5MB.");
    if (!["image/jpeg", "image/png", "application/pdf"].includes(receipt.type)) return setMessage("Receipt must be JPG, PNG or PDF.");
    setBusy(true);
    try {
      const form = new FormData();
      form.append("file", receipt);
      const upload = await fetch("/api/uploads", { method: "POST", body: form });
      const uploadData = await upload.json();
      if (!upload.ok) throw new Error(uploadData.error || "Could not upload receipt.");
      const response = await fetch("/api/escrow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, transactionRef: ref.trim(), receiptUrl: uploadData.url }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit escrow payment.");
      setMessage(data.message);
      setRef(""); setReceipt(null);
      (e.currentTarget as HTMLFormElement).reset();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit escrow payment."); }
    finally { setBusy(false); }
  }

  return <section className="escrow-card">
    <div className="escrow-card-head"><div><span className="eyebrow">CLIENT PROTECTION</span><h2>Pay Safely with LeonardX Escrow</h2><p>{freelancerName ? `Your payment for ${freelancerName} is protected until you approve the finished work.` : "Your funds stay protected until the work is approved."}</p></div><span className="escrow-guarantee">✓ Guarantee: No delivery = Full refund</span></div>
    <div className="escrow-steps">
      {["Pay 100% to Opay 0837624782 — Leonard mary philip udoh", "We hold funds securely", "Approve the finished work", "We release 90% to the freelancer"].map((step, i) => <div className="escrow-step" key={step}><span>{i + 1}</span><div><strong>{step}</strong><small>{i === 0 ? "Use your OPay receipt as proof." : i === 1 ? "Payment remains in LeonardX escrow." : i === 2 ? "Release only when the delivery is satisfactory." : "LeonardX keeps the 10% marketplace commission."}</small></div></div>)}
    </div>
    {existingStatus ? <div className="escrow-status-box"><span className="payment-status pending">ESCROW {existingStatus}</span><p>Your escrow record is already on file for this project.</p></div> : <form className="escrow-payment-form" onSubmit={submit}><div><label>Project amount<input value={`₦${amount.toLocaleString()}`} readOnly /></label><label>OPay transaction reference<input value={ref} onChange={e => setRef(e.target.value)} minLength={10} required placeholder="Enter transaction reference" /></label></div><label>Payment receipt<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => setReceipt(e.target.files?.[0] || null)} required /><small>JPG, PNG or PDF · maximum 5MB</small></label><button disabled={busy}>{busy ? "Submitting..." : "I have paid 100% →"}</button></form>}
    {message && <p className="status app-alert">{message}</p>}
  </section>;
}
