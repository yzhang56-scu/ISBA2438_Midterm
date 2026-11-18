"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const SECTION_OPTIONS = [
  { value: 1, label: "Market & Customer Intelligence" },
  { value: 2, label: "Go-to-Market & Growth Strategy" },
  { value: 3, label: "Sales & Business Operations" },
];

const emptyForm = {
  title: "",
  section: 1,
  type: "overview",
  github: "",
  description: "",
  tags: "",
  details: "",
};

const initialState = { status: "idle", errors: {}, message: "" };

function sectionLabel(value) {
  return (
    SECTION_OPTIONS.find((option) => option.value === value)?.label ??
    "Uncategorized"
  );
}

function toLines(text) {
  return String(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function ProjectManager() {
  const [projects, setProjects] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(initialState);
  const [sending, setSending] = useState(false);
  const formCardRef = useRef(null);

  const load = useCallback(async () => {
    setLoadError(false);
    setProjects(null);
    try {
      const response = await fetch("/api/projects");
      const result = await response.json();
      if (
        !response.ok ||
        result.status !== "success" ||
        !Array.isArray(result.projects)
      ) {
        throw new Error("failed to load projects");
      }
      setProjects(result.projects);
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
      title: form.title,
      section: Number(form.section),
      type: form.type,
      github: form.github,
      description: form.description,
      tags: toLines(form.tags),
    };
    if (form.type === "case-study") {
      try {
        payload.details = form.details.trim()
          ? JSON.parse(form.details)
          : [];
      } catch {
        setFeedback({
          status: "error",
          errors: {},
          message: "Details must be valid JSON (an array of detail blocks).",
        });
        setSending(false);
        return;
      }
    }
    try {
      const response = await fetch("/api/projects", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
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
      const saved = result.project;
      if (editingId) {
        setProjects((current) =>
          current.map((item) => (item.id === editingId ? saved : item))
        );
        setFeedback({
          status: "success",
          errors: {},
          message: saved.slug
            ? `Project updated. Slug: ${saved.slug}`
            : "Project updated.",
        });
      } else {
        setProjects((current) => [saved, ...current]);
        setFeedback({
          status: "success",
          errors: {},
          message: saved.slug
            ? `Project added. Slug: ${saved.slug}`
            : "Project added.",
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
      title: item.title ?? "",
      section: item.section ?? 1,
      type: item.type ?? "overview",
      github: item.github ?? "",
      description: item.description ?? "",
      tags: Array.isArray(item.tags) ? item.tags.join("\n") : "",
      details:
        item.type === "case-study" && Array.isArray(item.details)
          ? JSON.stringify(item.details, null, 2)
          : "",
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
    if (!window.confirm(`Delete the project “${item.title}”?`)) {
      return;
    }
    clearFeedback();
    try {
      const response = await fetch("/api/projects", {
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
      setProjects((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      if (editingId === item.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setFeedback({
        status: "success",
        errors: {},
        message: "Project deleted.",
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
              Editing “{form.title}”.
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
          <div className="form-field">
            <label htmlFor="project-title">Title</label>
            <input
              id="project-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
            {feedback.errors?.title && (
              <p className="form-error">{feedback.errors.title}</p>
            )}
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="project-section">Category</label>
              <select
                id="project-section"
                name="section"
                value={form.section}
                onChange={(event) =>
                  updateField("section", Number(event.target.value))
                }
              >
                {SECTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {feedback.errors?.section && (
                <p className="form-error">{feedback.errors.section}</p>
              )}
            </div>
            <div className="form-field">
              <label htmlFor="project-type">Type</label>
              <select
                id="project-type"
                name="type"
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
              >
                <option value="overview">Overview Only</option>
                <option value="case-study">Case Study (detail page)</option>
              </select>
              {feedback.errors?.type && (
                <p className="form-error">{feedback.errors.type}</p>
              )}
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="project-github">GitHub URL (optional)</label>
            <input
              id="project-github"
              name="github"
              type="text"
              value={form.github}
              onChange={(event) => updateField("github", event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="project-description">Short Description</label>
            <textarea
              id="project-description"
              name="description"
              rows={3}
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
            />
            {feedback.errors?.description && (
              <p className="form-error">{feedback.errors.description}</p>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="project-tags">Tags (one per line)</label>
            <textarea
              id="project-tags"
              name="tags"
              rows={3}
              value={form.tags}
              onChange={(event) => updateField("tags", event.target.value)}
            />
          </div>
          {form.type === "case-study" && (
            <div className="form-field">
              <label htmlFor="project-details">
                Details (JSON array — each block: heading, body, metrics,
                points)
              </label>
              <textarea
                id="project-details"
                name="details"
                rows={10}
                value={form.details}
                onChange={(event) =>
                  updateField("details", event.target.value)
                }
              />
              {feedback.errors?.details && (
                <p className="form-error">{feedback.errors.details}</p>
              )}
            </div>
          )}
          <div className="form-actions">
            <button type="submit" className="btn" disabled={sending}>
              {sending
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Add Project"}
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
        <h2>Projects ({projects?.length ?? 0})</h2>
        {projects === null && !loadError && (
          <p className="project-desc" role="status">
            Loading projects...
          </p>
        )}
        {loadError && (
          <div className="detail-placeholder">
            <p>Cannot load projects right now. Please try again.</p>
            <p className="back-link">
              <button type="button" className="btn" onClick={load}>
                Try Again
              </button>
            </p>
          </div>
        )}
        {projects !== null && !loadError && projects.length === 0 && (
          <div className="detail-placeholder">
            No projects yet. Add your first one using the form above.
          </div>
        )}
        {projects !== null && !loadError && projects.length > 0 && (
          <div className="showcase">
            {projects.map((item) => (
              <article key={item.id} className="card project-card">
                <div className="project-top">
                  <h3>{item.title}</h3>
                  <span
                    className={`flag ${
                      item.type === "case-study" ? "flag-case" : "flag-overview"
                    }`}
                  >
                    {item.type === "case-study" ? "Case Study" : "Overview"}
                  </span>
                </div>
                <p className="card-meta">
                  {sectionLabel(item.section)}
                  {item.slug ? ` · /projects/${item.slug}` : ""}
                </p>
                <p className="project-desc">{item.description}</p>
                <div className="card-actions">
                  {item.slug && (
                    <Link href={`/projects/${item.slug}`} className="btn">
                      View
                    </Link>
                  )}
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
