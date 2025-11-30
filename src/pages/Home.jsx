import Navbar from "../components/layout/Navbar";
import Hero from "../components/landing/Hero";
import WhyChoose from "../components/landing/WhyChoose";
import Services from "../components/landing/Services";
import HowItWorks from "../components/landing/HowItWorks";
import Testimonials from "../components/landing/Testimonials";
import Footer from "../components/layout/Footer";
import Stats from "../components/landing/Stats";

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      <Navbar />
      <Hero />
      <Stats />   
      <WhyChoose />
      <Services />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
}
