import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPostSlugs } from "@/lib/blog-store";

// This route reads params (and builds a dynamic metadata title) at request
// time, so it must render as a blocking route instead of a prerendered shell.
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return { title: post ? post.title : "Post Not Found" };
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  return (
    <section className="project-detail">
      <p className="sec-eyebrow">Blog</p>
      <h1>{post.title}</h1>
      <p className="project-desc">{formatDate(post.createdAt)}</p>
      <div className="detail-sec">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <p className="back-link">
        <Link href="/blogs">Back to Blog</Link>
      </p>
    </section>
  );
}
