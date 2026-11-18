"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/contact-me-server-form/actions";

const initialState = { status: "idle", errors: {}, message: "" };

export default function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    initialState
  );

  return (
    <form action={formAction} className="contact-form" noValidate>
      {state.status === "success" && (
        <p className="form-success" role="status">
          {state.message}
        </p>
      )}
      {state.status === "error" && (
        <p className="form-error-summary" role="alert">
          {state.message}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" type="text" />
        {state.errors?.name && <p className="form-error">{state.errors.name}</p>}
      </div>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" />
        {state.errors?.email && (
          <p className="form-error">{state.errors.email}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="message">Message</label>
        <textarea id="message" name="message" rows={6} />
        {state.errors?.message && (
          <p className="form-error">{state.errors.message}</p>
        )}
      </div>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
