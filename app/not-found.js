import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <section className="contact">
      <div className="about-head">
        <p className="sec-eyebrow">404</p>
        <h1>Page Not Found</h1>
        <p className="bio">
          The page you are looking for does not exist or may have been moved.
        </p>
      </div>
      <div className="detail-actions">
        <Link href="/" className="btn">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
