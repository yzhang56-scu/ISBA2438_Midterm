"use client";

import { useState } from "react";

const initialState = { status: "idle", errors: {}, message: "" };

export default function BlogForm() {
  const [state, setState] = useState(initialState);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setSending(true);
    setState(initialState);
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
        }),
      });
      const result = await response.json();
      let message =
        result.message ?? "Something went wrong. Please try again.";
      if (result.status === "success" && result.post?.slug) {
        message = `${message} Slug: ${result.post.slug}`;
      }
      setState({
        status: result.status ?? "error",
        errors: result.errors ?? {},
        message,
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
        <label htmlFor="blog-title">Title</label>
        <input id="blog-title" name="title" type="text" />
        {state.errors?.title && (
          <p className="form-error">{state.errors.title}</p>
        )}
      </div>
      <div className="form-field">
        <label htmlFor="blog-content">Content</label>
        <textarea id="blog-content" name="content" rows={10} />
        {state.errors?.content && (
          <p className="form-error">{state.errors.content}</p>
        )}
      </div>
      <button type="submit" className="btn" disabled={sending}>
        {sending ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}
