"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const emptyForm = {
  company: "",
  role: "",
  short: "",
  location: "",
  period: "",
  achievements: "",
  metrics: "",
};

const initialState = { status: "idle", errors: {}, message: "" };

function toLines(text) {
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function toText(lines) {
  return Array.isArray(lines) ? lines.join("\n") : "";
}

export default function ExperienceManager() {
  const [experiences, setExperiences] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(initialState);
  const [sending, setSending] = useState(false);
  const formCardRef = useRef(null);

  const load = useCallback(async () => {
    setLoadError(false);
    setExperiences(null);
    try {
      const response = await fetch("/api/experience");
      const result = await response.json();
      if (
        !response.ok ||
        result.status !== "success" ||
        !Array.isArray(result.experiences)
      ) {
        throw new Error("failed to load experiences");
      }
      setExperiences(result.experiences);
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
    const payload = {
      company: form.company,
      role: form.role,
      short: form.short,
      location: form.location,
      period: form.period,
      achievements: toLines(form.achievements),
      metrics: toLines(form.metrics),
    };
    try {
      const response = await fetch("/api/experience", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...payload } : payload
        ),
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
      const saved = result.experience;
      if (editingId) {
        setExperiences((current) =>
          current.map((item) => (item.id === editingId ? saved : item))
        );
        setFeedback({
          status: "success",
          errors: {},
          message: "Experience updated.",
        });
      } else {
        setExperiences((current) => [saved, ...current]);
        setFeedback({
          status: "success",
          errors: {},
          message: "Experience added.",
        });
      }
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
      company: item.company ?? "",
      role: item.role ?? "",
      short: item.short ?? "",
      location: item.location ?? "",
      period: item.period ?? "",
      achievements: toText(item.achievements),
      metrics: toText(item.metrics),
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
    if (!window.confirm(`Delete the ${item.role} role at ${item.company}?`)) {
      return;
    }
    clearFeedback();
    try {
      const response = await fetch("/api/experience", {
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
      setExperiences((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      if (editingId === item.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setFeedback({
        status: "success",
        errors: {},
        message: "Experience deleted.",
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
              Editing “{form.company} — {form.role}”.
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
              <label htmlFor="exp-company">Company</label>
              <input
                id="exp-company"
                name="company"
                type="text"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
              {feedback.errors?.company && (
                <p className="form-error">{feedback.errors.company}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="exp-role">Role</label>
              <input
                id="exp-role"
                name="role"
                type="text"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              />
              {feedback.errors?.role && (
                <p className="form-error">{feedback.errors.role}</p>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="exp-short">Badge Short Name</label>
              <input
                id="exp-short"
                name="short"
                type="text"
                value={form.short}
                onChange={(event) => updateField("short", event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="exp-location">Location</label>
              <input
                id="exp-location"
                name="location"
                type="text"
                value={form.location}
                onChange={(event) =>
                  updateField("location", event.target.value)
                }
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="exp-period">Period</label>
            <input
              id="exp-period"
              name="period"
              type="text"
              placeholder="e.g. 2024.06 – 2025.05"
              value={form.period}
              onChange={(event) => updateField("period", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="exp-achievements">
              Achievements (one per line)
            </label>
            <textarea
              id="exp-achievements"
              name="achievements"
              rows={5}
              value={form.achievements}
              onChange={(event) =>
                updateField("achievements", event.target.value)
              }
            />
          </div>
          <div className="form-field">
            <label htmlFor="exp-metrics">Metric Highlights (one per line)</label>
            <textarea
              id="exp-metrics"
              name="metrics"
              rows={3}
              value={form.metrics}
              onChange={(event) => updateField("metrics", event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn" disabled={sending}>
              {sending
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Experience"}
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
        <h2>Entries ({experiences?.length ?? 0})</h2>
        {experiences === null && !loadError && (
          <p className="project-desc" role="status">
            Loading experiences...
          </p>
        )}
        {loadError && (
          <div className="detail-placeholder">
            <p>Cannot load experiences right now. Please try again.</p>
            <p className="back-link">
              <button type="button" className="btn" onClick={load}>
                Try Again
              </button>
            </p>
          </div>
        )}
        {experiences !== null && !loadError && experiences.length === 0 && (
          <div className="detail-placeholder">
            No experiences yet. Add your first one using the form above.
          </div>
        )}
        {experiences !== null && !loadError && experiences.length > 0 && (
          <div className="showcase">
            {experiences.map((item) => (
              <article key={item.id} className="card work-card">
                <span className="logo-badge logo-text">
                  {item.short || item.company}
                </span>
                <div>
                  <p className="work-eyebrow">{item.role}</p>
                  <h3>{item.company}</h3>
                  <p className="card-meta">
                    {[item.location, item.period].filter(Boolean).join(" · ")}
                  </p>
                  {item.achievements?.length > 0 && (
                    <div className="points">
                      {item.achievements.map((achievement) => (
                        <p key={achievement} className="point">
                          {achievement}
                        </p>
                      ))}
                    </div>
                  )}
                  {item.metrics?.length > 0 && (
                    <div className="metric-boxes">
                      {item.metrics.map((metric) => (
                        <span key={metric} className="metric-box">
                          {metric}
                        </span>
                      ))}
                    </div>
                  )}
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
