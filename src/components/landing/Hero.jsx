import { Info, Video, CheckCircle2, Calendar, Star, ShieldCheck, Activity } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section id="hero" className="relative w-full pt-32 pb-20 overflow-hidden bg-white">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 -skew-x-12 translate-x-20 z-0"></div>
      <div className="absolute top-40 left-10 w-72 h-72 bg-teal-50 rounded-full blur-3xl opacity-60 z-0"></div>
      
      <div className="max-w-[1440px] mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
          
          {/* LEFT CONTENT */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 text-teal-700 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                Nepal's Trusted Healthcare Network
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 leading-[1.1] mb-8 font-serif tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
              Healthcare <br />
              <span className="text-teal-600 italic">Redefined</span> for <br />
              Modern Nepal.
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-xl mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Experience the future of medical care. Connect with top specialists, 
              manage prescriptions, and order medicines—all from the comfort of your home.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 mb-12 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white h-16 px-10 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-600/20 transition-all active:scale-95"
                onClick={() => navigate("/login")}
              >
                Book Appointment
              </Button>

              <Button 
                variant="outline" 
                className="h-16 px-10 rounded-2xl border-2 border-gray-100 text-gray-700 font-black text-sm uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
              >
                <Video className="w-5 h-5 mr-3 text-teal-600" />
                Watch Video
              </Button>
            </div>

            {/* Stats/Social Proof */}
            <div className="flex flex-wrap items-center gap-10 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-400">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                    <img src={`https://i.pravatar.cc/150?u=doc${i}`} alt="User" />
                  </div>
                ))}
                <div className="w-12 h-12 rounded-full border-4 border-white bg-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  +10k
                </div>
              </div>
              <div className="h-10 w-px bg-gray-100"></div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">4.9/5 Average Rating</p>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT — Modern Dashboard Preview */}
          <div className="relative group animate-in fade-in zoom-in duration-1000">
            {/* Main Preview Image */}
            <div className="relative rounded-[3rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] border-[12px] border-white bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&h=1000&fit=crop"
                alt="Healthcare Dashboard"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-900/20 to-transparent"></div>
            </div>

            {/* Floating Card 1: Appointment */}
            <div className="absolute -left-12 top-20 bg-white p-6 rounded-[2rem] shadow-2xl border border-gray-50 flex items-center gap-5 animate-bounce-slow">
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Next Session</p>
                <p className="text-sm font-bold text-gray-900">Dr. Sarah Wilson</p>
                <p className="text-xs text-teal-600 font-medium">Today, 2:30 PM</p>
              </div>
            </div>

            {/* Floating Card 2: Pulse */}
            <div className="absolute -right-8 bottom-20 bg-gray-900 p-6 rounded-[2.5rem] shadow-2xl text-white min-w-[200px]">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <Activity className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-teal-400 text-xs font-black uppercase tracking-widest animate-pulse">Live</span>
              </div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Health Score</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold">94%</span>
                <span className="text-emerald-400 text-sm font-bold mb-1">↑ 12%</span>
              </div>
              <div className="mt-4 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-teal-400 w-[94%]"></div>
              </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute -z-10 -bottom-20 -right-20 w-80 h-80 bg-teal-100/30 rounded-full blur-[100px]"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
