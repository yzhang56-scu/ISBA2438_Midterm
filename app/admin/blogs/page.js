import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import BlogManager from "@/components/BlogManager";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Blog Admin",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function BlogAdmin() {
  if (!(await isAuthed())) {
    redirect("/login?next=/admin/blogs");
  }

  return (
    <div className="contact">
      <div className="admin-logout">
        <LogoutButton />
      </div>
      <div className="about-head">
        <p className="sec-eyebrow">Admin</p>
        <h1>Blog Manager</h1>
        <p className="bio">
          Publish, edit, and remove blog posts. A unique slug and creation
          date are added automatically; editing a post regenerates its slug
          from the new title.
        </p>
      </div>
      <BlogManager />
    </div>
  );
}
