"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Candle({
  id,
  lit,
  onBlow,
}: {
  id: number;
  lit: boolean;
  onBlow: () => void;
}) {
  return (
    <motion.g
      style={{ cursor: lit ? "pointer" : "default" }}
      onClick={lit ? onBlow : undefined}
      whileTap={lit ? { scale: 0.9 } : undefined}
    >
      <rect
        x={id === 1 ? -2 : id === 2 ? 14 : 30}
        y="-16"
        width="6"
        height="16"
        rx="2"
        fill={lit ? "#FCD34D" : "#9CA3AF"}
      />
      {lit && (
        <motion.ellipse
          cx={id === 1 ? 1 : id === 2 ? 17 : 33}
          cy="-20"
          rx="4"
          ry="6"
          fill="#F97316"
          animate={{ scaleY: [1, 1.3, 1] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
      {lit && (
        <motion.ellipse
          cx={id === 1 ? 1 : id === 2 ? 17 : 33}
          cy="-22"
          rx="2"
          ry="3"
          fill="#FBBF24"
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ duration: 0.4, repeat: Infinity }}
        />
      )}
    </motion.g>
  );
}

export default function CandleCake({
  onAllBlown,
}: {
  onAllBlown?: () => void;
}) {
  const [lit, setLit] = useState([true, true, true]);
  const [showMessage, setShowMessage] = useState(false);

  const totalCandles = 3;

  const handleBlow = (index: number) => {
    const next = [...lit];
    next[index] = false;
    setLit(next);

    if (next.every((l) => !l)) {
      setTimeout(() => setShowMessage(true), 500);
      onAllBlown?.();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-md">
        <rect x="15" y="45" width="90" height="30" rx="8" fill="#FBCFE8" />
        <rect x="25" y="35" width="70" height="15" rx="6" fill="#FDF2F8" />
        <rect x="10" y="50" width="100" height="35" rx="10" fill="#F9A8D4" />
        <rect x="5" y="70" width="110" height="12" rx="6" fill="#F472B6" />
        <ellipse cx="60" cy="45" rx="18" ry="5" fill="#FDF2F8" />

        {[0, 1, 2].map((i) => (
          <Candle key={i} id={i + 1} lit={lit[i]} onBlow={() => handleBlow(i)} />
        ))}

        <text x="60" y="90" textAnchor="middle" fill="#BE185D" fontSize="8" fontWeight="bold">
          happy birthday
        </text>
      </svg>

      <AnimatePresence>
        {!lit.some((l) => l) && !showMessage && (
          <motion.p
            className="text-xs text-rose-400 animate-pulse font-caveat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ✨ Make a wish... ✨
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMessage && (
          <motion.p
            className="text-sm text-rose-500 font-caveat text-center"
            initial={{ opacity: 0, scale: 0.5, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 12 }}
          >
            It&apos;s already come true. ♥
          </motion.p>
        )}
      </AnimatePresence>

      {lit.some((l) => l) && (
        <p className="text-xs text-slate-400 font-caveat">Tap the candles to blow them out!</p>
      )}
    </div>
  );
}
