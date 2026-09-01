"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignupContent() {
  const search = useSearchParams();
  const router = useRouter();

  const initial =
    search.get("role") === "CLIENT" ? "CLIENT" : "FREELANCER";

  const [role, setRole] = useState<"CLIENT" | "FREELANCER">(initial);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const f = new FormData(e.currentTarget);

      const r = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...Object.fromEntries(f),
          role,
        }),
      });

      const d = await r.json();

      if (r.ok) {
        router.push("/dashboard");
      } else {
        setError(d.error || "Could not create account");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-brand">
        <Link className="brand" href="/">
          <span className="brand-mark">LX</span>
          Leonard<span>X</span>
        </Link>
      </div>

      <section className="auth-layout signup-layout">
        <div className="auth-aside">
          <span className="eyebrow">JOIN LEONARDX</span>

          <h2>Start your journey with the right workspace.</h2>

          <p>
            Create an account, discover opportunities, collaborate with
            confidence, and grow with tools built for the future of work.
          </p>

          <div className="auth-points">
            <span>▣ Discover meaningful opportunities</span>
            <span>◌ Build professional relationships</span>
            <span>✦ Unlock more with LeonardX AI</span>
          </div>
        </div>

        <div className="auth-card">
          <Link href="/" className="back">
            ← Back to LeonardX
          </Link>

          <h1>Create your account</h1>

          <p>
            Choose how you want to use LeonardX and get started.
          </p>

          <div className="role-switch">
            <button
              type="button"
              onClick={() => setRole("FREELANCER")}
              className={role === "FREELANCER" ? "active" : ""}
            >
              ✦ Freelancer
            </button>

            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className={role === "CLIENT" ? "active" : ""}
            >
              ▣ Client
            </button>
          </div>

          <form onSubmit={submit} className="app-form">
            <label>
              Full name
              <input
                name="fullName"
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Phone number <small>Optional</small>
              <input
                name="phone"
                placeholder="Enter your phone number"
              />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                minLength={6}
                placeholder="Minimum 6 characters"
                required
              />
            </label>

            <button disabled={loading}>
              {loading ? "Creating account..." : "Create account →"}
            </button>

            {error && <p className="error">{error}</p>}
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link href="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default function Signup() {
  return (
    <Suspense
      fallback={
        <main className="auth-page">
          <div className="auth-brand">
            <Link className="brand" href="/">
              <span className="brand-mark">LX</span>
              Leonard<span>X</span>
            </Link>
          </div>
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}