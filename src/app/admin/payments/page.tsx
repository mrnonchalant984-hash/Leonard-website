"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

export default function AdminPayments() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const load = () => fetch("/api/admin/payments").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : []));
  useEffect(() => { load(); }, []);
  async function review(proofId: string, action: string) {
    const note = window.prompt("Optional admin note:") || "";
    const r = await fetch("/api/admin/payments/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ proofId, action, note }) });
    const d = await r.json(); setMsg(r.ok ? d.message : d.error || "Review failed"); load();
  }
  return <AppShell title="Payment Proofs" subtitle="Review pending premium and APK payments.">
    {msg && <p className="status app-alert">{msg}</p>}
    <section className="admin-section"><div className="section-mini-heading"><div><span>PENDING</span><h2>Payment proofs</h2></div><p>{items.length} pending</p></div>
      <div className="admin-list">{!items.length ? <div className="empty-state"><h2>No pending proofs</h2><p>New submissions will appear here.</p></div> :
        items.map(p => <article className="payment-row" key={p.id}>
          <div className="payment-user"><span className="person-avatar">{p.user.fullName.slice(0,1).toUpperCase()}</span><div>
            <b>{p.user.fullName}</b><p>{p.user.email}</p><p>₦{p.amount.toLocaleString()} · {p.plan}</p>
            <small>Ref: {p.transactionRef} · {new Date(p.createdAt).toLocaleString()}</small>
            <p><a href={p.receiptUrl} target="_blank" rel="noreferrer">Open receipt</a></p>
            {p.notes && <small>Notes: {p.notes}</small>}
          </div></div>
          <div className="payment-review"><span className="payment-status pending">PENDING</span><div className="admin-actions"><button onClick={() => review(p.id, "APPROVED")}>Approve</button><button className="danger-button" onClick={() => review(p.id, "REJECTED")}>Reject</button></div></div>
        </article>)}</div>
    </section>
  </AppShell>;
}
