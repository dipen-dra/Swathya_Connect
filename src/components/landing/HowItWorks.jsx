import { UserPlus, Search, Calendar, Heart } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Create Account",
      description:
        "Register using your personal and medical information. Begin your journey with secure identity verification.",
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      icon: Search,
      title: "Find Specialist",
      description:
        "Explore our network of verified healthcare professionals with filters based on specialty, experience, and ratings.",
      color: "from-teal-500 to-teal-600",
    },
    {
      number: "03",
      icon: Calendar,
      title: "Schedule Consultation",
      description:
        "Choose an available time slot and receive instant confirmation with appointment preparation guidelines.",
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "04",
      icon: Heart,
      title: "Receive Care",
      description:
        "Attend your virtual consultation and receive digital prescriptions with pharmacy integration for easy medicine delivery.",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-28 bg-[#F7FBFF]">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            How Swasthya <span className="text-teal-600">Connect Works</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            A seamless digital workflow bringing patients, doctors, and pharmacies together.
            Four simple steps to world-class healthcare—anytime, anywhere.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={index} className="relative">

                {/* Step Number Background */}
                <div className="absolute -top-6 -left-4 text-7xl font-extrabold text-gray-200 opacity-50 select-none">
                  {step.number}
                </div>

                {/* Card */}
                <div className="relative bg-white rounded-2xl p-10 shadow-md hover:shadow-xl transition-all">
                  
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl mb-6`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
