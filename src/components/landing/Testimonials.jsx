import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      initials: "RA",
      name: "Dr. Ramesh Adhikari",
      role: "Senior Cardiologist",
      location: "Kathmandu",
      rating: 5,
      quote:
        "Swasthya Connect has revolutionized how I practice medicine. The platform's efficiency and patient reach have significantly improved healthcare delivery in Nepal.",
    },
    {
      initials: "SS",
      name: "Sita Sharma",
      role: "Patient",
      location: "Pokhara",
      rating: 5,
      quote:
        "Exceptional healthcare service. The convenience of consulting with top specialists from home has been life-changing for my family's healthcare needs.",
    },
    {
      initials: "PP",
      name: "Pharmacy Plus",
      role: "Partner Pharmacy",
      location: "Lalitpur",
      rating: 5,
      quote:
        "The integrated prescription system has streamlined our operations and improved patient medication adherence significantly.",
    },
  ];

  return (
    <section className="w-full py-28 bg-white" id="reviews">
      <div className="max-w-[1440px] mx-auto px-8">

        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Trusted by Healthcare <span className="text-teal-600">Professionals</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Real experiences from doctors, pharmacists, and patients who trust
            Swasthya Connect for quality, modern, and accessible healthcare.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-10 border border-gray-100"
            >
              {/* Star Rating */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-6 h-6 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 text-lg italic leading-relaxed mb-8">
                “{testimonial.quote}”
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                  {testimonial.initials}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-lg">
                    {testimonial.name}
                  </p>
                  <p className="text-gray-600 text-md">
                    {testimonial.role} • {testimonial.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
