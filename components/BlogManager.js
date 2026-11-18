"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const emptyForm = { title: "", content: "" };

const initialState = { status: "idle", errors: {}, message: "" };

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function preview(text) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= 140) {
    return clean;
  }
  return `${clean.slice(0, 140).replace(/\s+\S*$/, "")}...`;
}

export default function BlogManager() {
  const [posts, setPosts] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState(initialState);
  const [sending, setSending] = useState(false);
  const formCardRef = useRef(null);

  const load = useCallback(async () => {
    setLoadError(false);
    setPosts(null);
    try {
      const response = await fetch("/api/blogs");
      const result = await response.json();
      if (
        !response.ok ||
        result.status !== "success" ||
        !Array.isArray(result.posts)
      ) {
        throw new Error("failed to load posts");
      }
      setPosts(result.posts);
    } catch {
      setLoadError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function clearFeedback() {
    setFeedback(initialState);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setFeedback(initialState);
    try {
      const response = await fetch("/api/blogs", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId ? { id: editingId, ...form } : form
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
      const saved = result.post;
      if (editingId) {
        setPosts((current) =>
          current.map((item) => (item.id === editingId ? saved : item))
        );
        setFeedback({
          status: "success",
          errors: {},
          message: `Post updated. Slug: ${saved.slug}`,
        });
      } else {
        setPosts((current) => [saved, ...current]);
        setFeedback({
          status: "success",
          errors: {},
          message: `Blog post published. Slug: ${saved.slug}`,
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
    setForm({ title: item.title, content: item.content });
    clearFeedback();
    formCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    clearFeedback();
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete the post “${item.title}”?`)) {
      return;
    }
    clearFeedback();
    try {
      const response = await fetch("/api/blogs", {
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
      setPosts((current) =>
        current.filter((entry) => entry.id !== item.id)
      );
      if (editingId === item.id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      setFeedback({
        status: "success",
        errors: {},
        message: "Post deleted.",
      });
    } catch {
      setFeedback({
        status: "error",
        errors: {},
        message: "Cannot reach the server. Please try again.",
      });
    }
  }

  const sorted = [...(posts ?? [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <>
      <section className="contact-card" ref={formCardRef}>
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          {editingId && (
            <p className="form-success" role="status">
              Editing “{form.title}”. The slug is regenerated from the title
              when you save.
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
            <label htmlFor="blog-title">Title</label>
            <input
              id="blog-title"
              name="title"
              type="text"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            {feedback.errors?.title && (
              <p className="form-error">{feedback.errors.title}</p>
            )}
          </div>
          <div className="form-field">
            <label htmlFor="blog-content">Content</label>
            <textarea
              id="blog-content"
              name="content"
              rows={10}
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
            />
            {feedback.errors?.content && (
              <p className="form-error">{feedback.errors.content}</p>
            )}
          </div>
          <div className="form-actions">
            <button type="submit" className="btn" disabled={sending}>
              {sending
                ? "Saving..."
                : editingId
                  ? "Save Changes"
                  : "Publish Post"}
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
        <h2>Posts ({sorted.length})</h2>
        {posts === null && !loadError && (
          <p className="project-desc" role="status">
            Loading posts...
          </p>
        )}
        {loadError && (
          <div className="detail-placeholder">
            <p>Cannot load posts right now. Please try again.</p>
            <p className="back-link">
              <button type="button" className="btn" onClick={load}>
                Try Again
              </button>
            </p>
          </div>
        )}
        {posts !== null && !loadError && sorted.length === 0 && (
          <div className="detail-placeholder">
            No blog posts yet. Publish your first one using the form above.
          </div>
        )}
        {posts !== null && !loadError && sorted.length > 0 && (
          <div className="showcase">
            {sorted.map((post) => (
              <article key={post.id} className="card project-card">
                <div className="project-top">
                  <h3>{post.title}</h3>
                  <span className="flag flag-overview">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <p className="card-meta">Slug: {post.slug}</p>
                <p className="project-desc">{preview(post.content)}</p>
                <div className="card-actions">
                  <Link href={`/blogs/${post.slug}`} className="btn">
                    View
                  </Link>
                  <button type="button" onClick={() => handleEdit(post)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(post)}
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
