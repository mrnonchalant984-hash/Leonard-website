"use client";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";

export default function Transactions() {
  const [transactions, setTransactions] = useState<any[]>([]);
  useEffect(() => { fetch("/api/transactions").then((r) => r.json()).then((d) => setTransactions(Array.isArray(d) ? d : [])); }, []);
  const totals = useMemo(() => transactions.reduce((a, x) => ({ gross: a.gross + x.grossAmount, commission: a.commission + x.commissionAmount, earnings: a.earnings + x.freelancerAmount }), { gross: 0, commission: 0, earnings: 0 }), [transactions]);
  return <AppShell title="Transactions & Commission" subtitle="Track project value, LeonardX commission and freelancer earnings.">
    <section className="stats-grid"><div><span className="stat-icon">₦</span><b>₦{totals.gross.toLocaleString()}</b><span>Project value</span></div><div><span className="stat-icon">◇</span><b>₦{totals.commission.toLocaleString()}</b><span>LeonardX commission</span></div><div><span className="stat-icon">✓</span><b>₦{totals.earnings.toLocaleString()}</b><span>Freelancer amount</span></div><div><span className="stat-icon">▣</span><b>{transactions.length}</b><span>Tracked projects</span></div></section>
    <div className="transaction-list">{transactions.length === 0 ? <div className="empty-state"><span>₦</span><h2>No transactions yet</h2><p>A transaction is created automatically when a client hires a freelancer.</p></div> : transactions.map((x) => <article className="transaction-card" key={x.id}><div><span className={`payment-status ${x.status.toLowerCase()}`}>{x.status.replace("_", " ")}</span><h3>{x.job.title}</h3><p>Client: {x.client.fullName} · Freelancer: {x.freelancer.fullName}</p></div><div className="transaction-amounts"><b>₦{x.grossAmount.toLocaleString()}</b><small>Gross project value</small><p>LeonardX fee ({x.commissionRate}%): ₦{x.commissionAmount.toLocaleString()}</p><strong>Freelancer: ₦{x.freelancerAmount.toLocaleString()}</strong></div></article>)}</div>
  </AppShell>;
}
