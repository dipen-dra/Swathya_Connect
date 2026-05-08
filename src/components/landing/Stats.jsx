import { Users, Stethoscope, Building2, MapPin } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Patients",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: Stethoscope,
      value: "500+",
      label: "Medical Professionals",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: Building2,
      value: "200+",
      label: "Healthcare Partners",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      icon: MapPin,
      value: "50+",
      label: "Cities Served",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      {/* Decorative Line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-gray-100 to-transparent"></div>

      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className="group flex flex-col items-center text-center p-8 rounded-[2.5rem] transition-all duration-500 hover:bg-slate-50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.03)]"
              >
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 ${stat.bgColor} rounded-[2rem] mb-8 group-hover:scale-110 transition-transform duration-500 shadow-sm`}
                >
                  <Icon className={`w-9 h-9 ${stat.color}`} />
                </div>

                {/* Value */}
                <p className={`text-4xl font-black mb-3 text-gray-900 tracking-tight`}>
                  {stat.value}
                </p>

                {/* Label */}
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
