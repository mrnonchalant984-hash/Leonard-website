"use client";

import { useEffect } from "react";

const INTERVAL_MS = 30_000;

export default function PresenceHeartbeat() {
  useEffect(() => {
    let active = true;

    const ping = async () => {
      if (!active) return;
      try {
        await fetch("/api/users/heartbeat", { method: "POST", cache: "no-store" });
      } catch {
        // A temporary network failure is harmless; the next heartbeat retries.
      }
    };

    void ping();
    const timer = window.setInterval(ping, INTERVAL_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void ping();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
