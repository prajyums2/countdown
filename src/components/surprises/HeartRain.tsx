"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface HeartDrop {
  id: number;
  x: number;
  delay: number;
  size: number;
  duration: number;
}

export default function HeartRain({ active = true }: { active?: boolean }) {
  const [hearts, setHearts] = useState<HeartDrop[]>([]);

  useEffect(() => {
    if (!active) {
      setHearts([]);
      return;
    }

    const generated: HeartDrop[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      size: 12 + Math.random() * 16,
      duration: 3 + Math.random() * 3,
    }));
    setHearts(generated);

    const id = setInterval(() => {
      setHearts((prev) => [
        ...prev.slice(-25),
        {
          id: Date.now(),
          x: Math.random() * 100,
          delay: 0,
          size: 12 + Math.random() * 16,
          duration: 3 + Math.random() * 3,
        },
      ]);
    }, 600);

    return () => clearInterval(id);
  }, [active]);

  if (!active || !hearts.length) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {hearts.map((heart) => (
        <motion.span
          key={heart.id}
          className="absolute text-rose-300 select-none"
          style={{
            left: `${heart.x}%`,
            top: -30,
            fontSize: heart.size,
          }}
          initial={{ y: -30, opacity: 0.8, rotate: 0 }}
          animate={{ y: "110vh", opacity: 0, rotate: 20 }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          ♥
        </motion.span>
      ))}
    </div>
  );
}
