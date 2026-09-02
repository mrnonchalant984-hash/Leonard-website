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
    prisma.transaction.findMany({ where: session.role === "CLIENT" ? { clientId: session.id } : session.role === "FREELANCER" ? { freelancerId: session.id } : {}, select: { grossAmount: true, freelancerAmount: true, status: true } }),
  ]);

  const transactionCount = transactions.length;
  const completed = transactions.filter((t) => t.status === "COMPLETED");
  const earned = completed.reduce((sum, t) => sum + (session.role === "FREELANCER" ? t.freelancerAmount : t.grossAmount), 0);
  const firstName = session.fullName.split(" ")[0];
  const actions = session.role === "CLIENT"
    ? [["Post a job", "/jobs/post", "+", "Create a new opportunity"], ["Manage jobs", "/manage-jobs", "▤", "Review active projects"], ["Messages", "/chat", "◌", "Continue conversations"], ["Transactions", "/transactions", "₦", "Track project activity"]]
    : [["Browse jobs", "/jobs", "▣", "Find your next project"], ["Applications", "/applications", "◫", "Track your applications"], ["Messages", "/chat", "◌", "Stay connected"], ["Premium", "/payments", "✦", "Unlock LeonardX AI"]];

  return <AppShell title={`Welcome back, ${firstName}`} subtitle="Here is a clear view of what is happening in your LeonardX workspace.">
    <section className="dashboard-hero-v2">
      <div className="dashboard-hero-copy"><span className="eyebrow">YOUR WORKSPACE</span><h2>{earned > 0 ? `₦${earned.toLocaleString()} completed value` : session.role === "CLIENT" ? "Build your next project with confidence." : "Your next opportunity starts here."}</h2><p>Manage your work, conversations, applications, payments and growth from one professional workspace.</p><div className="dashboard-hero-actions"><Link className="primary-button" href={session.role === "CLIENT" ? "/jobs/post" : "/jobs"}>{session.role === "CLIENT" ? "Post a job →" : "Browse jobs →"}</Link><Link className="secondary-button" href="/profile">View profile</Link></div></div>
      <div className="dashboard-hero-orbit"><div className="orbit-card orbit-one">✦<span>LeonardX</span></div><div className="orbit-card orbit-two">₦<span>Work</span></div><div className="orbit-card orbit-three">◌<span>Connect</span></div></div>
    </section>
    <section className="stats-grid stats-grid-v2">
      <article><span className="stat-icon">▣</span><div><b>{session.role === "FREELANCER" ? openJobs : transactionCount}</b><span>{session.role === "FREELANCER" ? "Open jobs" : "Projects tracked"}</span></div></article>
      <article><span className="stat-icon">◫</span><div><b>{session.role === "CLIENT" ? transactionCount : myApplications}</b><span>{session.role === "CLIENT" ? "Project records" : "Pending applications"}</span></div></article>
      <article><span className="stat-icon">●</span><div><b>{unreadNotifications}</b><span>Unread notifications</span></div></article>
      <article><span className="stat-icon">♔</span><div><b>{payments}</b><span>Pending payments</span></div></article>
    </section>
    <section className="dashboard-section-head"><div><span className="eyebrow">QUICK ACTIONS</span><h2>Continue where you left off</h2></div><p>Everything important is one tap away.</p></section>
    <section className="dashboard-grid dashboard-grid-v2">{actions.map(([label, href, icon, copy]) => <Link className="dashboard-card" href={href} key={href}><div className="dashboard-card-top"><div className="dashboard-card-icon">{icon}</div><span className="card-arrow">→</span></div><h3>{label}</h3><p>{copy}</p></Link>)}</section>
    {session.role === "ADMIN" && <section className="dashboard-admin-callout"><div><span className="eyebrow">ADMIN</span><h2>Platform controls are ready</h2><p>Review payments, referrals, badges and platform activity.</p></div><Link href="/admin" className="primary-button">Open admin controls →</Link></section>}
  </AppShell>;
}
