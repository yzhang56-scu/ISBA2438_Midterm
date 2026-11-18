import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import ExperienceManager from "@/components/ExperienceManager";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Experience Admin",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function ExperienceAdmin() {
  if (!(await isAuthed())) {
    redirect("/login?next=/admin/experience");
  }

  return (
    <div className="contact">
      <div className="admin-logout">
        <LogoutButton />
      </div>
      <div className="about-head">
        <p className="sec-eyebrow">Admin</p>
        <h1>Experience Manager</h1>
        <p className="bio">
          Manage the work experience entries shown on your About Me page. Add,
          edit, or remove roles — changes are saved to the backend and appear
          on the site right away.
        </p>
      </div>
      <ExperienceManager />
    </div>
  );
}
