"use client";
import {useEffect,useState} from "react"; import AppShell from "@/components/AppShell";
type Data={referralCode:string;referralCount:number;referrals:{id:string;fullName:string;createdAt:string}[];badges:{id:string;name:string;description:string;icon:string}[]};
export default function Referrals(){
  const[d,setD]=useState<Data|null>(null);const[msg,setMsg]=useState("");
  useEffect(()=>{fetch("/api/referrals").then(r=>r.json()).then(setD)},[]);
  const link=typeof window==="undefined"?"":`${window.location.origin}/signup?role=FREELANCER&ref=${d?.referralCode||""}`;
  const copy=async()=>{await navigator.clipboard.writeText(link);setMsg("Referral link copied successfully!")};
  return <AppShell title="Referrals & Badges" subtitle="Invite talented people, track successful signups and earn recognition.">
    <section className="referral-hero referral-hero-v2"><div><span className="eyebrow">LEONARDX COMMUNITY</span><h2>Grow together. Get recognised.</h2><p>Share your personal LeonardX link. When people join with your unique code, your referral activity is tracked automatically.</p><div className="referral-link"><div><span>Your unique referral link</span><code>{link || "Generating your link…"}</code></div><button type="button" onClick={copy}>Copy link</button></div>{msg&&<p className="status">{msg}</p>}</div><div className="referral-code-card"><span>YOUR CODE</span><strong>{d?.referralCode || "…"}</strong><small>Share it with friends</small></div></section>
    <section className="referral-stats-grid"><article><span>👥</span><div><b>{d?.referralCount||0}</b><p>Successful signups</p></div></article><article><span>🏅</span><div><b>{d?.badges.length||0}</b><p>Badges earned</p></div></article><article><span>✦</span><div><b>{Math.max(0,3-(d?.referralCount||0))}</b><p>More referrals to early ambassador</p></div></article></section>
    <section className="referral-progress"><div className="section-mini-heading"><div><span>YOUR PROGRESS</span><h2>Keep building your community</h2></div><p>{d?.referralCount||0} referral{(d?.referralCount||0)===1?"":"s"}</p></div><div className="progress-track"><span style={{width:`${Math.min(100,((d?.referralCount||0)/3)*100)}%`}}/></div><div className="progress-labels"><span>First user</span><span>3 referrals · Early ambassador</span></div></section>
    <section className="admin-section"><div className="section-mini-heading"><div><span>YOUR BADGES</span><h2>Achievements</h2></div><p>Recognition for growing LeonardX.</p></div><div className="badge-grid badge-grid-v2">{(d?.badges||[]).length?d!.badges.map(b=><article className="badge-card" key={b.id}><span>{b.icon}</span><h3>{b.name}</h3><p>{b.description}</p></article>):<div className="empty-state"><span>🏅</span><h2>No badges yet</h2><p>Your achievements will appear here as you grow your referrals.</p></div>}</div></section>
  </AppShell>
}
