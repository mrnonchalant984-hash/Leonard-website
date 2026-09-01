"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

type Job = { id:string; title:string; description:string; budget:number; client?:{fullName:string} };
export default function Jobs(){
  const [jobs,setJobs]=useState<Job[]>([]),[me,setMe]=useState<any>(null),[message,setMessage]=useState(""),[selected,setSelected]=useState(""),[cover,setCover]=useState("");
  useEffect(()=>{fetch('/api/jobs').then(r=>r.json()).then(d=>setJobs(Array.isArray(d)?d:[]));fetch('/api/auth/me').then(r=>r.json()).then(d=>setMe(d.user));},[]);
  async function apply(id:string){const r=await fetch('/api/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId:id,coverLetter:cover})});const d=await r.json();setMessage(r.ok?'Application submitted successfully.':d.error||'Could not apply');if(r.ok){setSelected('');setCover('');}}
  return <AppShell title="Browse Jobs" subtitle="Discover open work opportunities and find projects that match your skills." actions={me?.role==='CLIENT'?<Link className="primary-link top-action" href="/jobs/post">＋ Post a Job</Link>:null}>
    {message&&<p className="status app-alert">{message}</p>}
    <section className="jobs-toolbar"><div className="jobs-search">⌕ <input placeholder="Search jobs by title, skill or keyword..." /></div><div className="jobs-filter"><button>All Categories⌄</button><button>Latest⌄</button></div></section>
    <div className="list-grid">{jobs.length===0?<div className="empty-state"><span>▣</span><h2>No jobs available yet</h2><p>New opportunities will appear here as clients publish jobs.</p></div>:jobs.map(j=><article className="job-card" key={j.id}><div className="job-card-main"><div className="job-avatar">{j.title.slice(0,1).toUpperCase()}</div><div className="job-copy"><div className="job-heading"><div><h2>{j.title}</h2><div className="job-meta"><span>Open project</span>{j.client&&<span>Posted by {j.client.fullName}</span>}</div></div><strong>₦{j.budget.toLocaleString()}</strong></div><p>{j.description}</p>{me?.role==='FREELANCER'&&(selected===j.id?<div className="apply-box"><textarea value={cover} onChange={e=>setCover(e.target.value)} placeholder="Write a short cover letter"/><div><button onClick={()=>apply(j.id)}>Submit application</button><button className="ghost" onClick={()=>setSelected('')}>Cancel</button></div></div>:<button className="job-action" onClick={()=>setSelected(j.id)}>View & Apply →</button>)}</div></div></article>)}</div>
  </AppShell>
}
