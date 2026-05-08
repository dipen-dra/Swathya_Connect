import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

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
      rating: 5,
      quote: "Swasthya Connect has transformed my consultation workflow. My patients receive care faster and more efficiently.",
    },
    {
      avatar: image2,
      name: "Sita Sharma",
      role: "Verified Patient",
      type: "Patient",
      rating: 5,
      quote: "Consulting doctors from home has been life-changing. The platform is simple, smooth, and extremely reliable.",
    },
    {
      avatar: image3,
      name: "Pharmacy Plus",
      role: "Pharmacy Partner",
      type: "Pharmacy",
      rating: 5,
      quote: "Digital prescriptions and automated medicine orders have boosted our efficiency. Highly recommended.",
    },
    {
      avatar: image1,
      name: "Dr. Ishan Thapa",
      role: "Dermatologist",
      type: "Doctor",
      rating: 5,
      quote: "A secure and slick platform. Appointment handling and patient history access feel modern and well-built.",
    },
    {
      avatar: image2,
      name: "MedNepal Center",
      role: "Certified Pharmacy",
      type: "Pharmacy",
      rating: 5,
      quote: "The partner dashboard is clean and helps us track medicine orders smoothly and efficiently.",
    },
  ];

  return (
    <section id="reviews" className="w-full py-32 bg-white scroll-mt-24 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-8">

        {/* Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest">Global Trust</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-serif tracking-tight leading-tight">
            Trusted by <span className="text-teal-600 italic">Thousands</span> of Users.
          </h2>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            Real stories from real users across Nepal’s growing digital healthcare ecosystem.
          </p>
        </div>

        {/* Swiper */}
        <div className="testimonial-swiper relative">
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={true}
            speed={800}
            spaceBetween={32}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            pagination={{ 
              clickable: true,
              dynamicBullets: true 
            }}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-20"
          >
            {testimonials.map((t, i) => (
              <SwiperSlide key={i} className="h-auto">
                <div className="group h-full bg-slate-50 rounded-[3rem] p-10 transition-all duration-500 hover:bg-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] border border-transparent hover:border-gray-100 flex flex-col">
                  
                  {/* Quote Icon */}
                  <div className="mb-8">
                    <Quote className="w-10 h-10 text-teal-600/20 group-hover:text-teal-600 transition-colors duration-500" />
                  </div>

                  {/* Quote */}
                  <p className="text-gray-900 text-xl leading-relaxed mb-10 font-serif italic flex-grow">
                    "{t.quote}"
                  </p>

                  {/* Rating */}
                  <div className="flex gap-1 mb-8">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-5 pt-8 border-t border-gray-100">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-lg font-bold text-gray-900">{t.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                          {t.role}
                        </p>
                        <div className="h-1 w-1 bg-gray-300 rounded-full"></div>
                        <span className="text-[11px] font-black text-teal-600 uppercase tracking-widest">
                          {t.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Custom Swiper Dots CSS (usually in index.css but added here for immediate fix if needed) */}
        <style dangerouslySetInnerHTML={{ __html: `
          .testimonial-swiper .swiper-pagination-bullet-active {
            background: #0d9488 !important;
            width: 24px !important;
            border-radius: 4px !important;
          }
          .testimonial-swiper .swiper-pagination {
            bottom: 0 !important;
          }
        `}} />

      </div>
    </section>
  );
}
