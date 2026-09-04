"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export default function RequestNotification() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) return;
    if (Notification.permission === "granted" || Notification.permission === "denied") return;
    if (localStorage.getItem("leonardx-notification-dismissed") === "1") return;
    setVisible(true);
  }, []);

  async function allow() {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setVisible(false);
        localStorage.setItem("leonardx-notification-dismissed", "1");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await fetch("/api/push/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(subscription) });
      setVisible(false);
    } finally {
      setBusy(false);
    }
  }

  if (!visible) return null;
  return <div className="notification-permission"><div><span className="notification-permission-icon">🔔</span><div><strong>Stay updated on LeonardX</strong><p>Allow notifications to get job alerts instantly.</p></div></div><div className="notification-permission-actions"><button className="ghost" onClick={() => { setVisible(false); localStorage.setItem("leonardx-notification-dismissed", "1"); }}>Not now</button><button onClick={allow} disabled={busy}>{busy ? "Enabling..." : "Allow notifications"}</button></div></div>;
}
