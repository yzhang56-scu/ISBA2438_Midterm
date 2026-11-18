import ContactFormApi from "@/components/ContactFormApi";

export const metadata = {
  title: "Contact (API)",
};

export default function ContactApi() {
  return (
    <section className="contact">
      <div className="about-head">
        <p className="sec-eyebrow">Get in Touch</p>
        <h1>Contact</h1>
        <p className="bio">
          Have a question or opportunity to discuss? Send a message and it will
          reach me directly.
        </p>
      </div>
      <div className="contact-card">
        <ContactFormApi />
      </div>
    </section>
  );
}
