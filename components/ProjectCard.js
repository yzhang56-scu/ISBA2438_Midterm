import Link from "next/link";

export default function ProjectCard({ project }) {
  const isCaseStudy = project.type === "case-study";

  const card = (
    <article
      className={`card project-card${isCaseStudy ? " linkable" : ""}`}
    >
      <div className="project-top">
        <h3>{project.title}</h3>
        <span className={`flag ${isCaseStudy ? "flag-case" : "flag-overview"}`}>
          {isCaseStudy ? "Case Study" : "Overview Only"}
        </span>
      </div>
      <p className="project-desc">{project.description}</p>
      <div className="card-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );

  if (isCaseStudy) {
    return (
      <Link href={`/projects/${project.slug}`} className="card-link">
        {card}
      </Link>
    );
  }

  return card;
}
