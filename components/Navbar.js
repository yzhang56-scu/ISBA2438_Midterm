import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/about-me", label: "About Me" },
  { href: "/projects", label: "Projects" },
  { href: "/blogs", label: "Blog" },
  { href: "/job-tracker", label: "Job Tracker" },
  { href: "/contact-me-server-form", label: "Contact" },
  { href: "/contact-me", label: "Contact (API)" },
];

export default function Navbar() {
  return (
    <nav>
      <Link href="/" className="brand">
        Julie
      </Link>
      <div className="links">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
