import Image from "next/image";

const highlights = [
  {
    stat: "35",
    title: "Store Launches Supported",
    description: "GTM expansion across 3 provinces.",
  },
  {
    stat: "5",
    title: "Team Members Led",
    description: "Built and led a regional BA team from scratch.",
  },
  {
    stat: "80%+",
    title: "Cost Reduction",
    description: "Monthly storage costs reduced in 2.5 months.",
  },
];

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">
          Sales Operations · Go-to-Market · Business Strategy
        </p>
        <h1>
          Hi, I&apos;m <span>Julie Zhang</span>.
        </h1>
        <p className="intro">
          M.S. in Information Systems at Santa Clara University, with
          professional experience across tech, FMCG, and automotive
          industries. My background spans new brand launches, GTM execution,
          and sales operations, with a strong focus on turning data-driven
          insights into real-world business results through hands-on
          execution.
        </p>
        <div className="metrics">
          {highlights.map((item) => (
            <div key={item.title} className="metric">
              <span className="stat">{item.stat}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
          <a
            className="btn btn-dark"
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
          >
          Resume
        </a>
      </div>
      <div className="photo-frame">
        <Image
          src="/profile-photo.png"
          alt="Julie Zhang"
          width={340}
          height={410}
          priority
          className="profile-photo"
        />
      </div>
    </section>
  );
}
