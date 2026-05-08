import { Video, FileText, Activity, Zap, CheckCircle2 } from "lucide-react";

export default function Services() {
  const services = [
    {
      icon: Video,
      title: "Virtual Consultations",
      description: "High-definition video consultations with specialists across multiple medical disciplines, available 24/7.",
      features: ["HD Video Quality", "Digital Prescriptions", "Follow-up Scheduling"],
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      icon: FileText,
      title: "Prescription Management",
      description: "Digital prescription system with direct pharmacy integration for seamless medication delivery.",
      features: ["E-Prescriptions", "Pharmacy Network", "Reminders"],
      bgColor: "bg-slate-50",
      iconColor: "text-slate-600",
    },
    {
      icon: Activity,
      title: "Health Monitoring",
      description: "Continuous health tracking with wearable device integration and AI-powered health insights.",
      features: ["Vital Signs Tracking", "Health Analytics", "Trend Analysis"],
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600",
    },
    {
      icon: Zap,
      title: "Emergency Support",
      description: "24/7 emergency medical support with rapid response protocols and emergency service coordination.",
      features: ["24/7 Availability", "Emergency Protocols", "Rapid Response"],
      bgColor: "bg-slate-50",
      iconColor: "text-slate-600",
    },
  ];

  return (
    <section id="services" className="w-full py-32 bg-white scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-24">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest">Our Expertise</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-serif tracking-tight leading-tight">
            Comprehensive <br />
            Healthcare <span className="text-teal-600 italic">Ecosystem</span>
          </h2>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            A complete digital environment designed for modern medical practice, 
            combining cutting-edge technology with patient-centered care.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;

            return (
              <div
                key={index}
                className={`group p-10 rounded-[3rem] transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.04)] border border-transparent hover:border-gray-50 ${service.bgColor}`}
              >
                <div className="flex flex-col md:flex-row gap-10">
                  {/* Icon */}
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500">
                    <Icon className={`w-9 h-9 ${service.iconColor}`} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-lg leading-relaxed mb-8 font-medium">
                      {service.description}
                    </p>

                    {/* Features Grid */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                          </div>
                          <span className="text-gray-600 text-sm font-bold">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
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
