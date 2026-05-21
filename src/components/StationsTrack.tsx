"use client";

import { useEffect, useState, useId, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Station, StationProgress } from "@/lib/types";
import { getStationsProgress } from "@/utils/time";
import { useNow } from "@/lib/dev-time";

const TRACK_HEIGHT = 600;
const PADDING_Y = 60;
const TRACK_WIDTH = 160;

function TrainIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="20" fill="url(#trainAura)" opacity="0.6" />
      <rect x="12" y="16" width="20" height="10" rx="5" fill="#FDF2F8" stroke="#F9A8D4" strokeWidth="1.5" />
      <rect x="9" y="20" width="5" height="6" rx="2.5" fill="#F9A8D4" />
      <circle cx="17" cy="29" r="4" fill="#F472B6" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="27" cy="29" r="4" fill="#F472B6" stroke="#FFFFFF" strokeWidth="2" />
      <rect x="15" y="10" width="15" height="7" rx="3.5" fill="#FFFFFF" stroke="#FBCFE8" strokeWidth="1" />
      <rect x="14" y="12" width="4" height="3" rx="1.5" fill="#FBCFE8" />
      <rect x="20" y="12" width="4" height="3" rx="1.5" fill="#FBCFE8" />
      <rect x="26" y="12" width="4" height="3" rx="1.5" fill="#FBCFE8" />
      <defs>
        <radialGradient id="trainAura" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#F9A8D4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function Badge({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-rose-100/50 text-slate-600 text-sm font-nunito font-bold rounded-full px-6 py-2.5 whitespace-nowrap flex items-center gap-2">
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </div>
  );
}

