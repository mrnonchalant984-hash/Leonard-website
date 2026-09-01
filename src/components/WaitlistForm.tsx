"use client";

import { FormEvent, useState } from "react";

const initialForm = {
  fullName: "",
  skill: "",
  email: "",
  portfolioUrl: "",
};

export default function WaitlistForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to join the waitlist.");
      }

      setStatus("success");
      setMessage(result.message || "Welcome to the LeonardX waitlist!");
      setForm(initialForm);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <form className="waitlist-form" onSubmit={handleSubmit}>
      <label>
        Full name
        <input
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Your full name"
          required
        />
      </label>

      <label>
        Your skill
        <input
          value={form.skill}
          onChange={(e) => setForm({ ...form, skill: e.target.value })}
          placeholder="e.g. UI/UX Designer"
          required
        />
      </label>

      <label>
        Email address
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Portfolio URL <span>(optional)</span>
        <input
          type="url"
          value={form.portfolioUrl}
          onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
          placeholder="https://yourportfolio.com"
        />
      </label>

      <button type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Joining..." : "Join the Waitlist"}
      </button>

      {message && (
        <p className={`form-message ${status}`} role="status">
          {message}
        </p>
      )}
    </form>
  );
}
