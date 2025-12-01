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
import Logo from "@/assets/swasthyalogo.png"; // <-- Add your logo import here

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollToId = (id) => {
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
    { label: "Contact", id: "footer" },
  ];

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all ${
        scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur"
      }`}
    >
      <div className="max-w-[1350px] mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => scrollToId("hero")}
        >
          <img
            src={Logo}
            alt="Swasthya Connect Logo"
            className="w-14 h-14 object-contain"
          />
          <span className="text-lg font-semibold text-blue-700">
          </span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex gap-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToId(item.id)}
              className="text-gray-700 hover:text-blue-600"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => navigate("/login")}
            className="text-blue-600 hover:underline"
          >
            Sign In
          </button>
        </div>

      </div>
    </header>
  );
}