export default function StationsTrack({
  stations,
  onStationClick,
}: {
  stations: Station[];
  onStationClick: (station: Station) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [progress, setProgress] = useState<StationProgress>({
    overallPercent: 0,
    currentLegIndex: 0,
    totalLegs: 0,
    legPercent: 0,
    prevStation: null,
    nextStation: null,
  });
  
  const id = useId();
  const now = useNow();
  const sorted = useMemo(() => [...stations].sort((a, b) => a.orderIndex - b.orderIndex), [stations]);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && sorted.length) setProgress(getStationsProgress(sorted, now));
  }, [mounted, sorted, now]);

  const usableHeight = TRACK_HEIGHT - PADDING_Y * 2;
  const segmentHeight = sorted.length > 1 ? usableHeight / (sorted.length - 1) : 0;

  const trackPoints = useMemo(
    () =>
      sorted.map((_, i) => {
        const y = PADDING_Y + i * segmentHeight;
        const xOffset = Math.sin((i / Math.max(sorted.length - 1, 1)) * Math.PI * 1.5) * 45;
        return { x: TRACK_WIDTH / 2 + xOffset, y };
      }),
    [sorted.length, segmentHeight]
  );

  const pathD = useMemo(
    () => {
      if (trackPoints.length === 0) return "";
      let d = `M ${trackPoints[0].x},${trackPoints[0].y}`;
      for (let i = 1; i < trackPoints.length; i++) {
        const prev = trackPoints[i - 1];
        const curr = trackPoints[i];
        const cpY = (prev.y + curr.y) / 2;
        d += ` C ${prev.x},${cpY} ${curr.x},${cpY} ${curr.x},${curr.y}`;
      }
      return d;
    },
    [trackPoints]
  );

  const drawPercentage = progress.overallPercent / 100;

  const getTrainPosition = () => {
    if (trackPoints.length < 2) return { x: TRACK_WIDTH / 2, y: PADDING_Y };
    const exactIndex = drawPercentage * (sorted.length - 1);
    const lowerIndex = Math.floor(exactIndex);
    const upperIndex = Math.ceil(exactIndex);
    const remainder = exactIndex - lowerIndex;
    const p1 = trackPoints[lowerIndex];
    const p2 = trackPoints[upperIndex] || p1;
    const currentY = p1.y + (p2.y - p1.y) * remainder;
    const currentX = p1.x + (p2.x - p1.x) * remainder;
    return { x: currentX, y: currentY };
  };

  const trainPos = mounted && sorted.length > 1 ? getTrainPosition() : { x: TRACK_WIDTH / 2, y: PADDING_Y };

  return (
    <motion.section
      className="relative flex flex-col items-center py-16"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="relative" style={{ width: TRACK_WIDTH, height: TRACK_HEIGHT }}>
        
        {/* The HTML Overlay for Flawless Tooltips */}
        <div className="absolute inset-0 z-40 pointer-events-none">
          <AnimatePresence>
            {hoveredIndex !== null && trackPoints[hoveredIndex] && (
              <motion.div
                className="absolute flex flex-col items-center justify-center pointer-events-none"
                style={{ 
                  left: trackPoints[hoveredIndex].x, 
                  top: trackPoints[hoveredIndex].y - 45,
                  transform: 'translateX(-50%)' 
                }}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-rose-100/50 flex items-center gap-2 text-xs font-nunito font-bold text-slate-600 whitespace-nowrap">
                  <span>{sorted[hoveredIndex]?.emoji}</span>
                  {sorted[hoveredIndex]?.name}
                </div>
                {/* Tooltip Triangle */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white/90 drop-shadow-sm mt-[-1px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <svg
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          viewBox={`0 0 ${TRACK_WIDTH} ${TRACK_HEIGHT}`}
          fill="none"
          className="absolute inset-0 overflow-visible z-10"
        >
          <defs>
            <linearGradient id={`glowGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDA4AF" />
              <stop offset="50%" stopColor="#F472B6" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
            <filter id={`bloom-${id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path d={pathD} stroke="#FCE7F3" strokeWidth="4" strokeDasharray="8 12" strokeLinecap="round" />

          {mounted && (
            <motion.path 
              d={pathD} 
              stroke={`url(#glowGrad-${id})`} 
              strokeWidth="6" 
              strokeLinecap="round"
              filter={`url(#bloom-${id})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: drawPercentage }}
              transition={{ type: "spring", stiffness: 40, damping: 20 }}
            />
          )}

          {/* Interactive Nodes */}
          {trackPoints.map((pt, i) => {
            const visited = i <= progress.currentLegIndex && progress.overallPercent < 100;
            const isCompleted = i < progress.currentLegIndex || progress.overallPercent === 100;
            const isHovered = hoveredIndex === i;
            
            return (
              <g 
                key={sorted[i]?.id || i} 
                onClick={() => onStationClick(sorted[i])} 
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ cursor: "pointer" }}
              >
                {/* Node Glow */}
                {(visited || isCompleted || isHovered) && (
                  <motion.circle 
                    cx={pt.x} cy={pt.y} r="18" fill="#FBCFE8" opacity="0.4" filter="blur(4px)" 
                    animate={{ r: isHovered ? 24 : 18 }}
                  />
                )}
                
                <motion.circle
                  cx={pt.x}
                  cy={pt.y}
                  r={visited || isCompleted ? 14 : 10}
                  fill={visited || isCompleted ? "#FFF1F2" : "#FFFFFF"}
                  stroke={visited || isCompleted ? "#F472B6" : "#FBCFE8"}
                  strokeWidth={visited || isCompleted ? 3 : 2}
                  animate={{ 
                    scale: isHovered ? 1.2 : 1,
                    stroke: isHovered ? "#F472B6" : (visited || isCompleted ? "#F472B6" : "#FBCFE8")
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
                
                <text
                  x={pt.x}
                  y={pt.y + 1}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={visited || isCompleted ? "14" : "10"}
                  className="pointer-events-none"
                  style={{ filter: visited || isCompleted ? "drop-shadow(0px 2px 4px rgba(244,114,182,0.3))" : "none" }}
                >
                  {sorted[i]?.emoji || "📍"}
                </text>
              </g>
            );
          })}
        </svg>

        {mounted && (
          <motion.div
            className="absolute z-20 pointer-events-none"
            style={{ left: trainPos.x - 22, top: 0 }}
            animate={{ top: trainPos.y - 22 }}
            transition={{ type: "spring", stiffness: 60, damping: 25 }}
          >
            <motion.div
              animate={{ y: [0, -4, 0], rotate: [-1, 1, -1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <TrainIcon />
            </motion.div>
          </motion.div>
        )}

        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <Badge icon="📍">{stations[0]?.name || "Start"}</Badge>
        </div>

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <Badge icon="🏁">{stations[stations.length - 1]?.name || "Destination"}</Badge>
        </div>
      </div>
    </motion.section>
  );
}