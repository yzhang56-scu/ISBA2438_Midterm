"use client";

import { useEffect, useRef, useState } from "react";
import {
  STATUS_OPTIONS,
  compareApplications,
  formatDate,
  loadApplications,
  makeId,
  saveApplications,
  statusClass,
} from "@/lib/job-tracker";

const emptyForm = {
  company: "",
  position: "",
  status: "Applied",
  dateApplied: "",
  notes: "",
};

export default function JobTracker() {
  const [applications, setApplications] = useState([]);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState({
    status: "idle",
    errors: {},
    message: "",
  });
  const formCardRef = useRef(null);

  useEffect(() => {
    setApplications(loadApplications(window.localStorage));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    if (!saveApplications(window.localStorage, applications)) {
      setFeedback({
        status: "error",
        errors: {},
        message:
          "Cannot save to this browser. Your changes may be lost after refresh.",
      });
    }
  }, [applications, hydrated]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearFeedback() {
    setFeedback({ status: "idle", errors: {}, message: "" });
  }

  function handleSubmit(event) {
    event.preventDefault();
    const company = form.company.trim();
    const position = form.position.trim();
    const status = STATUS_OPTIONS.includes(form.status)
      ? form.status
      : "Wishlist";
    const dateApplied = form.dateApplied;
    const notes = form.notes.trim();

    const errors = {};
    if (!company) {
      errors.company = "Please enter the company name.";
    }
    if (!position) {
      errors.position = "Please enter the position.";
    }
    if (Object.keys(errors).length > 0) {
      setFeedback({
        status: "error",
        errors,
        message: "Please fix the highlighted fields and try again.",
      });
      return;
    }

    if (editingId) {
      setApplications((current) =>
        current.map((application) =>
          application.id === editingId
            ? {
                ...application,
                company,
                position,
                status,
                dateApplied,
                notes,
                updatedAt: new Date().toISOString(),
              }
            : application
        )
      );
      setFeedback({
        status: "success",
        errors: {},
        message: "Application updated.",
      });
    } else {
      const entry = {
        id: makeId(),
        company,
        position,
        status,
        dateApplied,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setApplications((current) => [entry, ...current]);
      setFeedback({
        status: "success",
        errors: {},
        message: "Application added.",
      });
    }
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(application) {
    setEditingId(application.id);
    setForm({
      company: application.company,
      position: application.position,
      status: application.status,
      dateApplied: application.dateApplied,
      notes: application.notes,
    });
    clearFeedback();
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    clearFeedback();
  }

  function handleDelete(id) {
    const target = applications.find(
      (application) => application.id === id
    );
    if (
      !target ||
      !window.confirm(
        `Delete the ${target.position} application at ${target.company}?`
      )
    ) {
      return;
    }
    setApplications((current) =>
      current.filter((application) => application.id !== id)
    );
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm);
    }
    setFeedback({
      status: "success",
      errors: {},
      message: "Application deleted.",
    });
  }

  const sorted = [...applications].sort(compareApplications);

  return (
    <>
      <section className="contact-card" ref={formCardRef}>
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          {editingId && (
            <p className="form-success" role="status">
              Editing “{form.company} — {form.position}”.
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
              <label htmlFor="job-company">Company</label>
              <input
                id="job-company"
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
              <label htmlFor="job-position">Position</label>
              <input
                id="job-position"
                name="position"
                type="text"
                value={form.position}
                onChange={(event) =>
                  updateField("position", event.target.value)
                }
              />
              {feedback.errors?.position && (
                <p className="form-error">{feedback.errors.position}</p>
              )}
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="job-status">Status</label>
              <select
                id="job-status"
                name="status"
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="job-date">Date Applied</label>
              <input
                id="job-date"
                name="dateApplied"
                type="date"
                value={form.dateApplied}
                onChange={(event) =>
                  updateField("dateApplied", event.target.value)
                }
              />
            </div>
          </div>
          <div className="form-field">
            <label htmlFor="job-notes">Notes</label>
            <textarea
              id="job-notes"
              name="notes"
              rows={4}
              value={form.notes}
              onChange={(event) => updateField("notes", event.target.value)}
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn">
              {editingId ? "Save Changes" : "Add Application"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn btn-dark"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="content-sec">
        <h2>Applications ({sorted.length})</h2>
        {!hydrated ? (
          <p className="project-desc" role="status">
            Loading applications...
          </p>
        ) : sorted.length === 0 ? (
          <div className="detail-placeholder">
            No applications yet. Add your first one using the form above — it
            will be saved in this browser.
          </div>
        ) : (
          <div className="showcase">
            {sorted.map((application) => (
              <article key={application.id} className="card project-card">
                <div className="project-top">
                  <div>
                    <p className="work-eyebrow">{application.position}</p>
                    <h3>{application.company}</h3>
                    <p className="card-meta">
                      {application.dateApplied
                        ? `Applied ${formatDate(application.dateApplied)}`
                        : "Date not set"}
                    </p>
                  </div>
                  <span className={statusClass(application.status)}>
                    {application.status}
                  </span>
                </div>
                {application.notes && (
                  <p className="project-desc">{application.notes}</p>
                )}
                <div className="card-actions">
                  <button type="button" onClick={() => handleEdit(application)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(application.id)}
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
