import heroImg from "../../assets/hero-dashboard.png"; // you will replace this later
import { Button } from "../ui/button";

export default function Hero() {
  return (
    <section className="pt-32 pb-20 bg-gradient-to-b from-white to-[#f4f9ff]">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE TEXT */}
        <div>
          <div className="text-sm bg-blue-100 text-blue-700 px-4 py-1 rounded-full inline-block mb-4 font-medium">
            Nepal's Premier Healthcare Platform • Trusted by 10,000+ Users
          </div>

          <h1 className="text-5xl font-bold leading-tight text-gray-900 mb-6">
            Advanced Healthcare,{" "}
            <span className="text-teal-600">Digitally Connected</span>
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Nepal's most advanced telemedicine platform connecting patients 
            with board-certified specialists. Experience world-class healthcare 
            with secure consultations and digital prescriptions.
          </p>

          <div className="flex gap-4">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-6 text-lg">
              Start Consultation →
            </Button>
            <Button variant="outline" className="px-6 py-6 text-lg">
              Watch Demo ▶
            </Button>
          </div>

          <div className="flex gap-8 mt-8 text-gray-600">
            <span>💠 HIPAA Compliant</span>
            <span>💠 Board Certified Doctors</span>
            <span>💠 Secure Payments</span>
          </div>
        </div>

        {/* RIGHT SIDE DASHBOARD PREVIEW */}
        <div className="flex justify-center">
          <img
            src={heroImg}
            alt="Dashboard UI"
            className="w-[90%] rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
