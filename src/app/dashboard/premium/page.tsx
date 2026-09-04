"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { PAYMENT_PLANS } from "@/lib/payment-plans";

const plans = Object.entries(PAYMENT_PLANS);
const allowed = ".jpg,.jpeg,.png,.pdf";

export default function PremiumPage() {
  const [plan, setPlan] = useState(plans[0][0]);
  const [amount, setAmount] = useState(plans[0][1].amount);
  const [payments, setPayments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);

  const selected = useMemo(() => PAYMENT_PLANS[plan as keyof typeof PAYMENT_PLANS], [plan]);

  useEffect(() => {
    fetch("/api/payments").then(r => r.json()).then(d => setPayments(Array.isArray(d) ? d : []));
  }, []);

  function choose(value: string) {
    setPlan(value);
    setAmount(PAYMENT_PLANS[value as keyof typeof PAYMENT_PLANS].amount);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(""); setWarning("");
    const form = new FormData(e.currentTarget);
    const file = form.get("receipt");
    if (!(file instanceof File) || !file.size) return setMessage("Choose your payment receipt.");
    if (file.size > 5 * 1024 * 1024) return setMessage("Receipt must not exceed 5MB.");
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) return setMessage("Receipt must be JPG, PNG, or PDF.");

    setLoading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const uploadResponse = await fetch("/api/uploads", { method: "POST", body: uploadForm });
      const upload = await uploadResponse.json();
      if (!uploadResponse.ok) throw new Error(upload.error || "Could not upload receipt.");

      const response = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan, amount,
          transactionRef: String(form.get("transactionRef") || ""),
          receiptUrl: upload.url,
          notes: String(form.get("notes") || ""),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment submission failed.");
      setMessage(data.message);
      if (data.warning) setWarning(data.warning);
      setPayments(p => [data.proof, ...p]);
      e.currentTarget.reset();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Payment submission failed.");
    } finally { setLoading(false); }
  }

  return (
    <AppShell title="Premium" subtitle="Upload your payment proof and wait for admin approval.">
      <section className="payment-card">
        <div className="payment-heading">
          <span className="payment-icon">◇</span>
          <div><span className="eyebrow">LEONARDX PREMIUM</span><h2>Choose your access plan</h2><p>Pay to the OPay account below, then upload the receipt.</p></div>
        </div>

        <div className="premium-actions">
          {plans.map(([name, p]) => (
            <button key={name} type="button" className={plan === name ? "primary-button" : "ghost"} onClick={() => choose(name)}>
              <strong>{name}</strong><br />₦{p.amount.toLocaleString()} {p.durationDays ? `· ${p.durationDays} day${p.durationDays === 1 ? "" : "s"}` : "· one-time"}
            </button>
          ))}
        </div>

        <div className="account-box">
          <div><span>OPay Account Number</span><strong>0837624782</strong></div>
          <div><span>Account Name</span><strong>Leonard mary philip udoh</strong></div>
        </div>

        <form onSubmit={submit} className="app-form">
          <label>Plan
            <select value={plan} onChange={e => choose(e.target.value)}>
              {plans.map(([name]) => <option key={name}>{name}</option>)}
            </select>
            <small>{selected.description}</small>
          </label>
          <label>Amount (NGN)
            <input type="number" value={amount} readOnly />
          </label>
          <label>Transaction reference
            <input name="transactionRef" minLength={10} required placeholder="Enter the OPay transaction reference" />
          </label>
          <label>Receipt
            <input name="receipt" type="file" accept={allowed} required />
            <small>JPG, PNG or PDF · maximum 5MB</small>
          </label>
          <label>Notes (optional)
            <textarea name="notes" maxLength={1000} placeholder="Anything the admin should know?" />
          </label>
          <button disabled={loading}>{loading ? "Submitting..." : "Submit payment proof →"}</button>
        </form>

        {message && <p className="status app-alert">{message}</p>}
        {warning && <p className="status app-alert">{warning}</p>}
      </section>

      <section className="admin-section">
        <div className="section-mini-heading"><div><span>PAYMENT HISTORY</span><h2>Your submissions</h2></div><p>{payments.length} total</p></div>
        <div className="admin-list">
          {!payments.length ? <div className="empty-state"><h2>No submissions yet</h2><p>Your payment proofs will appear here.</p></div> :
            payments.map(p => <article className="payment-row" key={p.id}>
              <div><b>{p.plan}</b><p>₦{p.amount.toLocaleString()} · Ref: {p.transactionRef}</p><small>{new Date(p.createdAt).toLocaleString()}</small></div>
              <span className={`payment-status ${p.status.toLowerCase()}`}>{p.status}</span>
            </article>)}
        </div>
      </section>
    </AppShell>
  );
}
