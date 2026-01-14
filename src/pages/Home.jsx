import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import Stats from "../components/landing/Stats";
import WhyChoose from "../components/landing/WhyChoose";
import Services from "../components/landing/Services";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/layout/Footer";

export default function HomePage() {
  return (
    <div id="hero">
      <Navbar />
      <Hero />
      <Stats />
      <WhyChoose />
      <Services />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}
