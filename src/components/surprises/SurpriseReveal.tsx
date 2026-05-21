"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 2,
    size: 4 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <motion.span
          key={star.id}
          className="absolute text-yellow-300"
          style={{
            left: `${star.x}%`,
            top: -10,
            fontSize: star.size,
          }}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: "100%", opacity: [0, 1, 0] }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ✦
        </motion.span>
      ))}
    </div>
  );
}

export default function SurpriseReveal({
  message,
}: {
  message: string;
}) {
  const [opened, setOpened] = useState(false);

  const handleOpen = useCallback(() => {
    setOpened(true);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl min-h-[200px]">
      {opened && <StarField />}

      <div className="relative z-10 flex flex-col items-center py-4">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key="sealed"
              className="flex flex-col items-center gap-3 cursor-pointer"
              onClick={handleOpen}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-6xl">🎁</span>
              <span className="text-xs text-rose-400 font-caveat">Tap to open</span>
            </motion.button>
          ) : (
            <motion.div
              key="revealed"
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <motion.span
                className="text-5xl block"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 12 }}
              >
                ✨
              </motion.span>

              {message ? (
                <p className="text-lg text-slate-700 whitespace-pre-line font-caveat leading-relaxed max-w-sm">
                  {message}
                </p>
              ) : (
                <p className="text-lg text-slate-700 font-caveat">
                  Some surprises are best left unspoken. ♥
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
