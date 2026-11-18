import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import JobTracker from "@/components/JobTracker";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Job Application Tracker",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function JobTrackerPage() {
  if (!(await isAuthed())) {
    redirect("/login?next=/job-tracker");
  }

  return (
    <div className="contact">
      <div className="admin-logout">
        <LogoutButton />
      </div>
      <div className="about-head">
        <p className="sec-eyebrow">Career</p>
        <h1>Job Application Tracker</h1>
        <p className="bio">
          Keep track of every role you pursue 鈥?from wishlist to offer. Add,
          edit, and remove applications below. Everything is saved privately in
          your browser with LocalStorage, so your list is here when you come
          back.
        </p>
      </div>
      <JobTracker />
    </div>
  );
}
