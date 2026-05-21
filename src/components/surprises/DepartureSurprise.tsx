"use client";

import { motion } from "framer-motion";
import LoveLetter from "./LoveLetter";
import type { Station } from "@/lib/types";

function MemoryMontage({ stations }: { stations: Station[] }) {
  if (!stations.length) {
    return (
      <div className="text-center py-4">
        <p className="text-xs text-slate-400 font-caveat">
          No memories captured yet. But the best ones are still to come. ♥
        </p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-hide -mx-2 px-2">
      <div className="flex gap-3 pb-2">
        {stations.map((s, i) => (
          <motion.div
            key={s.id}
            className="flex-shrink-0 w-28 bg-white rounded-2xl p-2 shadow-md border border-rose-50"
            initial={{ opacity: 0, y: 20, rotate: i % 2 === 0 ? -2 : 2 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 120,
              damping: 14,
            }}
          >
            <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center text-3xl mb-1 overflow-hidden">
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt={s.name}
                  className="w-full h-full object-cover"
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

export default function DepartureSurprise({
  message,
  stations,
}: {
  message: string;
  stations: Station[];
}) {
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
          Until Next Time 👋
        </motion.h3>
        <p className="text-xs text-slate-400 font-caveat">
          Not goodbye. Just see you soon.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-rose-400 font-caveat text-center">
          Our journey in moments
        </p>
        <MemoryMontage stations={stations} />
      </div>

      <LoveLetter message={message} />

      <motion.div
        className="text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-xs text-slate-400 font-caveat">
          Distance means so little when someone means so much. ♥
        </p>
      </motion.div>
    </motion.div>
  );
}
