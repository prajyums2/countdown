"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import LoveLetter from "./LoveLetter";
import CandleCake from "./CandleCake";
import type { Station } from "@/lib/types";

function MemoryStrip({ stations }: { stations: Station[] }) {
  if (!stations.length) return null;

  return (
    <div className="w-full overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex gap-3 pb-2">
        {stations.map((s) => (
          <motion.div
            key={s.id}
            className="flex-shrink-0 w-20 bg-white rounded-xl p-2 shadow-sm border border-rose-50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 14 }}
          >
            <div className="w-full aspect-square rounded-lg bg-rose-50 flex items-center justify-center text-2xl mb-1">
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                s.emoji
              )}
            </div>
            <p className="text-[0.5rem] text-slate-500 truncate text-center font-caveat">
              {s.name}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BirthdaySurprise({
  message,
  spotifyUrl,
  stations,
}: {
  message: string;
  spotifyUrl: string;
  stations: Station[];
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ["#FBCFE8", "#F9A8D4", "#F472B6", "#FDF2F8"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ["#FBCFE8", "#F9A8D4", "#F472B6", "#FDF2F8"],
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();
  }, []);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-1">
        <motion.h3
          className="text-2xl font-caveat text-rose-500"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 12 }}
        >
          Happy Birthday! 🎂
        </motion.h3>
        <p className="text-xs text-slate-400 font-caveat">
          Make a wish. It&apos;s already come true.
        </p>
      </div>

      <div className="grid gap-6">
        <CandleCake />

        <LoveLetter message={message} />

        {spotifyUrl && (
          <div className="w-full">
            <iframe
              src={spotifyUrl.includes("/embed/") ? spotifyUrl : spotifyUrl.replace("open.spotify.com/", "open.spotify.com/embed/")}
              width="100%"
              height="80"
              allow="encrypted-media"
              className="rounded-xl"
            />
          </div>
        )}

        {stations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-rose-400 font-caveat text-center">
              Our journey so far...
            </p>
            <MemoryStrip stations={stations} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
