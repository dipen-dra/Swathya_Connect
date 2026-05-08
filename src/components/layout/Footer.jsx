import { Shield, MapPin, Phone, Mail, Facebook, Twitter, Instagram, ArrowUpRight } from "lucide-react";
import Logo from "@/assets/swasthyalogo.png";

export default function Footer() {
  const platformLinks = [
    { name: "Features", href: "#features" },
    { name: "Services", href: "#services" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Health Store", href: "/store" },
  ];

  const supportLinks = [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Service", href: "#" },
    { name: "Security", href: "#" },
    { name: "Help Center", href: "#" },
  ];

  const socialLinks = [
    {
      icon: <Facebook className="w-5 h-5" />,
      href: "https://facebook.com",
      label: "Facebook",
      className: "hover:bg-teal-600 hover:shadow-teal-600/20"
    },
    {
      icon: <Twitter className="w-5 h-5" />,
      href: "https://twitter.com",
      label: "Twitter",
      className: "hover:bg-teal-600 hover:shadow-teal-600/20"
    },
    {
      icon: <Instagram className="w-5 h-5" />,
      href: "https://instagram.com",
      label: "Instagram",
      className: "hover:bg-teal-600 hover:shadow-teal-600/20"
    },
  ];

  return (
    <footer className="bg-[#080c14] text-gray-400 relative overflow-hidden" id="footer">
      {/* Top Decorative Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500/50 to-transparent"></div>

      <div className="max-w-[1440px] mx-auto px-8 pt-24 pb-12">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24 mb-20">

          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-10">
            <div className="flex items-center gap-4">
              <div className="bg-white/5 p-3 rounded-[1.25rem] backdrop-blur-md border border-white/5 shadow-2xl">
                <img
                  src={Logo}
                  alt="Swasthya Connect"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <span className="text-white text-3xl font-bold tracking-tight font-serif">
                Swasthya <span className="text-teal-500 italic">Connect</span>
              </span>
            </div>

            <p className="text-gray-500 leading-relaxed text-lg font-medium pr-8">
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
                  className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all duration-500 border border-white/5 ${social.className}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links Section */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">

            {/* Platform */}
            <div>
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Platform</h3>
              <ul className="space-y-5">
                {platformLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-teal-400 transition-all duration-300 flex items-center group text-base font-medium"
                    >
                      {link.name}
                      <ArrowUpRight className="w-3 h-3 ml-2 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Support</h3>
              <ul className="space-y-5">
                {supportLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href={link.href}
                      className="text-gray-500 hover:text-teal-400 transition-all duration-300 flex items-center group text-base font-medium"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-8">
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">Contact Us</h3>

              <div className="flex items-start gap-5 group">
                <div className="mt-1 w-10 h-10 rounded-2xl bg-teal-500/5 flex items-center justify-center group-hover:bg-teal-500/20 transition-all duration-500 border border-teal-500/10">
                  <MapPin className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Headquarters</p>
                  <p className="text-gray-500 text-sm mt-1">Kathmandu, Maitidevi, NP</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="mt-1 w-10 h-10 rounded-2xl bg-teal-500/5 flex items-center justify-center group-hover:bg-teal-500/20 transition-all duration-500 border border-teal-500/10">
                  <Phone className="w-4 h-4 text-teal-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Phone</p>
                  <p className="text-gray-500 text-sm mt-1">+977 9849423853</p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="mt-1 w-10 h-10 rounded-2xl bg-teal-500/5 flex items-center justify-center group-hover:bg-teal-500/20 transition-all duration-500 border border-teal-500/10">
                  <Mail className="w-4 h-4 text-teal-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm">Email</p>
                  <p className="text-gray-500 text-sm mt-1 truncate">dipendrajr999@gmail.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-10 mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/5 border border-teal-500/10">
              <Shield className="w-4 h-4 text-teal-500" />
            </div>
            <span className="text-gray-600 text-xs font-bold uppercase tracking-widest">© 2024 Swasthya Connect. All rights reserved.</span>
          </div>

          <p className="text-xs text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
            Built with Passion by <span className="text-white hover:text-teal-400 transition-colors duration-300">Swasthya Connect</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
