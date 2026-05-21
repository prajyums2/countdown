"use client";

import { useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, X } from "lucide-react";
import type { Station } from "@/lib/types";
import { useNow } from "@/lib/dev-time";

export default function MapView({ stations }: { stations: Station[] }) {
  const now = useNow();
  const sorted = useMemo(() => [...stations].sort((a, b) => a.orderIndex - b.orderIndex), [stations]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // The map constraint bounds
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Virtual Map Dimensions
  const V_WIDTH = Math.max(1200, sorted.length * 250); 
  const V_HEIGHT = 600;

  // Generate beautiful wavy coordinates for each station across the virtual map
  const nodes = useMemo(() => {
    return sorted.map((station, i) => {
      const x = 150 + (i * ((V_WIDTH - 300) / Math.max(1, sorted.length - 1)));
      // A deep Sine wave for the Y axis
      const y = (V_HEIGHT / 2) + Math.sin(i * 1.5) * 150; 
      const isPast = new Date(station.dateTime).getTime() <= now.getTime();
      return { ...station, x, y, isPast };
    });
  }, [sorted, now, V_WIDTH]);

  // Generate the dashed SVG path that connects them
  const pathD = useMemo(() => {
    if (nodes.length === 0) return "";
    let d = `M ${nodes[0].x},${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      const cpX = (prev.x + curr.x) / 2;
      d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`;
    }
    return d;
  }, [nodes]);

  const activeNode = nodes.find(n => n.id === activeId);

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
          Drag to explore our journey
        </p>
      </div>

      {/* The Map Window (Crops the draggable area) */}
      <div 
        ref={mapContainerRef}
        className="relative w-full h-[500px] md:h-[600px] bg-rose-50/30 backdrop-blur-md rounded-[3rem] border-2 border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] overflow-hidden cursor-grab active:cursor-grabbing"
      >
        {/* Ambient Grid Background */}
        <div className="absolute inset-0 bg-grid-lines opacity-20 pointer-events-none" />

        <motion.div
          drag
          dragConstraints={mapContainerRef}
          // The draggable surface is much larger than the window
          className="absolute top-0 left-0"
          style={{ width: V_WIDTH, height: V_HEIGHT }}
          initial={{ x: 0, y: 0 }}
        >
          {/* SVG Connection Path */}
          <svg width={V_WIDTH} height={V_HEIGHT} className="absolute inset-0 pointer-events-none drop-shadow-sm">
            <path 
              d={pathD} 
              fill="none" 
              stroke="#FBCFE8" 
              strokeWidth="4" 
              strokeDasharray="10 10" 
              strokeLinecap="round" 
            />
          </svg>

     {/* Render the Map Pins */}
          {nodes.map((node) => (
            <motion.button
              key={node.id}
              // Added p-4 to create a large, stable invisible hit area
              className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group z-10 p-4"
              style={{ left: node.x, top: node.y }}
              onClick={() => setActiveId(node.id)}
              whileTap={{ scale: 0.95 }}
            >
              {/* Inner wrapper handles the smooth hover scale */}
              <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:scale-110">
                
                {/* Pulse effect MUST have pointer-events-none */}
                {!node.isPast && activeId !== node.id && (
                  <div className="absolute inset-0 bg-rose-300 rounded-full blur-md opacity-40 animate-pulse pointer-events-none" />
                )}
                
                <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 shadow-md transition-colors ${
                  activeId === node.id 
                    ? "bg-rose-400 border-rose-200 text-white" 
                    : node.isPast 
                      ? "bg-white border-rose-100 opacity-60" 
                      : "bg-gradient-to-br from-rose-100 to-pink-50 border-white"
                }`}>
                  {node.emoji}
                </div>
                
                <div className="mt-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm border border-white/50">
                  <p className="text-xs font-nunito font-bold text-slate-600 whitespace-nowrap">
                    {node.name}
                  </p>
                </div>

              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Floating Modal for Active Station */}
        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white/90 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-2xl z-50 cursor-auto"
              onPointerDown={(e) => e.stopPropagation()} // Prevents dragging the map when interacting with the modal
            >
              <button 
                onClick={() => setActiveId(null)}
                className="absolute top-4 right-4 p-2 bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-2xl border border-white shadow-inner">
                  {activeNode.emoji}
                </div>
                <div>
                  <h3 className="font-nunito font-bold text-lg text-slate-700">{activeNode.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(activeNode.dateTime).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              
              <p className="text-sm font-caveat text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                {activeNode.description || "Unwritten memories waiting to happen..."}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}