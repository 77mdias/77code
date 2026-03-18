import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Engineering from "@/components/Engineering";
import EngineeringMindset from "@/components/EngineeringMindset";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Projects />
        <Engineering />
        <EngineeringMindset />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
