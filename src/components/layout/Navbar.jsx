import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Button } from "../ui/button";

export default function Navbar({ onNavigateToLogin }) {
  const [scrolled, setScrolled] = useState(false);

  // Detect Scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth Scroll
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 90, // navbar height offset
        behavior: "smooth",
      });
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Services", id: "services" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Reviews", id: "reviews" },
    { label: "Contact", id: "footer" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-md backdrop-blur-md"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-[1350px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => scrollToSection("hero")}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-lg font-semibold text-blue-700">
              Swasthya Connect
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-700 hover:text-blue-700 transition text-sm"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onNavigateToLogin}
              className="text-blue-600"
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6"
              onClick={onNavigateToLogin}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
