import { Users, Stethoscope, Building2, MapPin } from "lucide-react";

export default function Stats() {
  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Patients",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Stethoscope,
      value: "500+",
      label: "Medical Professionals",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      icon: Building2,
      value: "200+",
      label: "Healthcare Partners",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: MapPin,
      value: "50+",
      label: "Cities Served",
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ];

  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">

          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div key={index} className="text-center">
                {/* Icon Container */}
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 ${stat.bgColor} rounded-2xl mb-5`}
                >
                  <Icon className={`w-10 h-10 ${stat.color}`} />
                </div>

                {/* Value */}
                <p className={`text-4xl font-extrabold mb-2 ${stat.color}`}>
                  {stat.value}
                </p>

                {/* Label */}
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}
