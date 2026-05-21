"use client";

import { motion, AnimatePresence } from "framer-motion";
import { getCountdown, getJourneyPhase, type JourneyPhase } from "@/utils/time";
import type { JourneyConfig } from "@/lib/types";
import { useNow } from "@/lib/dev-time";

const phrases: Record<JourneyPhase, { heading: string; sub: string }> = {
  "pre-boarding": {
    heading: "Counting down the seconds...",
    sub: "Almost time to pack the bags! ✨",
  },
  "in-transit": {
    heading: "All aboard! Next stop: You.",
    sub: "The journey has officially begun 🚂",
  },
  arrived: {
    heading: "Together at last.",
    sub: "Welcome to the present moment. ♥",
  },
};

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        key={value}
        className="w-16 h-20 md:w-20 md:h-24 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-[1.5rem] border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <span
          suppressHydrationWarning
          className="text-3xl md:text-5xl font-nunito font-bold text-rose-400 tracking-tighter"
        >
          {String(value).padStart(2, "0")}
        </span>
      </motion.div>
      <span className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400 font-semibold">
        {label}
      </span>
    </div>
  );
}

// Soft, floating background blobs for the aesthetic feel
function AmbientBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem]">
      <motion.div
        className="absolute -top-20 -left-20 w-72 h-72 bg-pink-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        animate={{
          x: [0, 30, 0],
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-72 h-72 bg-rose-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
        animate={{
          x: [0, -30, 0],
          y: [0, 30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </div>
  );
}

export default function HeroCountdown({ config }: { config: JourneyConfig }) {
  const now = useNow();
  const boarding = new Date(config.trainBoardingDate);
  const arrival = new Date(config.arrivalDate);
  const phase = getJourneyPhase(boarding, arrival, now);
  const target = phase === "arrived" ? boarding : arrival;
  const countdown = getCountdown(target, now);
  const { heading, sub } = phrases[phase];
  const isArrived = phase === "arrived";

  return (
    <motion.section
      suppressHydrationWarning
      className="relative w-full max-w-3xl mx-auto mt-8 mb-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 80, damping: 20 }}
    >
      {/* The Glassmorphism Container */}
      <div className="relative bg-white/50 backdrop-blur-xl border border-white/80 rounded-[3rem] p-10 md:p-16 text-center shadow-[0_20px_60px_-15px_rgba(255,192,203,0.3)]">
        
        <AmbientBlobs />

        <div className="relative z-10 space-y-8">
          {/* Headers */}
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.h1
                key={phase}
                className="text-2xl md:text-3xl font-nunito font-bold text-slate-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {heading}
              </motion.h1>
            </AnimatePresence>
            <p className="text-lg md:text-xl text-rose-400 font-caveat tracking-wide">
              {sub}
            </p>
          </div>

          {/* Countdown Timer */}
          {isArrived ? (
            <motion.div
              suppressHydrationWarning
              className="py-8 text-6xl md:text-8xl font-caveat text-rose-400 drop-shadow-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              00:00:00
            </motion.div>
          ) : (
            <div className="flex items-center justify-center gap-3 md:gap-6 py-4">
              <TimeBlock value={countdown.days} label="Days" />
              <span className="text-3xl text-rose-200 font-light pb-6">:</span>
              <TimeBlock value={countdown.hours} label="Hours" />
              <span className="text-3xl text-rose-200 font-light pb-6">:</span>
              <TimeBlock value={countdown.minutes} label="Mins" />
              <span className="text-3xl text-rose-200 font-light pb-6 hidden sm:block">:</span>
              <div className="hidden sm:block">
                <TimeBlock value={countdown.seconds} label="Secs" />
              </div>
            </div>
          )}

          {/* Location Pointers */}
          <div className="pt-4 flex items-center justify-center gap-4 text-sm text-slate-400 font-caveat">
            <span className="px-4 py-1.5 bg-white/60 rounded-full shadow-sm border border-white">
              {config.startLocation}
            </span>
            <span className="text-rose-300">✈️</span>
            <span className="px-4 py-1.5 bg-white/60 rounded-full shadow-sm border border-white">
              {config.endLocation}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}