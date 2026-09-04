"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
export default function AdminDeliveries() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => { fetch("/api/admin/deliveries").then(r => r.json()).then(d => setItems(Array.isArray(d) ? d : [])); }, []);
  return <AppShell title="Job Deliveries" subtitle="See completed work and submitted files across LeonardX.">
    <section className="admin-section"><div className="section-mini-heading"><div><span>MARKETPLACE</span><h2>Freelancer deliveries</h2></div><p>{items.length} deliveries</p></div>
      <div className="admin-list">{!items.length ? <div className="empty-state"><h2>No deliveries yet</h2><p>Completed freelancer work will appear here.</p></div> :
        items.map(d => <article className="payment-row" key={d.id}><div><b>{d.job.title}</b><p>Freelancer: {d.freelancer.fullName} · {d.freelancer.email}</p><p>Client: {d.job.client.fullName} · ₦{d.job.budget.toLocaleString()}</p><small>{d.filename} · {new Date(d.createdAt).toLocaleString()}</small>{d.notes && <p>{d.notes}</p>}<p><a href={d.fileUrl} target="_blank" rel="noreferrer">Open delivered file</a></p></div><span className={`payment-status ${d.status.toLowerCase()}`}>{d.status}</span></article>)}</div>
    </section>
  </AppShell>;
}
