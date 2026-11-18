export default function ExperienceCard({ experience }) {
  const {
    short,
    company,
    role,
    location,
    period,
    achievements = [],
    metrics = [],
  } = experience;

  return (
    <article className="card work-card">
      <span className="logo-badge logo-text">{short}</span>
      <div>
        <p className="work-eyebrow">{role}</p>
        <h3>{company}</h3>
        <p className="card-meta">
          {location} · {period}
        </p>
        <div className="points">
          {achievements.map((achievement) => (
            <p key={achievement} className="point">
              {achievement}
            </p>
          ))}
        </div>
        {metrics.length > 0 && (
          <div className="metric-boxes">
            {metrics.map((metric) => (
              <span key={metric} className="metric-box">
                {metric}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
