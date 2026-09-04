"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";

function keyToBytes(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { fetch("/api/settings/notifications").then(r => r.json()).then(d => setEnabled(Boolean(d.enabled))); }, []);

  async function toggle(next: boolean) {
    setBusy(true); setMessage("");
    try {
      if (next) {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) throw new Error("This browser does not support web notifications.");
        if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) throw new Error("Web Push is not configured yet. Add the VAPID public key to your environment.");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("Notification permission was not granted.");
        const registration = await navigator.serviceWorker.register("/sw.js");
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) });
        const subscribe = await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
        if (!subscribe.ok) throw new Error("Could not save your notification subscription.");
      } else {
        const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration("/sw.js") : null;
        const subscription = await registration?.pushManager.getSubscription();
        await fetch("/api/push/unsubscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ endpoint: subscription?.endpoint || "" }) });
        await subscription?.unsubscribe();
      }
      const r = await fetch("/api/settings/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ enabled: next }) });
      const d = await r.json(); if (!r.ok) throw new Error(d.error || "Could not update setting.");
      setEnabled(next); setMessage(next ? "Notifications enabled. You will receive job and message alerts instantly." : "Notifications disabled.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Could not update notifications."); }
    finally { setBusy(false); }
  }

  return <AppShell title="Notification Settings" subtitle="Choose whether LeonardX can send instant browser alerts for important activity."><section className="settings-card"><div className="settings-card-icon">🔔</div><div className="settings-copy"><span className="eyebrow">WEB PUSH</span><h2>Instant job & message alerts</h2><p>Get notified when you receive a new message, when a freelancer sends a proposal, and when important escrow activity needs your attention.</p></div><div className="notification-toggle-row"><div><strong>Browser notifications</strong><small>{enabled ? "Enabled on this account" : "Currently disabled"}</small></div><button className={enabled ? "toggle enabled" : "toggle"} onClick={() => toggle(!enabled)} disabled={busy} aria-pressed={enabled}><span /></button></div>{message && <p className="status app-alert">{message}</p>}</section></AppShell>;
}
