import { getProjects } from "@/lib/project-store";
import ProjectCard from "@/components/ProjectCard";

export const metadata = {
  title: "Projects",
};

export default async function Projects() {
  const projects = await getProjects();

  const sections = [
    {
      title: "Market & Customer Intelligence",
      items: projects.filter((project) => project.section === 1),
    },
    {
      title: "Go-to-Market & Growth Strategy",
      items: projects.filter((project) => project.section === 2),
    },
    {
      title: "Sales & Business Operations",
      items: projects.filter((project) => project.section === 3),
    },
  ];

  return (
    <div className="projects">
      <div className="about-head">
        <p className="sec-eyebrow">Portfolio</p>
        <h1>Projects</h1>
      </div>
      {sections.map((section) => (
        <section key={section.title} className="content-sec">
          <h2>{section.title}</h2>
          <div className="showcase">
            {section.items.map((project) => (
              <ProjectCard key={project.id ?? project.title} project={project} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
