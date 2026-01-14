import { Shield, MapPin, Phone, Mail, Facebook, Twitter, Instagram } from "lucide-react";
import Logo from "@/assets/swasthyalogo.png";

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

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      href: "https://facebook.com",
      label: "Facebook",
      className: "hover:bg-[#1877F2] hover:shadow-[#1877F2]/20"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com",
      label: "Twitter",
      className: "hover:bg-[#1DA1F2] hover:shadow-[#1DA1F2]/20"
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "https://instagram.com",
      label: "Instagram",
      className: "hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:shadow-[#dc2743]/20"
    },
  ];

  return (
    <footer className="bg-[#0b1120] text-gray-300 relative overflow-hidden" id="footer">
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500"></div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12">
        <div className="grid md:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand Section - Spans 4 columns */}
          <div className="md:col-span-5 lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-white/5 p-2 rounded-xl backdrop-blur-sm">
                <img
                  src={Logo}
                  alt="Swasthya Connect"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="text-white text-2xl font-bold tracking-tight">
                Swasthya Connect
              </span>
            </div>

            <p className="text-gray-400 leading-relaxed text-sm pr-4">
              Reinventing healthcare access in Nepal. We bridge the gap between patients
              and providers through secure, efficient, and compassionate digital solutions.
            </p>

            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg ${social.className}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section - Spans 8 columns (split into 3) */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Platform</h3>
              <ul className="space-y-4">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-teal-400 transition-colors flex items-center group text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500/50 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Support</h3>
              <ul className="space-y-4">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={`#${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                      className="text-gray-400 hover:text-blue-400 transition-colors flex items-center group text-sm"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-3 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info (Updated) */}
            <div className="space-y-6">
              <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-6">Contact Us</h3>

              {/* Location */}
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Headquarters</p>
                  <p className="text-gray-400 text-sm mt-0.5">Kathmandu, Maitidevi</p>
                  <p className="text-gray-500 text-xs text-nowrap">Nepal</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition-colors">
                  <Phone className="w-4 h-4 text-teal-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Phone</p>
                  <p className="text-gray-400 text-sm mt-0.5">+977 9849423853</p>
                  <p className="text-gray-500 text-xs">Mon-Fri, 9am - 6pm</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="mt-1 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium">Email</p>
                  <p className="text-gray-400 text-sm mt-0.5 break-words">dipendrajr999@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800/60 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-teal-500/10">
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <span className="text-gray-500 text-xs">© 2024 Swasthya Connect. All rights reserved.</span>
          </div>

          <p className="text-sm text-gray-500 flex items-center gap-1.5">
            Designed & Developed by <span className="text-white font-medium hover:text-teal-400 transition-colors cursor-default">Swasthya Connect</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
