"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface DeliveryAnimationProps {
  onComplete: () => void;
}

export default function DeliveryAnimation({ onComplete }: DeliveryAnimationProps) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDone(true);
      onComplete();
    }, 1800);
    return () => clearTimeout(t);
  }, [onComplete]);

  if (done) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
        <motion.path
          d="M 40 360 Q 120 180 200 120 Q 280 60 360 40"
          fill="none"
          stroke="rgba(244,143,177,0.3)"
          strokeWidth="2"
          strokeDasharray="6 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
        <motion.g
          initial={{ x: 40, y: 360, rotate: -45 }}
          animate={{ x: 360, y: 40, rotate: -45 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.path
            d="M 0 0 L 18 -8 L 12 0 L 18 8 Z"
            fill="#F9A8D4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          />
          <motion.path
            d="M 18 -8 L 14 0 L 18 8"
            fill="none"
            stroke="#F472B6"
            strokeWidth="0.5"
          />
        </motion.g>
      </svg>
      <div className="absolute bottom-20 text-center">
        <motion.p
          className="text-white/80 text-sm font-caveat"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Snap sent with love ♥
        </motion.p>
      </div>
    </motion.div>
  );
}
