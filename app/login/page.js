import LoginForm from "@/components/LoginForm";

export const metadata = {
  title: "Log In",
};

// This route reads cookies, searchParams, or params at request time, so it must
// render as a blocking route instead of a prerendered shell.
export const instant = false;

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/";

  return (
    <div className="contact">
      <div className="about-head">
        <p className="sec-eyebrow">Admin</p>
        <h1>Log In</h1>
        <p className="bio">
          This area is private. Enter the admin password to open the Job
          Tracker and the management pages for blogs, experiences, projects,
          and contact messages.
        </p>
      </div>
      <div className="contact-card">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
