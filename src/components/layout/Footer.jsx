import { Shield, MapPin, Phone, Mail } from "lucide-react";

export default function Footer() {
  const platformLinks = [
    { name: "Features", icon: "✦" },
    { name: "Services", icon: "✦" },
    { name: "How It Works", icon: "✦" },
    { name: "Reviews", icon: "✦" },
    { name: "Get Started", icon: "✦" },
  ];

  const supportLinks = [
    { name: "Privacy Policy", icon: "✦" },
    { name: "Terms of Service", icon: "✦" },
    { name: "Security", icon: "✦" },
    { name: "Help Center", icon: "✦" },
    { name: "Contact Support", icon: "✦" },
  ];

  return (
    <footer className="bg-[#0f172a] text-gray-300" id="footer">
      <div className="max-w-[1440px] mx-auto px-8 py-24">
        {/* Top Grid */}
        <div className="grid md:grid-cols-3 gap-16 mb-20">

          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-white text-xl font-semibold">
                Swasthya Connect
              </span>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Transforming healthcare delivery in Nepal through advanced telemedicine,
              digital prescriptions, and secure patient-doctor connectivity.
            </p>

            {/* Contact Info */}
            <div className="space-y-5">
              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-200 text-sm">Kathmandu, Nepal</p>
                  <p className="text-xs text-gray-400">Thamel – Ward No. 26</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <p className="text-gray-200 text-sm">+977 1-4444444</p>
                  <p className="text-xs text-gray-400">24/7 Medical Support</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-200 text-sm">
                    support@swasthyaconnect.com
                  </p>
                  <p className="text-xs text-gray-400">
                    Professional Support Team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white text-lg mb-5 font-semibold">Platform</h3>
            <ul className="space-y-3">
              {platformLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-gray-400 flex items-center gap-2 hover:text-white transition"
                  >
                    <span className="text-xs text-blue-400">{link.icon}</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white text-lg mb-5 font-semibold">Support & Legal</h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                    className="text-sm text-gray-400 flex items-center gap-2 hover:text-white transition"
                  >
                    <span className="text-xs text-teal-400">{link.icon}</span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-400">© 2024 Swasthya Connect — All Rights Reserved.</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                <Shield className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-gray-500">HIPAA-Compliant Healthcare Platform</span>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Crafted by <span className="text-teal-400 font-medium">@HMK</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
