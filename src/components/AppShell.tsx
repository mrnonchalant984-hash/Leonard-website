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
  ["Payments / Premium", "/payments", "◇"],
  ["Transactions", "/transactions", "₦"],
  ["Notifications", "/notifications", "●"],
  ["Referrals & Badges", "/referrals", "🏅"],
  ["Profile & Settings", "/profile", "◉"],
];

export default function AppShell({ children, title, subtitle, actions }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setMe(data?.user || null))
      .catch(() => setMe(null));
  }, []);

  const initials = (me?.fullName || "LeonardX")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link className="app-brand" href="/dashboard">
          <span className="app-brand-mark">LX</span>
          <span>Leonard<span>X</span></span>
        </Link>

        <nav className="app-nav" aria-label="Main navigation">
          <p className="app-nav-label">WORKSPACE</p>
          {navItems.map(([label, href, icon]) => {
            const active = pathname === href || (href !== "/jobs" && pathname.startsWith(`${href}/`));
            if (["Post a Job","Manage Jobs"].includes(label) && me?.role === "FREELANCER") return null;
            if (["LeonardX AI","Applications"].includes(label) && me?.role === "CLIENT") return null;
            if (label === "LeonardX AI" && !me?.isPremium) return null;
            return (
              <Link key={href} href={href} className={active ? "app-nav-item active" : "app-nav-item"}>
                <span className="nav-icon">{icon}</span>
                <span>{label}</span>
              </Link>
            );
          })}
          {me?.role === "ADMIN" && (
            <Link href="/admin" className={pathname === "/admin" ? "app-nav-item active" : "app-nav-item"}>
              <span className="nav-icon">⚙</span><span>Admin Controls</span>
            </Link>
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-profile">
            <span className="avatar">{initials}</span>
            <div><strong>{me?.fullName || "LeonardX User"}</strong><small>{me?.role?.toLowerCase() || "member"}</small></div>
          </div>
          <button className="logout-button" onClick={logout}>↪ <span>Log out</span></button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="page-title"><h1>{title || "LeonardX"}</h1>{subtitle && <p>{subtitle}</p>}</div>
          <div className="topbar-actions">{actions}</div>
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
