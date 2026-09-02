"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { PAYMENT_PLANS } from "@/lib/payment-plans";

type Payment = { id: string; plan: string; status: string; amount: number; createdAt: string; reference: string; receiptFilename?: string; adminNote?: string | null };

export default function Payments() {
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plan, setPlan] = useState<keyof typeof PAYMENT_PLANS>("Premium AI Access");
  const apkUrl = process.env.NEXT_PUBLIC_APK_DOWNLOAD_URL;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const amount = PAYMENT_PLANS[plan].amount;

  const load = () => fetch("/api/payments").then((r) => r.json()).then((d) => setPayments(d.payments || []));
  useEffect(() => { load(); }, []);

  const aiUnlocked = payments.some((p) => p.status === "APPROVED" && p.plan === "Premium AI Access");
  const apkUnlocked = payments.some((p) => p.status === "APPROVED" && p.plan === "Premium APK Download");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setMsg("");
    try {
      const form = new FormData(e.currentTarget);
      const file = form.get("receipt");
      if (!(file instanceof File) || !file.size) throw new Error("Choose a payment proof file first.");

      let up: Response;
      if (cloudName && uploadPreset) {
        // Fast path: browser uploads directly to an unsigned Cloudinary preset.
        const cloudForm = new FormData();
        cloudForm.append("file", file);
        cloudForm.append("upload_preset", uploadPreset);
        const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: cloudForm });
        const cloudData = await cloudResponse.json();
        if (!cloudResponse.ok || !cloudData.secure_url) throw new Error(cloudData?.error?.message || "Cloudinary upload failed");
        up = await fetch("/api/uploads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, url: cloudData.secure_url, mimeType: file.type, size: file.size }) });
      } else {
        // Safe fallback: Vercel sends the file to our server route, which uses private Cloudinary variables.
        const serverForm = new FormData();
        serverForm.append("file", file);
        up = await fetch("/api/uploads", { method: "POST", body: serverForm });
      }
      const upload = await up.json();
      if (!up.ok) throw new Error(upload.error || "Could not upload payment proof");

      const res = await fetch("/api/payments/initiate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, plan, receiptUrl: upload.url, receiptFilename: upload.filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment submission failed");
      e.currentTarget.reset();
      setMsg(data.message); load();
    } catch (error) {
      setMsg(error instanceof Error ? error.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return <AppShell title="Payments & Premium" subtitle="Pay manually, upload proof, then wait for admin approval.">
    <section className="payment-card">
      <div className="payment-heading"><span className="payment-icon">♔</span><div><span className="eyebrow">LEONARDX PREMIUM</span><h2>Your unlocked access</h2><p>Premium features unlock automatically after the admin approves your payment proof.</p></div></div>
      <div className="premium-actions">
        {aiUnlocked ? <Link className="primary-button" href="/ai">Open LeonardX AI →</Link> : <span className="locked-action">🔒 LeonardX AI — Premium AI Access required</span>}
        {apkUnlocked ? (apkUrl ? <a className="primary-button" href={apkUrl} target="_blank" rel="noreferrer">Download LeonardX APK →</a> : <span className="locked-action">APK approved — add NEXT_PUBLIC_APK_DOWNLOAD_URL to Vercel.</span>) : <span className="locked-action">🔒 APK Download — Premium APK Download required</span>}
      </div>
      <div className="account-box"><div><span>OPay Account Number</span><strong>0837624782</strong></div><div><span>Account Name</span><strong>Leonard mary philip udoh</strong></div><span className="account-shield">◈</span></div>
      <form onSubmit={submit} className="app-form">
        <label>Choose a plan<select name="plan" value={plan} onChange={(e) => setPlan(e.target.value as keyof typeof PAYMENT_PLANS)}>{Object.keys(PAYMENT_PLANS).map((name) => <option key={name}>{name}</option>)}</select><small>{PAYMENT_PLANS[plan].description}</small></label>
        <label>Amount in NGN<input name="amount" type="number" value={amount} readOnly /></label>
        <label>Payment proof <small>PDF, JPG, PNG or WebP · maximum 10MB</small><input name="receipt" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required /></label>
        <button disabled={loading}>{loading ? "Submitting..." : "Upload proof & submit for review →"}</button>
      </form>
      {msg && <p className="status app-alert">{msg}</p>}
    </section>
    <section className="admin-section"><div className="section-mini-heading"><div><span>YOUR SUBMISSIONS</span><h2>Payment status</h2></div><p>{payments.length} total</p></div><div className="admin-list">{payments.length === 0 ? <div className="empty-state"><span>◇</span><h2>No payment submissions yet</h2><p>After paying manually, upload your proof here for admin review.</p></div> : payments.map((p) => <article key={p.id} className="payment-row"><div><b>{p.plan}</b><p>₦{p.amount.toLocaleString()} · {new Date(p.createdAt).toLocaleString()}</p><small>{p.reference}{p.receiptFilename ? ` · ${p.receiptFilename}` : ""}</small>{p.adminNote && <small className="admin-note">Admin note: {p.adminNote}</small>}</div><span className={`payment-status ${p.status.toLowerCase()}`}>{p.status}</span></article>)}</div></section>
  </AppShell>;
}
