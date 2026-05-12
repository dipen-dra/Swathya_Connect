// import { useState, useEffect } from "react";
// import { Shield } from "lucide-react";
// import { useNavigate } from "react-router-dom";


// export default function Navbar() {
//   const navigate = useNavigate();
//   const [scrolled, setScrolled] = useState(false);

//   useEffect(() => {
//     const handler = () => setScrolled(window.scrollY > 40);
//     window.addEventListener("scroll", handler);
//     return () => window.removeEventListener("scroll", handler);
//   }, []);

//   const scrollToId = (id) => {
//     const element = document.getElementById(id);
//     if (!element) return;

//     window.scrollTo({
//       top: element.offsetTop - 80,
//       behavior: "smooth",
//     });
//   };

//   const navItems = [
//     { label: "Features", id: "features" },
//     { label: "Services", id: "services" },
//     { label: "How It Works", id: "how-it-works" },
//     { label: "Reviews", id: "reviews" },
//     { label: "Contact", id: "footer" },
//   ];

//   return (
//     <header
//       className={`fixed top-0 w-full z-50 transition-all ${
//         scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur"
//       }`}
//     >
//       <div className="max-w-[1350px] mx-auto px-6 h-20 flex items-center justify-between">

//         {/* Logo */}
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={() => scrollToId("hero")}
//         >
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
//             <Shield className="w-6 h-6 text-white" />
//           </div>
//           <span className="text-lg font-semibold text-blue-700">Swasthya Connect</span>
//         </div>

//         {/* Nav */}
//         <nav className="hidden md:flex gap-8">
//           {navItems.map((item) => (
//             <button
//               key={item.id}
//               onClick={() => scrollToId(item.id)}
//               className="text-gray-700 hover:text-blue-600"
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         {/* Actions */}
//         <div className="hidden md:flex gap-3">
//           <button
//             onClick={() => navigate("/login")}
//             className="text-blue-600 hover:underline"
//           >
//             Sign In
//           </button>
//         </div>

//       </div>
//     </header>
//   );
// }



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import Logo from "@/assets/swasthyalogo.png";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToId = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (!element) return;

    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: "smooth",
    });
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "Services", id: "services" },
    { label: "How It Works", id: "how-it-works" },
    { label: "Reviews", id: "reviews" },
  ];

  return (
    <header
      className={`fixed z-50 transition-all duration-700 w-full ${
        scrolled 
          ? "top-4 px-4" 
          : "top-0 px-0"
      }`}
    >
      <div className={`mx-auto transition-all duration-700 ${
        scrolled 
          ? "max-w-6xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-gray-100/50 py-3" 
          : "max-w-full bg-transparent py-5"
      }`}>
        <div className="max-w-[1440px] mx-auto px-8 flex items-center justify-between">
          
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group transition-transform active:scale-95"
            onClick={() => scrollToId("hero")}
          >
            <img
              src={Logo}
              alt="Swasthya Connect"
              className={`transition-all duration-700 ${scrolled ? "h-10 md:h-12" : "h-12 md:h-14"} object-contain`}
            />
            <div className={`hidden lg:block h-6 w-px transition-colors duration-700 mx-2 ${scrolled ? "bg-gray-200" : "bg-white/20"}`}></div>
            <span className={`text-xl font-bold hidden lg:block tracking-tight transition-colors duration-700 ${scrolled ? "text-gray-900" : "text-white"}`}>
              Swasthya <span className="text-teal-600">Connect</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-10">
            <a 
              href="/store" 
              className={`text-[13px] font-black uppercase tracking-widest transition-colors duration-700 flex items-center gap-2 group ${scrolled ? "text-gray-600 hover:text-teal-600" : "text-white/70 hover:text-white"}`}
            >
              <ShoppingCart className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Store
            </a>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className={`text-[13px] font-black uppercase tracking-widest transition-colors duration-700 ${scrolled ? "text-gray-600 hover:text-teal-600" : "text-white/70 hover:text-white"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              onClick={() => navigate("/register")}
              className={`bg-teal-600 hover:bg-teal-700 text-white px-8 transition-all duration-700 rounded-xl font-black text-[12px] uppercase tracking-widest shadow-xl shadow-teal-600/20 active:scale-95 ${scrolled ? "h-11" : "h-12"}`}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 rounded-2xl bg-gray-50 text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col p-8 pt-24 animate-in slide-in-from-right duration-500">
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-8 right-8 p-3 rounded-xl bg-gray-50"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col gap-8">
            <a 
              href="/store" 
              className="text-3xl font-black text-gray-900 font-serif"
              onClick={() => setMobileMenuOpen(false)}
            >
              Health Store
            </a>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className="text-left text-3xl font-black text-gray-900 font-serif"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <Button
              onClick={() => navigate("/register")}
              className="h-16 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-teal-100"
            >
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
