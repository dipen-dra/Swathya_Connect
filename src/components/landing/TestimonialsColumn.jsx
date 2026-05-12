import React from "react";
import { motion } from "framer-motion";

export const TestimonialsColumn = (props) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ quote, avatar, name, role }, i) => (
                <div 
                  className="p-10 rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-teal-900/5 max-w-xs w-full group hover:border-teal-100 transition-colors" 
                  key={`${index}-${i}`}
                >
                  <div className="text-gray-700 font-serif italic mb-6 leading-relaxed">"{quote}"</div>
                  <div className="flex items-center gap-4 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={avatar}
                      alt={name}
                      className="h-12 w-12 rounded-2xl object-cover shadow-sm group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-900 leading-5">{name}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
