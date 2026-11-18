import Image from "next/image";
import ExperienceList from "@/components/ExperienceList";
import { getExperiences } from "@/lib/experience-store";

const bio =
  "I'm an M.S. in Information Systems candidate at Santa Clara University with a business analytics foundation and professional experience across tech, FMCG, and automotive. At NIO, a leading EV brand in China, I supported regional GTM planning, built KPI dashboards for 35 stores and pop-ups across 3 provinces, and led a 5-member sales operations team. I'm at my best turning data-driven insights into real-world business results through hands-on execution — from new brand launches to sales operations and business strategy.";

const education = [
  {
    badge: "SCU",
    logo: "/logos/SCU.png",
    school: "Santa Clara University",
    degree: "M.S. in Information Systems",
    period: "2025.09 – 2027.03",
    details: "GPA: 3.97 / 4.00 · Santa Clara, CA",
  },
  {
    badge: "WU",
    logo: "/logos/washu.png",
    school: "Washington University in St. Louis",
    degree: "M.S. in Business Analytics",
    period: "2020.09 – 2022.12",
    details: "GPA: 3.78 / 4.00 · St. Louis, MO",
  },
  {
    badge: "UIUC",
    logo: "/logos/UIUC.png",
    school: "University of Illinois Urbana-Champaign",
    degree: "B.S. in Accountancy",
    period: "2016.08 – 2019.12",
    details:
      "GPA: 3.87 / 4.00 (Top 10%) · Minor: Communication · Dean's List 2016–2019 · Graduated with Honors",
  },
];

const skills = [
  {
    group: "Data & Analysis",
    items: ["SQL", "Python (Pandas, NumPy, Data Visualization)", "Tableau", "Excel"],
  },
  {
    group: "Business & CRM",
    items: ["Salesforce (Intermediate)", "PowerPoint", "Word"],
  },
  {
    group: "AI-Assisted Analysis",
    items: ["ChatGPT", "Claude", "Gemini", "Perplexity"],
  },
];

export const metadata = {
  title: "About Me",
};

export default async function About() {
  const experience = await getExperiences();

  return (
    <div className="about">
      <section className="about-head">
        <h1>About Me</h1>
        <p className="bio">{bio}</p>
      </section>

      <section className="content-sec">
        <p className="sec-eyebrow">Academics</p>
        <h2>Education</h2>
        <div className="showcase">
          {education.map((item) => (
            <article key={item.school} className="card edu-card">
              <span className="logo-badge">
                <Image
                  src={item.logo}
                  alt={`${item.school} logo`}
                  width={40}
                  height={40}
                  className="logo-img"
                />
              </span>
              <div>
                <h3>{item.school}</h3>
                <p className="edu-degree">{item.degree}</p>
                <p className="card-meta">{item.details}</p>
              </div>
              <span className="period">{item.period}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="content-sec">
        <p className="sec-eyebrow">Experience</p>
        <h2>Work Experience</h2>
        <ExperienceList experiences={experience} />
      </section>

      <section className="skills">
        <p className="sec-eyebrow">Capabilities</p>
        <h2>Skills & Tools</h2>
        {skills.map((group) => (
          <div key={group.group} className="skill-group">
            <h3>{group.group}</h3>
            <div className="tags">
              {group.items.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
