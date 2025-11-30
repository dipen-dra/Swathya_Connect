import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Menu } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all ${
        scrolled ? "bg-white shadow-md" : "bg-white"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-blue-600 rounded-lg h-10 w-10 flex items-center justify-center">
            <span className="text-white text-xl font-bold">💙</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">
            Swasthya <span className="text-teal-600">Connect</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <li><a href="#features">Features</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#how">How it Works</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger className="md:hidden">
            <Menu className="h-7 w-7 text-gray-700" />
          </SheetTrigger>

          <SheetContent side="left" className="p-6">
            <ul className="flex flex-col gap-6 text-lg text-gray-800 font-medium">
              <li><a href="#features">Features</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#how">How it Works</a></li>
              <li><a href="#reviews">Reviews</a></li>
              <li><a href="#contact">Contact</a></li>

              <Link to="/login">
                <Button className="w-full" variant="outline">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                  Get Started
                </Button>
              </Link>
            </ul>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
