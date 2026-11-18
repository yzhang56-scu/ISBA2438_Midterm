"use client";

import { useState } from "react";

const initialState = { status: "idle", errors: {}, message: "" };

export default function ContactFormApi() {
  const [state, setState] = useState(initialState);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setState(initialState);
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });
      const result = await response.json();
      setState({
        status: result.status ?? "error",
        errors: result.errors ?? {},
        message:
          result.message ?? "Something went wrong. Please try again.",
      });
      if (result.status === "success") {
        form.reset();
      }
    } catch {
      setState({
        status: "error",
        errors: {},
        message: "Cannot reach the server. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form" noValidate>
      {state.status === "success" && (
        <p className="form-success" role="status">
          {state.message}
        </p>
      )}
      {state.status === "error" && state.message && (
        <p className="form-error-summary" role="alert">
          {state.message}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="api-name">Name</label>
        <input id="api-name" name="name" type="text" />
        {state.errors?.name && <p className="form-error">{state.errors.name}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="api-email">Email</label>
        <input id="api-email" name="email" type="email" />
        {state.errors?.email && (
          <p className="form-error">{state.errors.email}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="api-message">Message</label>
        <textarea id="api-message" name="message" rows={6} />
        {state.errors?.message && (
          <p className="form-error">{state.errors.message}</p>
        )}
      </div>
      <button type="submit" className="btn" disabled={sending}>
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
