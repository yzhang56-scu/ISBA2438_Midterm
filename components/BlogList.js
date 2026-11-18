"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

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

export default function BlogList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    setPosts(null);
    try {
      const response = await fetch("/api/blogs");
      const result = await response.json();
      if (!response.ok || result.status !== "success" || !Array.isArray(result.posts)) {
        throw new Error("failed to load posts");
      }
      setPosts(result.posts);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="blog-status">
        <p className="form-error-summary" role="alert">
          Cannot load posts right now. Please try again.
        </p>
        <button type="button" className="btn" onClick={load}>
          Try Again
        </button>
      </div>
    );
  }

  if (posts === null) {
    return (
      <p className="blog-status" role="status">
        Loading posts...
      </p>
    );
  }

  if (posts.length === 0) {
    return (
      <p className="blog-status" role="status">
        No blog posts yet. Published posts will appear here soon.
      </p>
    );
  }

  const sorted = [...posts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return (
    <div className="showcase">
      {sorted.map((post) => (
        <Link
          key={post.id}
          href={`/blogs/${post.slug}`}
          className="card-link"
        >
          <article className="card project-card linkable">
            <div className="project-top">
              <h3>{post.title}</h3>
              <span className="flag flag-overview">{formatDate(post.createdAt)}</span>
            </div>
            <p className="project-desc">{preview(post.content)}</p>
          </article>
        </Link>
      ))}
    </div>
  );
}
