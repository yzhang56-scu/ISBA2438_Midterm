import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getAllProjectSlugs } from "@/lib/project-store";

// This route reads params at request time, so it must render as a blocking
// route instead of a prerendered shell.
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <section className="project-detail">
      <h1>{project.title}</h1>
      <p className="project-desc">{project.description}</p>
      <div className="card-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
      {project.github && (
        <div className="detail-actions">
          <a
            className="btn"
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </a>
        </div>
      )}
      {project.details.map((detail) => (
        <section key={detail.heading} className="detail-sec">
          <h2>{detail.heading}</h2>
          {detail.body && <p>{detail.body}</p>}
          {detail.metrics && detail.metrics.length > 0 && (
            <div className="metric-boxes">
              {detail.metrics.map((metric) => (
                <span key={metric} className="metric-box">
                  {metric}
                </span>
              ))}
            </div>
          )}
          {detail.points && detail.points.length > 0 && (
            <div className="points">
              {detail.points.map((point) => (
                <p key={point} className="point">
                  {point}
                </p>
              ))}
            </div>
          )}
        </section>
      ))}
      <p className="back-link">
        <Link href="/projects">Back to Projects</Link>
      </p>
    </section>
  );
}
