import React from "react";
import { Star, Quote } from "lucide-react";
import { TestimonialsColumn } from "./TestimonialsColumn";

// IMAGE IMPORTS
import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";

export default function Testimonials() {
  const testimonials = [
    {
      avatar: image1,
      name: "Dr. Ramesh Adhikari",
      role: "Cardiologist",
      type: "Doctor",
      quote: "Swasthya Connect has transformed my consultation workflow. My patients receive care faster.",
    },
    {
      avatar: image2,
      name: "Sita Sharma",
      role: "Verified Patient",
      type: "Patient",
      quote: "Consulting doctors from home has been life-changing. The platform is simple and smooth.",
    },
    {
      avatar: image3,
      name: "Pharmacy Plus",
      role: "Pharmacy Partner",
      type: "Pharmacy",
      quote: "Digital prescriptions and automated medicine orders have boosted our efficiency significantly.",
    },
    {
      avatar: image1,
      name: "Dr. Ishan Thapa",
      role: "Dermatologist",
      type: "Doctor",
      quote: "A secure and slick platform. Appointment handling and patient history access feel modern.",
    },
    {
      avatar: image2,
      name: "MedNepal Center",
      role: "Certified Pharmacy",
      type: "Pharmacy",
      quote: "The partner dashboard is clean and helps us track medicine orders smoothly and efficiently.",
    },
    {
      avatar: image3,
      name: "Anil Gurung",
      role: "Patient",
      type: "Patient",
      quote: "Fastest way to get medicines delivered in Kathmandu. Very satisfied with the service.",
    }
  ];

  // Split testimonials for different columns
  const firstColumn = testimonials.slice(0, 3);
  const secondColumn = testimonials.slice(3, 6);
  const thirdColumn = testimonials.slice(0, 3);

  return (
    <section id="reviews" className="w-full py-32 bg-white scroll-mt-24 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-8 relative">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto relative z-30">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest">User Stories</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-serif tracking-tight leading-tight">
            Trusted by <span className="text-teal-600 italic">Thousands</span>.
          </h2>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            Real stories from real users across Nepal’s growing digital healthcare ecosystem.
          </p>
        </div>

        {/* Animated Columns Grid */}
        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn 
            testimonials={secondColumn} 
            className="hidden md:block" 
            duration={20} 
          />
          <TestimonialsColumn 
            testimonials={thirdColumn} 
            className="hidden lg:block" 
            duration={17} 
          />
        </div>
      </div>
    </section>
  );
}
