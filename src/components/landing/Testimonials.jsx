import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

// IMAGE IMPORTS (your format)
import image1 from "@/assets/image1.jpg";
import image2 from "@/assets/image2.jpg";
import image3 from "@/assets/image3.jpg";
import image4 from "@/assets/image1.jpg";
import image5 from "@/assets/image2.jpg";
import image6 from "@/assets/image3.jpg";
import image7 from "@/assets/image1.jpg";
import image8 from "@/assets/image2.jpg";

export default function Testimonials() {
  const testimonials = [
    {
      avatar: image1,
      name: "Dr. Ramesh Adhikari",
      role: "Cardiologist",
      type: "Doctor",
      rating: 5,
      quote:
        "Swasthya Connect has transformed my consultation workflow. My patients receive care faster and more efficiently.",
    },
    {
      avatar: image2,
      name: "Sita Sharma",
      role: "Verified Patient",
      type: "Patient",
      rating: 5,
      quote:
        "Consulting doctors from home has been life-changing. The platform is simple, smooth, and extremely reliable.",
    },
    {
      avatar: image3,
      name: "Pharmacy Plus",
      role: "Pharmacy Partner",
      type: "Pharmacy",
      rating: 5,
      quote:
        "Digital prescriptions and automated medicine orders have boosted our efficiency. Highly recommended.",
    },
    {
      avatar: image4,
      name: "Dr. Ishan Thapa",
      role: "Dermatologist",
      type: "Doctor",
      rating: 4,
      quote:
        "A secure and slick platform. Appointment handling and patient history access feel modern and well-built.",
    },
    {
      avatar: image5,
      name: "Anita Lama",
      role: "Patient",
      type: "Patient",
      rating: 5,
      quote:
        "The experience feels premium. Reliable consultations and very professional doctors.",
    },
    {
      avatar: image6,
      name: "MedNepal Center",
      role: "Certified Pharmacy",
      type: "Pharmacy",
      rating: 5,
      quote:
        "The partner dashboard is clean and helps us track medicine orders smoothly.",
    },
    {
      avatar: image7,
      name: "Dr. Sanjeev KC",
      role: "Neurologist",
      type: "Doctor",
      rating: 4,
      quote:
        "The telemedicine tools are impressive. Video clarity and integrated reports are excellent.",
    },
    {
      avatar: image8,
      name: "Bikash Rana",
      role: "Patient",
      type: "Patient",
      rating: 5,
      quote:
        "Fast consultations, secure payments, and overall a trustworthy healthcare platform.",
    },
  ];

  return (
    <section id="reviews" className="w-full py-28 bg-white scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Trusted by Doctors, Patients & Pharmacies
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Real stories from real users across Nepal’s growing digital healthcare ecosystem.
          </p>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Autoplay, Pagination]}
          loop={true}
          speed={600}
          spaceBetween={24}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="h-full">
                <div className="bg-white rounded-2xl shadow-md p-8 flex flex-col h-full">

                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-700 text-base leading-relaxed mb-6 line-clamp-4">
                    {t.quote}
                  </p>

                  {/* Footer */}
                  <div className="mt-auto flex items-center gap-3 pt-4 border-t">
                    <div className="w-12 h-12 rounded-full overflow-hidden border">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <p className="text-gray-900 font-semibold">{t.name}</p>
                      <p className="text-gray-600 text-sm">
                        {t.role} • 
                        <span className="text-teal-600 font-medium ml-1">
                          {t.type}
                        </span>
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}
