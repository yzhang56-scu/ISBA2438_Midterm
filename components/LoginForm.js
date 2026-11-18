"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/login/actions";

export default function LoginForm({ next }) {
  const [state, formAction, pending] = useActionState(loginAction, {
    status: "empty",
  });

  return (
    <form className="form" action={formAction}>
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
      {state?.status === "error" && (
        <p className="form-error-summary" role="alert">{state.message}</p>
      )}
    </form>
  );
}
