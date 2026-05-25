"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Station } from "@/lib/types";
import MapCanvas from "./MapCanvas";

export default function MapView({ stations }: { stations: Station[] }) {
  const sorted = useMemo(() => [...stations].sort((a, b) => a.orderIndex - b.orderIndex), [stations]);

  if (!sorted.length) return null;

  return (
    <motion.section
      className="relative max-w-5xl mx-auto w-full px-4 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center mb-6 space-y-2">
        <h2 className="text-3xl font-caveat font-bold text-rose-500">The Map</h2>
        <p className="text-[11px] text-slate-400 font-nunito uppercase tracking-widest font-bold">
          Drag · Zoom · Evolve
        </p>
      </div>

      <div className="relative w-full h-[500px] md:h-[600px] bg-rose-50/30 backdrop-blur-md rounded-[3rem] border-2 border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] overflow-hidden">
        <div className="absolute inset-0 bg-grid-lines opacity-20 pointer-events-none" />
        <MapCanvas stations={sorted} />
      </div>
    </motion.section>
  );
}
