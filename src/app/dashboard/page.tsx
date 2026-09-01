import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";

export default async function Dashboard() {
  const s = await getSession();
  if (!s) redirect("/login");

  const links = s.role === "CLIENT"
    ? [["Post a Job", "/jobs/post", "＋"], ["Manage Jobs", "/jobs", "▣"], ["Messages", "/chat", "◌"], ["Premium", "/payments", "✦"]]
    : [["Browse Jobs", "/jobs", "▣"], ["Messages", "/chat", "◌"], ["LeonardX AI", "/ai", "✦"], ["Premium", "/payments", "♔"]];

  return (
    <AppShell title={`Welcome back, ${s.fullName.split(" ")[0]}`} subtitle={`You are logged in as a ${s.role.toLowerCase()}.`}>
      <section className="dashboard-banner">
        <div><span className="dashboard-kicker">YOUR DASHBOARD</span><h2>Everything you need, all in one place.</h2><p>Manage your work, conversations, opportunities, and premium tools from your LeonardX workspace.</p></div>
        <div className="dashboard-art"><span>✦</span><span>▣</span><span>↗</span></div>
      </section>
      <section className="quick-access"><div className="section-mini-heading"><div><span>QUICK ACCESS</span><h2>Keep moving forward</h2></div><p>Choose where you want to continue.</p></div>
        <div className="dashboard-grid">
          {links.map(([label, href, icon]) => <Link className="dashboard-card" href={href} key={href}><div className="dashboard-card-icon">{icon}</div><h3>{label}</h3><p>Open {label.toLowerCase()} and continue building on LeonardX.</p><span className="card-arrow">→</span></Link>)}
        </div>
      </section>
      {s.role === "ADMIN" && <Link href="/admin" className="primary-link">Open Admin Controls →</Link>}
    </AppShell>
  );
}
