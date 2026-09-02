import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/AppShell";

export default async function Dashboard() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [openJobs, myApplications, unreadNotifications, payments, transactions] = await Promise.all([
    prisma.job.count({ where: { status: "OPEN" } }),
    prisma.application.count({ where: { freelancerId: session.id, status: "PENDING" } }),
    prisma.notification.count({ where: { userId: session.id, read: false } }),
    prisma.payment.count({ where: { userId: session.id, status: "PENDING" } }),
    prisma.transaction.findMany({
      where: session.role === "CLIENT" ? { clientId: session.id } : session.role === "FREELANCER" ? { freelancerId: session.id } : {},
      select: { grossAmount: true, commissionAmount: true, freelancerAmount: true, status: true },
    }),
  ]);

  const transactionCount = transactions.length;
  const completed = transactions.filter((t) => t.status === "COMPLETED");
  const earned = completed.reduce((sum, t) => sum + (session.role === "FREELANCER" ? t.freelancerAmount : t.grossAmount), 0);
  const links = session.role === "CLIENT"
    ? [["Post a Job", "/jobs/post", "＋"], ["Manage Jobs", "/manage-jobs", "▣"], ["Messages", "/chat", "◌"], ["Transactions", "/transactions", "₦"]]
    : [["Browse Jobs", "/jobs", "▣"], ["Applications", "/applications", "◫"], ["Messages", "/chat", "◌"], ["Premium", "/payments", "♔"]];

  return <AppShell title={`Welcome back, ${session.fullName.split(" ")[0]}`} subtitle={`You are logged in as a ${session.role.toLowerCase()}.`}>
    <section className="stats-grid">
      <div><span className="stat-icon">▣</span><b>{session.role === "FREELANCER" ? openJobs : transactionCount}</b><span>{session.role === "FREELANCER" ? "Open jobs" : "Projects tracked"}</span></div>
      <div><span className="stat-icon">◫</span><b>{myApplications}</b><span>Pending applications</span></div>
      <div><span className="stat-icon">●</span><b>{unreadNotifications}</b><span>Unread notifications</span></div>
      <div><span className="stat-icon">♔</span><b>{payments}</b><span>Pending payments</span></div>
    </section>
    <section className="dashboard-banner"><div><span className="dashboard-kicker">YOUR WORKSPACE</span><h2>{earned > 0 ? `₦${earned.toLocaleString()} completed value tracked` : "Everything you need, all in one place."}</h2><p>Manage jobs, applications, conversations, payment approvals, transactions and premium tools from your LeonardX workspace.</p></div><div className="dashboard-art"><span>✦</span><span>◈</span><span>₦</span></div></section>
    <section className="dashboard-grid">{links.map(([label, href, icon]) => <Link className="dashboard-card" href={href} key={href}><div className="dashboard-card-icon">{icon}</div><h3>{label}</h3><p>Open {label.toLowerCase()} and continue building on LeonardX.</p><span className="card-arrow">→</span></Link>)}</section>
    {session.role === "ADMIN" && <Link href="/admin" className="primary-link">Open Admin Controls →</Link>}
  </AppShell>;
}
