"use client";

import { useEffect, useState } from "react";

export default function WaitlistCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCount() {
      try {
        const response = await fetch("/api/waitlist/count", {
          cache: "no-store",
        });
        const data = await response.json();
        if (active && response.ok) setCount(data.count);
      } catch {
        // Keep the landing page usable even if the count endpoint is unavailable.
      }
    }

    loadCount();
    const timer = window.setInterval(loadCount, 15000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="waitlist-count" aria-live="polite">
      <strong>{count === null ? "..." : count.toLocaleString()}</strong>
      <span>people already on the waitlist</span>
    </div>
  );
}
