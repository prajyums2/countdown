"use client";

import { motion } from "framer-motion";

export default function HugSurprise({ message }: { message: string }) {
  return (
    <motion.div
      className="flex flex-col items-center space-y-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="text-7xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -5, 5, 0] }}
        transition={{
          scale: { type: "spring", stiffness: 150, damping: 12 },
          rotate: { delay: 0.5, duration: 1.5, repeat: Infinity },
        }}
      >
        🫂
      </motion.div>

      <motion.p
        className="text-3xl font-caveat text-rose-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Finally.
      </motion.p>

      {message && (
        <motion.p
          className="text-sm text-slate-500 text-center font-caveat max-w-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  );
}
