import BlogList from "@/components/BlogList";

export const metadata = {
  title: "Blog",
};

export default function Blogs() {
  return (
    <div className="projects">
      <div className="about-head">
        <p className="sec-eyebrow">Writing</p>
        <h1>Blog</h1>
      </div>
      <section className="content-sec">
        <BlogList />
      </section>
    </div>
  );
}
