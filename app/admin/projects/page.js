import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import ProjectManager from "@/components/ProjectManager";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Projects Admin",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function ProjectsAdmin() {
  if (!(await isAuthed())) {
    redirect("/login?next=/admin/projects");
  }

  return (
    <div className="contact">
      <div className="admin-logout">
        <LogoutButton />
      </div>
      <div className="about-head">
        <p className="sec-eyebrow">Admin</p>
        <h1>Project Manager</h1>
        <p className="bio">
          Manage the projects shown on your portfolio. Case studies get their
          own detail page with a slug generated from the title; overview-only
          projects stay non-clickable. Changes appear on the Projects page
          right away.
        </p>
      </div>
      <ProjectManager />
    </div>
  );
}
