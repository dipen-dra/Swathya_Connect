import { Video, FileText, Activity, Zap, CheckCircle2 } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Video,
      title: "Virtual Consultations",
      description:
        "High-definition video consultations with specialists across multiple medical disciplines, available 24/7.",
      features: [
        "HD Video Quality",
        "Screen Sharing",
        "Digital Prescriptions",
        "Follow-up Scheduling",
      ],
      gradient: "from-blue-500 to-cyan-500",
      borderColor: "border-t-blue-500",
    },
    {
      icon: FileText,
      title: "Prescription Management",
      description:
        "Digital prescription system with direct pharmacy integration for seamless medication delivery.",
      features: [
        "E-Prescriptions",
        "Pharmacy Network",
        "Medication Reminders",
        "Drug Interaction Alerts",
      ],
      gradient: "from-teal-500 to-cyan-500",
      borderColor: "border-t-teal-500",
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description:
        "Continuous health tracking with wearable device integration and AI-powered health insights.",
      features: [
        "Vital Signs Tracking",
        "Health Analytics",
        "Trend Analysis",
        "Preventive Care Alerts",
      ],
      gradient: "from-blue-500 to-teal-500",
      borderColor: "border-t-blue-500",
    },
    {
      icon: Zap,
      title: "Emergency Support",
      description:
        "24/7 emergency medical support with rapid response protocols and emergency service coordination.",
      features: [
        "24/7 Availability",
        "Emergency Protocols",
        "Rapid Response",
        "Hospital Coordination",
      ],
      gradient: "from-cyan-500 to-blue-500",
      borderColor: "border-t-cyan-500",
    },
  ];

  return (
    <section id="services" className="w-full py-28 bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Comprehensive Healthcare Services
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            A complete digital ecosystem designed for modern medical practice with
            cutting-edge technology and patient-centered care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-t-4 ${service.borderColor}`}
              >
                <div className="p-10">
                  
                  {/* Icon + Title */}
                  <div className="flex items-start gap-5 mb-6">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 ml-20">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-teal-500 flex-shrink-0" />
                        <span className="text-gray-700 text-md">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
