"use client";

import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, X } from "lucide-react";
import type { Station } from "@/lib/types";
import { useNow } from "@/lib/dev-time";
import {
  Spark,
  createInitialPopulation,
  evaluateAndReproduce,
  createObstaclesFromStations,
  drawSparks,
  drawObstacles,
  drawBestPath,
  drawWaypoints,
  type Obstacle,
} from "@/lib/genetic-path";

const POP_SIZE = 120;
const LIFESPAN = 180;
const MUTATION_RATE = 0.02;
const MAX_FORCE = 0.35;
const TARGET_RADIUS = 30;

export default function MapView({ stations }: { stations: Station[] }) {
  const now = useNow();
  const sorted = useMemo(() => [...stations].sort((a, b) => a.orderIndex - b.orderIndex), [stations]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gaPhase, setGaPhase] = useState<"idle" | "simulating" | "converged">("idle");
  const [generation, setGeneration] = useState(1);
  const [successRate, setSuccessRate] = useState(0);
  const gaDoneRef = useRef(false);

  const V_WIDTH = Math.max(1200, sorted.length * 250);
  const V_HEIGHT = 600;

  const nodes = useMemo(() => {
    return sorted.map((station, i) => {
      const x = 150 + i * ((V_WIDTH - 300) / Math.max(1, sorted.length - 1));
      const y = V_HEIGHT / 2 + Math.sin(i * 1.5) * 150;
      const isPast = new Date(station.dateTime).getTime() <= now.getTime();
      return { ...station, x, y, isPast };
    });
  }, [sorted, now, V_WIDTH]);

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

  const activeNode = nodes.find((n) => n.id === activeId);

  const waypoints = useMemo(
    () => nodes.map((n) => ({ x: n.x, y: n.y })),
    [nodes]
  );

  const obstacles = useMemo(() => {
    if (nodes.length < 2) return [];
    return createObstaclesFromStations(nodes);
  }, [nodes]);

  const hasRunRef = useRef(false);

  const runGA = useCallback(() => {
    if (nodes.length < 2 || gaDoneRef.current) return;
    gaDoneRef.current = true;
    hasRunRef.current = true;
    setGaPhase("simulating");

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let pop = createInitialPopulation(
      waypoints[0].x,
      waypoints[0].y,
      POP_SIZE,
      LIFESPAN,
      MAX_FORCE
    );
    let age = 0;
    let gen = 1;
    let frameId = 0;

    const loop = () => {
      let reached = 0;
      for (const spark of pop) {
        spark.update(age, waypoints, TARGET_RADIUS, obstacles, {
          w: V_WIDTH,
          h: V_HEIGHT,
        });
        if (spark.completed) reached++;
      }

      ctx.clearRect(0, 0, V_WIDTH, V_HEIGHT);
      drawObstacles(ctx, obstacles);
      drawWaypoints(ctx, waypoints);
      drawSparks(ctx, pop, waypoints);

      const bestPaths = pop
        .filter((s) => s.completed)
        .map((s) => ({ x: s.pos.x, y: s.pos.y }));
      if (bestPaths.length > 0) drawBestPath(ctx, bestPaths);

      age++;
      if (age >= LIFESPAN) {
        const rate = Math.round((reached / POP_SIZE) * 100);
        setSuccessRate(rate);
        setGeneration(gen);

        if (rate >= 75 || gen >= 10) {
          setGaPhase("converged");
          return;
        }

        pop = evaluateAndReproduce(pop, waypoints, LIFESPAN, MUTATION_RATE, MAX_FORCE);
        gen++;
        age = 0;
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
  }, [waypoints, obstacles, V_WIDTH, V_HEIGHT, nodes.length]);

  const isConvergedRef = useRef(false);
  useEffect(() => {
    isConvergedRef.current = gaPhase === "converged";
  }, [gaPhase]);

  useEffect(() => {
    if (nodes.length < 2) return;
    const timeout = setTimeout(() => runGA(), 600);
    return () => clearTimeout(timeout);
  }, [nodes.length, runGA]);

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
          Our evolving journey
        </p>
      </div>

      <div
        ref={mapContainerRef}
        className="relative w-full h-[500px] md:h-[600px] bg-rose-50/30 backdrop-blur-md rounded-[3rem] border-2 border-white shadow-[0_10px_40px_rgb(0,0,0,0.05)] overflow-hidden cursor-grab active:cursor-grabbing"
      >
        <div className="absolute inset-0 bg-grid-lines opacity-20 pointer-events-none" />

        <motion.div
          drag
          dragConstraints={mapContainerRef}
          className="absolute top-0 left-0"
          style={{ width: V_WIDTH, height: V_HEIGHT }}
          initial={{ x: 0, y: 0 }}
        >
          <AnimatePresence>
            {gaPhase === "converged" && (
              <motion.svg
                width={V_WIDTH}
                height={V_HEIGHT}
                className="absolute inset-0 pointer-events-none drop-shadow-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              >
                <path
                  d={pathD}
                  fill="none"
                  stroke="#FBCFE8"
                  strokeWidth="4"
                  strokeDasharray="10 10"
                  strokeLinecap="round"
                />
                <motion.path
                  d={pathD}
                  fill="none"
                  stroke="url(#mapGlow)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <defs>
                  <linearGradient id="mapGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#F9A8D4" />
                    <stop offset="50%" stopColor="#F472B6" />
                    <stop offset="100%" stopColor="#FB7185" />
                  </linearGradient>
                </defs>
              </motion.svg>
            )}
          </AnimatePresence>

          <canvas
            ref={canvasRef}
            width={V_WIDTH}
            height={V_HEIGHT}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
              gaPhase === "converged" ? "opacity-0" : "opacity-100"
            }`}
          />

          {nodes.map((node) => (
            <motion.button
              key={node.id}
              className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 group z-10 p-4"
              style={{ left: node.x, top: node.y }}
              onClick={() => setActiveId(node.id)}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex flex-col items-center transition-transform duration-300 group-hover:scale-110">
                {!node.isPast && activeId !== node.id && (
                  <div className="absolute inset-0 bg-rose-300 rounded-full blur-md opacity-40 animate-pulse pointer-events-none" />
                )}
                <div
                  className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center text-2xl border-4 shadow-md transition-colors ${
                    activeId === node.id
                      ? "bg-rose-400 border-rose-200 text-white"
                      : node.isPast
                        ? "bg-white border-rose-100 opacity-60"
                        : "bg-gradient-to-br from-rose-100 to-pink-50 border-white"
                  }`}
                >
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

        <AnimatePresence>
          {gaPhase === "simulating" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-rose-100/50 flex items-center gap-4 text-xs font-caveat">
                <span className="text-rose-400 font-bold">
                  Gen {generation}
                </span>
                <div className="w-px h-4 bg-rose-100" />
                <span className="text-slate-400">
                  {successRate}% success
                </span>
                <div className="w-16 h-1.5 bg-rose-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-300 to-rose-400 rounded-full"
                    animate={{ width: `${successRate}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gaPhase === "converged" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-4 right-4 z-20 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-rose-50 text-[0.55rem] text-rose-400 font-caveat"
          >
            🚂 Route optimized
          </motion.div>
        )}

        <AnimatePresence>
          {activeNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white/90 backdrop-blur-xl border border-white p-6 rounded-[2rem] shadow-2xl z-50 cursor-auto"
              onPointerDown={(e) => e.stopPropagation()}
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
                  <h3 className="font-nunito font-bold text-lg text-slate-700">
                    {activeNode.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-rose-400 font-bold flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(activeNode.dateTime).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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
