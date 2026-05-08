import { Shield, Video, CreditCard, FileText, CheckCircle2 } from "lucide-react";

export default function WhyChoose() {
  const features = [
    {
      icon: Shield,
      title: "Verified Professionals",
      description: "Connect with board-certified doctors who have been thoroughly vetted by our review team.",
      bgColor: "bg-teal-50/50",
    },
    {
      icon: Video,
      title: "Secure Telemedicine",
      description: "HIPAA-compliant video consultations ensuring complete privacy and patient safety.",
      bgColor: "bg-slate-50",
    },
    {
      icon: CreditCard,
      title: "Integrated Payments",
      description: "Seamless payments through Khalti and eSewa with transparent transaction processing.",
      bgColor: "bg-teal-50/50",
    },
    {
      icon: FileText,
      title: "Cloud Health Records",
      description: "Secure based medical records with easy access for better continuity of care.",
      bgColor: "bg-slate-50",
    },
  ];

  return (
    <section id="features" className="w-full py-32 bg-white scroll-mt-24">
      <div className="max-w-[1440px] mx-auto px-8">
        
        {/* Section Header */}
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-4 py-2 rounded-full mb-6">
            <span className="text-[10px] font-black uppercase tracking-widest">Why Swasthya Connect?</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 font-serif tracking-tight leading-tight">
            Designed for <span className="text-teal-600 italic">Trust</span> & Accessibility.
          </h2>
          <p className="text-gray-500 text-xl leading-relaxed font-medium">
            Advanced digital healthcare designed for accessibility, quality, and trust. 
            Experience the future of medical care in Nepal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`${feature.bgColor} group rounded-[3rem] p-10 transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.03)] border border-transparent hover:border-gray-50`}
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2rem] mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500`}
                >
                  <Icon className="w-9 h-9 text-teal-600" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 font-serif">
                  {feature.title}
                </h3>

                <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 text-teal-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
