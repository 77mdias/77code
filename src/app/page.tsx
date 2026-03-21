import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Engineering from "@/components/Engineering";
import EngineeringMindset from "@/components/EngineeringMindset";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getGithubProjects, getGithubEngineeringRepos } from "@/lib/github";

export default async function Home() {
  const [projects, engineeringRepos] = await Promise.all([
    getGithubProjects(),
    getGithubEngineeringRepos(),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects projects={projects} />
        <Engineering projects={engineeringRepos} />
        <EngineeringMindset />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
