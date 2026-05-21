"use client";

import { motion } from "framer-motion";

function BlanketFort() {
  return (
    <motion.svg
      width="160"
      height="100"
      viewBox="0 0 160 100"
      className="drop-shadow-md"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 14 }}
    >
      <motion.path
        d="M10,90 L30,20 L50,50 L70,15 L90,45 L110,20 L130,55 L150,25 L155,90 Z"
        fill="#FBCFE8"
        stroke="#F9A8D4"
        strokeWidth="3"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />
      <motion.rect
        x="60"
        y="55"
        width="40"
        height="35"
        rx="5"
        fill="#FDF2F8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      />
      <motion.text
        x="80"
        y="78"
        textAnchor="middle"
        fill="#F472B6"
        fontSize="10"
        fontWeight="bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        cozy ♥
      </motion.text>
      <motion.circle
        cx="55"
        cy="52"
        r="5"
        fill="#FEF3C7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, r: [5, 7, 5] }}
        transition={{ delay: 1.5, repeat: Infinity, duration: 2 }}
      />
      <motion.circle
        cx="105"
        cy="48"
        r="5"
        fill="#FEF3C7"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, r: [5, 7, 5] }}
        transition={{ delay: 1.8, repeat: Infinity, duration: 2 }}
      />
    </motion.svg>
  );
}

const defaultMovies = [
  "🎬 500 Days of Summer",
  "🎬 About Time",
  "🎬 The Before Trilogy",
  "🎬 La La Land",
  "🎬 Eternal Sunshine",
];

export default function CozySurprise({
  message,
  customMovies,
}: {
  message: string;
  customMovies?: string[];
}) {
  const movies = customMovies?.length ? customMovies : defaultMovies;

  return (
    <motion.div
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center text-center space-y-1">
        <BlanketFort />
        <h3 className="text-xl font-caveat text-rose-500 mt-2">
          Cozy Staycation 🏡
        </h3>
        <p className="text-xs text-slate-400 font-caveat">
          No plans. Just us. Perfect.
        </p>
      </div>

      {message && (
        <motion.div
          className="bg-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-100 shadow-sm -rotate-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 120, damping: 14 }}
        >
          <p className="text-sm text-slate-600 whitespace-pre-line font-caveat leading-relaxed">
            {message}
          </p>
        </motion.div>
      )}

      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-rose-50 shadow-sm rotate-1"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 120, damping: 14 }}
      >
        <p className="text-xs text-rose-400 font-caveat mb-2 uppercase tracking-wider">
          Movie Marathon 🎥
        </p>
        <ul className="space-y-1">
          {movies.map((movie, i) => (
            <motion.li
              key={i}
              className="text-sm text-slate-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              {movie}
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  );
}
