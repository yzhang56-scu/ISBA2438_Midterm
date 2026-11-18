"use client";

import { useState } from "react";

export default function LoginForm({ next }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: String(formData.get("password") ?? ""),
          next,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok && result.status === "success") {
        window.location.assign(next);
        return;
      }
      setError(
        result.message || "Login failed. Please try again."
      );
      setPending(false);
    } catch {
      setError("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  return (
    <form className="form" action="/api/auth/login" method="POST" onSubmit={handleSubmit}>
      <input type="hidden" name="next" value={next} />
      <div className="form-row">
        <label htmlFor="password">Admin password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Enter the admin password"
          required
          autoComplete="current-password"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn btn-dark" disabled={pending}>
          {pending ? "Checking..." : "Log In"}
        </button>
      </div>
      {error && (
        <p className="form-error-summary" role="alert">{error}</p>
      )}
    </form>
  );
}
