"use client";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/transactions").then((r) => r.json()).then((d) => setTransactions(Array.isArray(d) ? d : [])).catch(() => setTransactions([])).finally(() => setLoading(false));
  }, []);
  const totals = useMemo(() => transactions.reduce((a, x) => ({ gross: a.gross + Number(x.grossAmount || 0), commission: a.commission + Number(x.commissionAmount || 0), earnings: a.earnings + Number(x.freelancerAmount || 0) }), { gross: 0, commission: 0, earnings: 0 }), [transactions]);
  const fmt = (n:number) => `₦${n.toLocaleString()}`;
  return <AppShell title="Transactions" subtitle="A clear view of project value, platform commission and freelancer earnings.">
    <section className="transaction-hero">
      <div><span className="eyebrow">FINANCIAL OVERVIEW</span><h2>Every project. One clear record.</h2><p>Track how project payments are split and follow transaction activity as work is completed.</p></div>
      <div className="transaction-hero-badge"><strong>{transactions.length}</strong><span>tracked projects</span></div>
    </section>

    <section className="transaction-summary-grid">
      <article><span className="summary-icon">₦</span><p>Total project value</p><strong>{fmt(totals.gross)}</strong><small>Across all recorded projects</small></article>
      <article><span className="summary-icon">◇</span><p>LeonardX commission</p><strong>{fmt(totals.commission)}</strong><small>Platform commission recorded</small></article>
      <article><span className="summary-icon">✓</span><p>Freelancer earnings</p><strong>{fmt(totals.earnings)}</strong><small>Amount allocated to freelancers</small></article>
    </section>

    <section className="transaction-panel">
      <div className="transaction-panel-head"><div><span className="eyebrow">ACTIVITY</span><h2>Transaction history</h2></div><span className="transaction-count">{loading ? "Loading…" : `${transactions.length} total`}</span></div>
      {loading ? <div className="transaction-loading"><span></span><span></span><span></span></div> : transactions.length === 0 ? <div className="transaction-empty"><div className="empty-icon">₦</div><h3>No transactions yet</h3><p>When a project creates a transaction, the project value and earnings breakdown will appear here.</p></div> : <div className="transaction-list">{transactions.map((x) => <article className="transaction-card" key={x.id}>
        <div className="transaction-main"><div className="transaction-title-row"><span className={`payment-status ${String(x.status).toLowerCase()}`}>{String(x.status).replaceAll("_", " ")}</span><small>{x.createdAt ? new Date(x.createdAt).toLocaleDateString() : ""}</small></div><h3>{x.job?.title || "Project transaction"}</h3><p>Client <b>{x.client?.fullName || "—"}</b><span>→</span> Freelancer <b>{x.freelancer?.fullName || "—"}</b></p></div>
        <div className="transaction-breakdown"><div><span>Project value</span><strong>{fmt(Number(x.grossAmount || 0))}</strong></div><div><span>Commission{typeof x.commissionRate === "number" ? ` (${x.commissionRate}%)` : ""}</span><b>{fmt(Number(x.commissionAmount || 0))}</b></div><div className="transaction-payout"><span>Freelancer payout</span><strong>{fmt(Number(x.freelancerAmount || 0))}</strong></div></div>
      </article>)}</div>}
    </section>
  </AppShell>;
}
