"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import OnlineDot from "@/components/OnlineDot";

type User = { id: string; fullName: string; role: string; email?: string; isOnline?: boolean; lastSeen?: string | null };
type Message = { id: string; senderId: string; receiverId: string; body: string; createdAt: string };

export default function Chat() {
  const [users, setUsers] = useState<User[]>([]);
  const [other, setOther] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadUsers = () => {
      fetch("/api/users", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled) setUsers(Array.isArray(d) ? d : []);
        })
        .catch(() => {});
    };
    loadUsers();
    const id = window.setInterval(loadUsers, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    if (!other) {
      setMessages([]);
      return;
    }

    const load = () =>
      fetch("/api/messages?with=" + encodeURIComponent(other), { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setMessages(Array.isArray(d) ? d : []))
        .catch(() => {});

    load();
    const id = window.setInterval(load, 5_000);
    return () => window.clearInterval(id);
  }, [other]);

  async function send() {
    if (!other || !body.trim()) return;
    setStatus("");
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: other, body }),
    });
    const d = await r.json();
    if (r.ok) {
      setBody("");
      setMessages((m) => (m.some((x) => x.id === d.id) ? m : [...m, d]));
    } else {
      setStatus(d.error || "Message failed");
    }
  }

  const active = users.find((u) => u.id === other);

  return (
    <AppShell title="Messages" subtitle="Connect and collaborate with people on LeonardX.">
      <div className="chat-layout">
        <aside>
          <div className="chat-sidebar-head"><h2>People</h2><span>{users.length}</span></div>
          <div className="people-list">
            {users.map((u) => (
              <button className={other === u.id ? "user active-user" : "user"} key={u.id} onClick={() => setOther(u.id)}>
                <span className="person-avatar">{u.fullName.slice(0, 1).toUpperCase()}</span>
                <span className="person-details"><b>{u.fullName}</b><small>{u.role.toLowerCase()} · <OnlineDot isOnline={u.isOnline} lastSeen={u.lastSeen} compact /></small></span>
              </button>
            ))}
          </div>
        </aside>
        <section className="chat-panel">
          {other ? (
            <>
              <div className="chat-panel-head"><span className="person-avatar">{active?.fullName.slice(0, 1).toUpperCase()}</span><div><strong>{active?.fullName}</strong><small><OnlineDot isOnline={active?.isOnline} lastSeen={active?.lastSeen} /></small></div></div>
              <div className="message-list">
                {messages.length === 0 ? <p className="chat-empty">No messages yet. Start the conversation.</p> : messages.map((m) => <div key={m.id} className="message"><p>{m.body}</p><small>{new Date(m.createdAt).toLocaleString()}</small></div>)}
              </div>
              <div className="composer"><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message..."/><button onClick={send}>Send →</button></div>
            </>
          ) : <div className="chat-empty-screen"><span>◌</span><h2>Your conversations, in one place.</h2><p>Select a person from the list to start chatting.</p></div>}
          {status && <p className="error">{status}</p>}
        </section>
      </div>
    </AppShell>
  );
}
