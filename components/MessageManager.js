"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MESSAGE_STATUSES = ["New", "Replied"];

const emptyForm = { name: "", email: "", message: "", status: "New" };

const initialState = { status: "idle", errors: {}, message: "" };

function statusClass(status) {
  if (status === "Replied") {
    return "flag status-replied";
  }
  return "flag flag-overview";
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function MessageManager() {
  const [submissions, setSubmissions] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(initialState);
  const [sending, setSending] = useState(false);
  const formCardRef = useRef(null);

  const load = useCallback(async () => {
    setLoadError(false);
    setSubmissions(null);
    try {
      const response = await fetch("/api/contact");
      const result = await response.json();
      if (
        !response.ok ||
        result.status !== "success" ||
        !Array.isArray(result.submissions)
      ) {
        throw new Error("failed to load messages");
      }
      setSubmissions(result.submissions);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setFeedback(initialState);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setFeedback(initialState);
    try {
      const response = await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        setFeedback({
          status: "error",
          errors: result.errors ?? {},
          message:
            result.message ?? "Something went wrong. Please try again.",
        });
        return;
      }
      const saved = result.submission;
      setSubmissions((current) =>
        current.map((item) => (item.id === editingId ? saved : item))
      );
      setFeedback({
        status: "success",
        errors: {},
        message: "Message updated.",
      });
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      setFeedback({
        status: "error",
        errors: {},
        message: "Cannot reach the server. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name ?? "",
      email: item.email ?? "",
      message: item.message ?? "",
      status: item.status ?? "New",
    });
    clearFeedback();
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    clearFeedback();
  }

  async function handleDelete(item) {
    if (
      !window.confirm(`Delete the message from ${item.name} (${item.email})?`)
    ) {
      return;
    }
    clearFeedback();
    try {
      const response = await fetch("/api/contact", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") {
        setFeedback({
          status: "error",
          errors: {},
          message:
            result.message ?? "Something went wrong. Please try again.",
        });
        return;
      }
      setSubmissions((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      if (editingId === item.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setFeedback({
        status: "success",
        errors: {},
        message: "Message deleted.",
      });
    } catch {
      setFeedback({
        status: "error",
        errors: {},
        message: "Cannot reach the server. Please try again.",
      });
    }
  }

  return (
    <>
      <section className="contact-card" ref={formCardRef}>
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          {editingId && (
            <p className="form-success" role="status">
              Editing the message from “{form.name}”.
            </p>
          )}
          {feedback.status === "success" && feedback.message && (
            <p className="form-success" role="status">
              {feedback.message}
            </p>
          )}
          {feedback.status === "error" && feedback.message && (
            <p className="form-error-summary" role="alert">
              {feedback.message}
            </p>
          )}
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="msg-name">Name</label>
              <input
                id="msg-name"
                name="name"
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
              {feedback.errors?.name && (
                <p className="form-error">{feedback.errors.name}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="msg-email">Email</label>
              <input
                id="msg-email"
                name="email"
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
              />
              {feedback.errors?.email && (
                <p className="form-error">{feedback.errors.email}</p>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="msg-status">Status</label>
              <select
                id="msg-status"
                name="status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {MESSAGE_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="msg-date">Received</label>
              <input
                id="msg-date"
                name="date"
                type="text"
                value={
                  editingId
                    ? formatDate(
                        submissions?.find((item) => item.id === editingId)
                          ?.submittedAt
                      )
                    : ""
                }
                disabled
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="msg-message">Message</label>
            <textarea
              id="msg-message"
              name="message"
              rows={6}
              value={form.message}
              onChange={(event) => updateField("message", event.target.value)}
            />
            {feedback.errors?.message && (
              <p className="form-error">{feedback.errors.message}</p>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn" disabled={sending}>
              {sending ? "Saving..." : "Save Changes"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleCancelEdit}
                disabled={sending}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-sec">
        <h2>Messages ({submissions?.length ?? 0})</h2>
        {submissions === null && !loadError && (
          <p className="project-desc" role="status">
            Loading messages...
          </p>
        )}
        {loadError && (
          <div className="detail-placeholder">
            <p>Cannot load messages right now. Please try again.</p>
            <p className="back-link">
              <button type="button" className="btn" onClick={load}>
                Try Again
              </button>
            </p>
          </div>
        )}
        {submissions !== null && !loadError && submissions.length === 0 && (
          <div className="detail-placeholder">
            No messages yet. New submissions from your contact forms will
            appear here.
          </div>
        )}
        {submissions !== null && !loadError && submissions.length > 0 && (
          <div className="showcase">
            {submissions.map((item) => (
              <article key={item.id} className="card project-card">
                <div className="project-top">
                  <div>
                    <p className="work-eyebrow">{item.email}</p>
                    <h3>{item.name}</h3>
                    <p className="card-meta">
                      {formatDate(item.submittedAt)}
                    </p>
                  </div>
                  <span className={statusClass(item.status)}>
                    {item.status}
                  </span>
                </div>
                <p className="project-desc">{item.message}</p>
                <div className="card-actions">
                  <button type="button" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
