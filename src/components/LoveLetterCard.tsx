"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { getDailyLetter, recordHeart } from "@/lib/love-letter-ga";

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) return;
    setDisplayed("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 25);
    return () => clearInterval(id);
  }, [text]);

  return (
    <p className="text-slate-700 leading-relaxed whitespace-pre-line font-caveat text-base">
      {displayed}
      {!done && <span className="animate-pulse text-rose-400">|</span>}
    </p>
  );
}

export default function LoveLetterCard() {
  const [sealed, setSealed] = useState(true);
  const [letter, setLetter] = useState("");
  const [generation, setGeneration] = useState(1);
  const [heartCount, setHeartCount] = useState(0);
  const [heartBurst, setHeartBurst] = useState(false);

  useEffect(() => {
    const data = getDailyLetter();
    setLetter(data.letter);
    setGeneration(data.generation);
    setHeartCount(data.heartCount);
  }, []);

  const handleOpen = useCallback(() => {
    setSealed(false);
  }, []);

  const handleHeart = useCallback(() => {
    const result = recordHeart();
    setHeartCount(result.heartCount);
    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);
  }, []);

  if (!letter) return null;

  return (
    <motion.section
      className="w-full max-w-md mx-auto my-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="relative bg-white/50 backdrop-blur-xl border border-white/80 rounded-[2rem] p-6 text-center shadow-[0_10px_40px_-10px_rgba(255,192,203,0.2)]">
        <AnimatePresence mode="wait">
          {sealed ? (
            <motion.button
              key="envelope"
              onClick={handleOpen}
              className="w-full flex flex-col items-center gap-3 py-4 cursor-pointer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              transition={{ type: "spring", stiffness: 200, damping: 16 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-20 h-16">
                <div className="absolute inset-0 bg-rose-100 rounded-lg shadow-inner" />
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[40px] border-r-[40px] border-b-[24px] border-l-transparent border-r-transparent border-b-rose-200 -top-0.5" />
                </div>
                <span className="absolute inset-0 flex items-center justify-center text-2xl">
                  💌
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-caveat text-rose-400 font-bold">
                  A letter for you
                </p>
                <p className="text-[0.55rem] text-slate-400 font-caveat">
                  Letter #{generation} · Tap to open
                </p>
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="letter"
              className="text-left space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-rose-400">♥</span>
                  <span className="text-xs text-rose-400 font-caveat uppercase tracking-wider">
                    Letter #{generation}
                  </span>
                </div>
                <button
                  onClick={handleHeart}
                  className="relative p-2 rounded-full hover:bg-rose-50 transition-colors"
                >
                  <Heart
                    size={16}
                    className={`transition-colors ${
                      heartCount > 0
                        ? "fill-rose-400 text-rose-400"
                        : "text-slate-300 hover:text-rose-400"
                    }`}
                  />
                  {heartBurst && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Heart size={16} className="fill-rose-400 text-rose-400" />
                    </motion.div>
                  )}
                  {heartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 text-[0.45rem] text-rose-400 font-bold">
                      {heartCount}
                    </span>
                  )}
                </button>
              </div>
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100/50 min-h-[100px]">
                <TypewriterText text={letter} />
              </div>
              <p className="text-[0.5rem] text-slate-300 font-caveat text-center">
                A new letter evolves every day ♥
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
