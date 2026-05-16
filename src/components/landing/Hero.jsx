import React from "react";
import { Info, CheckCircle2, Calendar, Star, ShieldCheck, Activity, Target, Plus, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShaderAnimation } from "@/components/ui/ShaderAnimation";
import { Typewriter } from "@/components/ui/Typewriter";
import { motion } from "framer-motion";

// Import generated images
import doctorImg from "/Users/dipendra/.gemini/antigravity/brain/1a245cd5-725c-4c29-b37a-5f97d423b291/premium_doctor_hero_1778591087256.png";
import mobilePreviewImg from "/Users/dipendra/.gemini/antigravity/brain/1a245cd5-725c-4c29-b37a-5f97d423b291/mobile_preview_consultation_1778591111614.png";

const AnnotationPoint = ({ x, y, label, sublabel, side = "right" }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: 1, duration: 0.5 }}
    className="absolute z-30" 
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className="relative group">
      {/* Pulse effect */}
      <div className="absolute inset-0 bg-teal-400 rounded-full animate-ping opacity-75 scale-150"></div>
      
      {/* Dot */}
      <div className="relative w-3 h-3 bg-white border-2 border-teal-500 rounded-full cursor-pointer shadow-[0_0_20px_rgba(20,184,166,0.8)] transition-transform group-hover:scale-125"></div>
      
      {/* Label Box */}
      <div className={`absolute ${side === "right" ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none translate-x-2 group-hover:translate-x-0`}>
        <p className="text-[10px] font-black text-teal-400 uppercase tracking-tighter mb-0.5">{label}</p>
        <p className="text-xs font-bold text-white leading-none">{sublabel}</p>
      </div>

      {/* Persistent label (always visible in reference design) */}
      <div className={`absolute ${side === "right" ? "left-6" : "right-6"} top-1/2 -translate-y-1/2 flex items-center bg-black/40 backdrop-blur-lg border border-white/10 px-2 py-1 rounded-lg whitespace-nowrap opacity-80 pointer-events-none`}>
         <Plus className="w-2.5 h-2.5 text-teal-400 mr-1.5" />
         <p className="text-[9px] font-bold text-white uppercase tracking-wider">{label}</p>
      </div>
    </div>
  </motion.div>
);

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative w-full min-h-screen pt-32 pb-20 overflow-hidden bg-[#0B1221]">
      {/* Dynamic Shader Background */}
      <ShaderAnimation />

      {/* Geometric Background Text (VYRE-like) */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none z-0">
        <h1 className="text-[60vw] font-black tracking-tighter leading-none text-white">SW</h1>
      </div>

      <div className="max-w-[1440px] mx-auto px-8 relative z-10 h-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center min-h-[70vh]">
          
          {/* LEFT CONTENT (3-4 cols) */}
          <div className="lg:col-span-4 z-20">
            {/* Badge */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/70 px-4 py-2 rounded-full mb-8"
            >
              <Zap className="w-4 h-4 text-teal-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Nepal's Next-Gen Health Platform
              </span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-8 tracking-tight font-serif">
              Advanced <br />
              <span className="text-teal-400 italic">
                <Typewriter 
                  text={["Redefined", "Simplified", "Accessible"]} 
                  speed={70}
                  waitTime={2500}
                  deleteSpeed={40}
                  cursorChar="_"
                />
              </span> care. <br />
              Built for Nepal.
            </h1>

            {/* Description */}
            <p className="text-white/40 text-base mb-12 leading-relaxed max-w-sm font-medium">
              Experience the future of medical care. Connect with top specialists, 
              manage prescriptions, and order medicines digitally.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 mb-12">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white h-14 px-8 rounded-xl font-black text-[12px] uppercase tracking-widest transition-all active:scale-95"
                onClick={() => navigate("/login")}
              >
                Book Appointment
              </Button>
              
              <div className="flex flex-col gap-1 justify-center">
                 <div className="flex items-center gap-2 text-teal-400 text-[10px] font-black uppercase tracking-widest">
                    <Target className="w-3 h-3" />
                    Explore Network
                 </div>
                 <div className="h-0.5 w-full bg-teal-400/20 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-400 w-1/3"></div>
                 </div>
              </div>
            </div>

            {/* Bottom Info Blocks (Like in reference) */}
            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-8 mt-12">
               <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Network Size</p>
                  <p className="text-xl font-bold text-white">10K+ Verified</p>
               </div>
               <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">Uptime Range</p>
                  <p className="text-xl font-bold text-white">24/7 Digital</p>
               </div>
            </div>
          </div>

          {/* CENTER CONTENT (4-5 cols) — Person Image */}
          <div className="lg:col-span-4 relative flex justify-center items-center">
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="relative w-full max-w-md aspect-[4/5] z-10"
             >
                {/* Decorative glow behind image */}
                <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-[120px] scale-110"></div>
                
                <img 
                   src={doctorImg} 
                   alt="Specialist Doctor" 
                   className="w-full h-full object-cover rounded-[3rem] relative z-10 grayscale-[0.2] contrast-[1.1]"
                />

                {/* Annotation Points */}
                <AnnotationPoint x={45} y={15} label="Expertise" sublabel="MD Specialist" />
                <AnnotationPoint x={55} y={45} label="Precision" sublabel="Digital Health" side="left" />
                <AnnotationPoint x={40} y={75} label="Security" sublabel="Blockchain Ready" />
                <AnnotationPoint x={20} y={40} label="Response" sublabel="15min Average" side="right" />
             </motion.div>
          </div>

          {/* RIGHT CONTENT (3-4 cols) — Secondary Preview & Additional Text */}
          <div className="lg:col-span-4 z-20 flex flex-col justify-between h-full py-12">
             <div className="max-w-xs ml-auto">
                <p className="text-white/40 text-sm leading-relaxed font-medium mb-12 text-right">
                  Designed with advanced medical infrastructure that retain 
                  patient history without bulk. Built for daily care and 
                  high output healthcare movement.
                </p>

                {/* Floating Mobile Preview Card */}
                <motion.div 
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="relative rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 group"
                >
                   <img src={mobilePreviewImg} alt="Mobile Consultation" className="w-full h-auto transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                      <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">Live Consult</p>
                      <p className="text-base font-bold text-white leading-tight">Adaptive Care System</p>
                      <div className="mt-4 flex items-center justify-between">
                         <span className="text-[10px] text-white/50 uppercase tracking-tighter">Product Details</span>
                         <Plus className="w-4 h-4 text-white" />
                      </div>
                   </div>
                </motion.div>
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
