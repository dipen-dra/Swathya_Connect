import { Info, Video, CheckCircle2, Calendar } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleLoginNavigate = () => {
    navigate("/login");
  };

  return (
    <section
      id="hero"
      className="w-full py-28 bg-white scroll-mt-24"
    >
      <div className="max-w-[1440px] mx-auto px-8 grid lg:grid-cols-2 gap-20 items-center">
        
        {/* LEFT CONTENT */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full mb-6">
            <Info className="w-4 h-4" />
            <span className="text-sm">
              Nepal's Premier Healthcare Platform • Trusted by 10,000+ Users
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Advanced Healthcare,{" "}
            <span className="text-blue-600">Digitally Connected</span>
          </h1>

          {/* Description */}
          <p className="text-gray-600 text-xl mb-10 leading-relaxed max-w-2xl">
            Nepal's most advanced telemedicine platform connecting patients with
            board-certified specialists. Experience world-class healthcare with
            secure consultations and digital prescriptions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 mb-10">
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white h-12 px-6"
              onClick={handleLoginNavigate}
            >
              <span className="mr-2">→</span>
              Start Consultation
            </Button>

            <Button variant="outline" className="h-12 px-6 border-2">
              <Video className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <span className="text-sm text-gray-700">HIPAA Compliant</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <span className="text-sm text-gray-700">Board Certified Doctors</span>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-500" />
              <span className="text-sm text-gray-700">Secure Payments</span>
            </div>
          </div>
        </div>

        {/* RIGHT CONTENT — Dashboard Card */}
        <div className="relative flex justify-center items-center">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-md">

            {/* Card Header */}
            <div className="bg-gradient-to-r from-blue-600 to-teal-500 p-6 text-white">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span>Patient Dashboard</span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6">

              {/* Doctor Info */}
              <div className="flex items-center justify-between mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white">
                    SW
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Dr. Sarah Wilson</p>
                    <p className="text-sm text-gray-600">Cardiologist</p>
                  </div>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Available
                </span>
              </div>

              {/* Appointment */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-gray-700">Next Appointment</span>
                <span className="text-teal-600 font-medium">Today, 2:30 PM</span>
              </div>

              {/* Health Score */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                <span className="text-gray-700">Health Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 font-medium">85/100</span>
                  <span className="text-green-500 text-lg">↗</span>
                </div>
              </div>

              {/* Button */}
              <Button
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                onClick={handleLoginNavigate}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Consultation
              </Button>
            </div>
          </div>

          {/* Floating Doctor Image */}
          <div className="hidden lg:block absolute -bottom-10 -left-20 w-36 h-36 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <img
              src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop"
              alt="Medical Professional"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
