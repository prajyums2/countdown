"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    }, 30);
    return () => clearInterval(id);
  }, [text]);

  return (
    <div className="space-y-2">
      <p className="text-slate-700 leading-relaxed whitespace-pre-line font-caveat text-lg">
        {displayed}
        {!done && <span className="animate-pulse text-rose-400">|</span>}
      </p>
    </div>
  );
}

export default function LoveLetter({
  message,
  onOpen,
}: {
  message: string;
  onOpen?: () => void;
}) {
  const [sealed, setSealed] = useState(true);

  const handleOpen = useCallback(() => {
    setSealed(false);
    onOpen?.();
  }, [onOpen]);

  if (!message) return null;

  return (
    <div className="flex flex-col items-center">
      <AnimatePresence mode="wait">
        {sealed ? (
          <motion.button
            key="envelope"
            className="relative w-48 h-36 bg-rose-100 rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform flex items-center justify-center"
            onClick={handleOpen}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 overflow-hidden rounded-lg">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[96px] border-r-[96px] border-b-[40px] border-l-transparent border-r-transparent border-b-rose-200 -top-1" />
            </div>
            <span className="relative text-4xl z-10">💌</span>
            <p className="absolute -bottom-7 text-xs text-rose-400 font-caveat whitespace-nowrap">
              Tap to open
            </p>
          </motion.button>
        ) : (
          <motion.div
            key="letter"
            className="bg-white rounded-xl p-5 shadow-md max-w-md w-full border border-rose-100"
            initial={{ opacity: 0, y: 20, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-rose-400">♥</span>
              <span className="text-xs text-rose-400 font-caveat uppercase tracking-wider">
                A little note for you
              </span>
            </div>
            <TypewriterText text={message} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
