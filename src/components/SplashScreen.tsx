"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#FFF9F6]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-5xl mb-4"
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        🚂
      </motion.div>
      <h1 className="text-2xl font-caveat text-gradient-rose mb-2">
        Countdown to Meghs
      </h1>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>
    </motion.div>
  );
}
