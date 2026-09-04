"use client";

import { formatDistanceToNow } from "date-fns";

const ONLINE_WINDOW_MS = 90_000;

export default function OnlineDot({
  isOnline,
  lastSeen,
  compact = false,
}: {
  isOnline?: boolean;
  lastSeen?: string | Date | null;
  compact?: boolean;
}) {
  const recent = lastSeen ? Date.now() - new Date(lastSeen).getTime() < ONLINE_WINDOW_MS : false;
  const online = Boolean(isOnline && recent);

  if (online) {
    return (
      <span className={`online-status ${compact ? "online-status-compact" : ""}`}>
        <span className="online-dot" aria-hidden="true" />Online
      </span>
    );
  }

  if (!lastSeen) return <span className="online-status offline">Offline</span>;
  return (
    <span className={`online-status offline ${compact ? "online-status-compact" : ""}`}>
      Last seen {formatDistanceToNow(new Date(lastSeen), { addSuffix: true })}
    </span>
  );
}
