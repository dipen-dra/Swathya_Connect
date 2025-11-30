import { Shield, Video, CreditCard, FileText } from "lucide-react";

export default function WhyChoose() {
  const features = [
    {
      icon: Shield,
      title: "Verified Healthcare Professionals",
      description:
        "Connect with board-certified doctors and specialists who have been thoroughly vetted by our medical review team.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Video,
      title: "Secure Telemedicine Platform",
      description:
        "HIPAA-compliant video consultations with end-to-end encryption ensuring complete privacy & safety.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: CreditCard,
      title: "Integrated Payment System",
      description:
        "Seamless payments through Khalti and eSewa with transparent pricing and fast transaction processing.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: FileText,
      title: "Digital Health Records",
      description:
        "Secure cloud-based medical records with easy access for better continuity of care and future consultations.",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <section id="features" className="w-full py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Why Choose <span className="text-teal-600">Swasthya Connect?</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Advanced digital healthcare designed for accessibility, quality, and trust.  
            Experience the future of medical care in Nepal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} rounded-2xl p-10 hover:shadow-xl transition-all duration-300`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl mb-6`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
