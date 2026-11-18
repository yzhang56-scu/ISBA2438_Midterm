import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/auth";
import MessageManager from "@/components/MessageManager";
import LogoutButton from "@/components/LogoutButton";

export const metadata = {
  title: "Messages Admin",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function MessagesAdmin() {
  if (!(await isAuthed())) {
    redirect("/login?next=/admin/messages");
  }

  return (
    <div className="contact">
      <div className="admin-logout">
        <LogoutButton />
      </div>
      <div className="about-head">
        <p className="sec-eyebrow">Admin</p>
        <h1>Message Manager</h1>
        <p className="bio">
          Review the messages sent through your contact forms. Track each one
          as New or Replied, update the details, or remove old entries —
          everything is saved to the backend.
        </p>
      </div>
      <MessageManager />
    </div>
  );
}
