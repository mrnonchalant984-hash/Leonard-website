"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Me = { fullName?: string; role?: string; isPremium?: boolean };
type Props = { children: React.ReactNode; title?: string; subtitle?: string; actions?: React.ReactNode };

const navItems = [
  ["Dashboard", "/dashboard", "⌂"],
  ["Browse Jobs", "/jobs", "▣"],
  ["Post a Job", "/jobs/post", "+"],
  ["Manage Jobs", "/manage-jobs", "▤"],
  ["Applications", "/applications", "◫"],
  ["Messages", "/chat", "◌"],
  ["LeonardX AI", "/ai", "✦"],
  ["Premium", "/payments", "◇"],
  ["Transactions", "/transactions", "₦"],
  ["Alerts", "/notifications", "●"],
  ["Referrals", "/referrals", "🏅"],
  ["Profile", "/profile", "◉"],
];

export default function AppShell({ children, title, subtitle, actions }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => setMe(data?.user || null)).catch(() => setMe(null));
  }, []);

  const initials = (me?.fullName || "LeonardX").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const visibleItems = navItems.filter(([label]) => {
    if (["Post a Job", "Manage Jobs"].includes(label) && me?.role === "FREELANCER") return false;
    if (["LeonardX AI", "Applications"].includes(label) && me?.role === "CLIENT") return false;
    if (label === "LeonardX AI" && !me?.isPremium) return false;
    return true;
  });

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isActive = (href: string) => pathname === href || (href !== "/jobs" && pathname.startsWith(`${href}/`));

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" href="/dashboard"><span className="app-brand-mark">LX</span><span>Leonard<span>X</span></span></Link>
        <nav className="app-nav" aria-label="Main navigation">
          <p className="app-nav-label">WORKSPACE</p>
          {visibleItems.map(([label, href, icon]) => (
            <Link key={href} href={href} className={isActive(href) ? "app-nav-item active" : "app-nav-item"}>
              <span className="nav-icon">{icon}</span><span className="nav-label">{label}</span>
            </Link>
          ))}
          {me?.role === "ADMIN" && <Link href="/admin" className={pathname === "/admin" ? "app-nav-item active" : "app-nav-item"}><span className="nav-icon">⚙</span><span className="nav-label">Admin</span></Link>}
        </nav>
        <div className="sidebar-bottom">
          <Link href="/profile" className="sidebar-profile"><span className="avatar">{initials}</span><div><strong>{me?.fullName || "LeonardX User"}</strong><small>{me?.role?.toLowerCase() || "member"}</small></div></Link>
          <button className="logout-button" onClick={logout}>↪ <span>Log out</span></button>
        </div>
      </aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="page-title"><p className="page-kicker">LEONARDX WORKSPACE</p><h1>{title || "LeonardX"}</h1>{subtitle && <p>{subtitle}</p>}</div>
          {actions && <div className="topbar-actions">{actions}</div>}
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
