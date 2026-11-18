import ExperienceCard from "./ExperienceCard";

export default function ExperienceList({ experiences }) {
  if (!Array.isArray(experiences) || experiences.length === 0) {
    return null;
  }

  return (
    <div className="showcase">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  );
}
