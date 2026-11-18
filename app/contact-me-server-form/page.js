import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
};

export default function Contact() {
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
        <ContactForm />
      </div>
    </section>
  );
}
