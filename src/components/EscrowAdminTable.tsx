"use client";

import { useEffect, useState } from "react";

export default function EscrowAdminTable() {
  const [tab, setTab] = useState("payments");
  const [items, setItems] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function load() {
    const endpoint = tab === "withdrawals" ? "/api/admin/withdrawals" : "/api/admin/escrow?view=" + (tab === "completed" ? "completed" : "pending");
    const r = await fetch(endpoint); const d = await r.json(); setItems(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, [tab]);

  async function review(kind: "escrow" | "withdrawal", id: string, action: string) {
    const r = await fetch(kind === "escrow" ? "/api/admin/escrow/review" : "/api/admin/withdrawals/review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action }) });
    const d = await r.json(); setMessage(r.ok ? d.message : d.error || "Action failed"); if (r.ok) load();
  }

  return <section className="admin-section escrow-admin-table"><div className="section-mini-heading"><div><span>ESCROW CONTROL CENTER</span><h2>Escrow & withdrawals</h2></div><p>100% in → 90% freelancer payout</p></div><div className="escrow-tabs"><button className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>Payments Pending</button><button className={tab === "withdrawals" ? "active" : ""} onClick={() => setTab("withdrawals")}>Withdrawals Pending</button><button className={tab === "completed" ? "active" : ""} onClick={() => setTab("completed")}>Completed Transactions</button></div>{message && <p className="status app-alert">{message}</p>}<div className="escrow-table-wrap"><table className="escrow-table"><thead><tr><th>User</th><th>Amount</th><th>Transaction Ref</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.length === 0 ? <tr><td colSpan={5}><div className="empty-state"><h3>Nothing here yet</h3><p>Records will appear when activity is created.</p></div></td></tr> : items.map(x => { const withdrawal = tab === "withdrawals"; return <tr key={x.id}><td><b>{withdrawal ? x.user?.fullName : x.client?.fullName}</b><small>{withdrawal ? x.user?.email : x.job?.title}</small></td><td>₦{Number(x.amount || x.grossAmount || 0).toLocaleString()}</td><td>{x.transactionRef || "—"}</td><td><span className={`payment-status ${(x.status || "").toLowerCase()}`}>{x.status}</span></td><td><div className="admin-actions">{tab !== "completed" && <><button onClick={() => review(withdrawal ? "withdrawal" : "escrow", x.id, withdrawal ? "APPROVE" : "VERIFY")}>Verify</button><button onClick={() => review(withdrawal ? "withdrawal" : "escrow", x.id, withdrawal ? "PAY" : "REJECT")} className="ghost">{withdrawal ? "Pay" : "Reject"}</button>{withdrawal && <button onClick={() => review("withdrawal", x.id, "REJECT")} className="danger-button">Reject</button>}</>}</div></td></tr>; })}</tbody></table></div></section>;
}
