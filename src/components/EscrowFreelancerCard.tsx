"use client";

import { useState } from "react";

export default function EscrowFreelancerCard({ amount }: { amount: number }) {
  const [open, setOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function withdraw(e: React.FormEvent) {
    e.preventDefault(); setMessage("");
    if (amount < 2000) return setMessage("The minimum withdrawal is ₦2,000.");
    if (!bankName || !accountName || !accountNumber) return setMessage("Complete your bank details.");
    setBusy(true);
    try {
      const r = await fetch("/api/escrow/withdraw", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount, bankName, accountName, accountNumber }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Withdrawal request failed.");
      setMessage(d.message); setOpen(false);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Withdrawal request failed."); }
    finally { setBusy(false); }
  }

  return <section className="escrow-card freelancer-escrow-card"><div className="escrow-card-head"><div><span className="eyebrow">FREELANCER PAYOUT</span><h2>Withdraw Your Earnings</h2><p>Your available balance is calculated from completed escrow jobs after LeonardX's 10% commission.</p></div><div className="escrow-balance"><span>Available Balance</span><strong>₦{amount.toLocaleString()}</strong></div></div><div className="escrow-rules"><div><b>₦2,000</b><span>Minimum withdrawal</span></div><div><b>24 hrs</b><span>Admin approval target</span></div><div><b>Manual</b><span>Bank transfer</span></div></div><button className="primary-button" disabled={amount < 2000} onClick={() => setOpen(v => !v)}>{open ? "Close withdrawal form" : amount < 2000 ? "Minimum not reached" : "Request withdrawal →"}</button>{open && <form className="withdraw-form app-form" onSubmit={withdraw}><label>Bank name<input value={bankName} onChange={e => setBankName(e.target.value)} required /></label><label>Account name<input value={accountName} onChange={e => setAccountName(e.target.value)} required /></label><label>Account number<input value={accountNumber} onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ""))} inputMode="numeric" minLength={10} maxLength={10} required /></label><button disabled={busy}>{busy ? "Submitting..." : `Request ₦${amount.toLocaleString()}`}</button></form>}{message && <p className="status app-alert">{message}</p>}</section>;
}
