"use client";

export default function LogoutButton() {
  async function handleSubmit(event) {
    event.preventDefault();
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    window.location.assign("/");
  }

  return (
    <form action="/api/auth/logout" method="POST" onSubmit={handleSubmit} className="admin-logout-form">
      <button type="submit" className="btn btn-outline">
        Log Out
      </button>
    </form>
  );
}
