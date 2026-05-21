"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- GA Physics Constants ---
const LIFESPAN = 250; 
const POP_SIZE = 150;
const MUTATION_RATE = 0.02;
const MAX_FORCE = 0.3;

const STORY_LINES = [
  "At first, finding you felt like wandering in the dark...",
  "There were obstacles in the way. Time. Distance.",
  "We stumbled. We crashed. We tried again.",
  "But slowly, we learned how to navigate the space between us.",
  "Because no matter the challenges or the miles...",
  "My heart will always find its way back to yours. ♥"
];

// --- Helper Math ---
const randomForce = () => ({
  x: (Math.random() - 0.5) * MAX_FORCE * 2,
  y: (Math.random() - 0.5) * MAX_FORCE * 2,
});

class Spark {
  pos: { x: number; y: number };
  vel: { x: number; y: number };
  acc: { x: number; y: number };
  dna: { x: number; y: number }[];
  fitness: number = 0;
  crashed: boolean = false;
  completed: boolean = false;

  constructor(startX: number, startY: number, dna?: { x: number; y: number }[]) {
    this.pos = { x: startX, y: startY };
    this.vel = { x: 0, y: 0 };
    this.acc = { x: 0, y: 0 };
    if (dna) {
      this.dna = dna;
    } else {
      this.dna = Array.from({ length: LIFESPAN }, randomForce);
    }
  }

  applyForce(force: { x: number; y: number }) {
    this.acc.x += force.x;
    this.acc.y += force.y;
  }

  update(age: number, target: { x: number; y: number, r: number }, obstacles: any[]) {
    const distToTarget = Math.hypot(target.x - this.pos.x, target.y - this.pos.y);
    if (distToTarget < target.r) {
      this.completed = true;
      this.pos.x = target.x;
      this.pos.y = target.y;
    }

    for (const obs of obstacles) {
      if (
        this.pos.x > obs.x && this.pos.x < obs.x + obs.w &&
        this.pos.y > obs.y && this.pos.y < obs.y + obs.h
      ) {
        this.crashed = true;
      }
    }

    if (this.pos.x < 0 || this.pos.x > 300 || this.pos.y < 0 || this.pos.y > 400) {
      this.crashed = true;
    }

    if (!this.crashed && !this.completed && age < LIFESPAN) {
      this.applyForce(this.dna[age]);
      this.vel.x += this.acc.x;
      this.vel.y += this.acc.y;
      
      const speed = Math.hypot(this.vel.x, this.vel.y);
      if (speed > 4) {
        this.vel.x = (this.vel.x / speed) * 4;
        this.vel.y = (this.vel.y / speed) * 4;
      }
      this.pos.x += this.vel.x;
      this.pos.y += this.vel.y;
      this.acc = { x: 0, y: 0 };
    }
  }

  calcFitness(target: { x: number; y: number }) {
    const dist = Math.hypot(target.x - this.pos.x, target.y - this.pos.y);
    this.fitness = 1 / (dist + 1); 
    
    if (this.completed) this.fitness *= 10; 
    if (this.crashed) this.fitness /= 10;   
  }
}

export default function EvolutionSurprise() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // React State
  const [generation, setGeneration] = useState(1);
  const [successRate, setSuccessRate] = useState(0);
  const [phase, setPhase] = useState<"simulating" | "story">("simulating");
  const [storyIndex, setStoryIndex] = useState(0);
  
  // Mutable Refs for Canvas Loop (to avoid dependency cycles)
  const popRef = useRef<Spark[]>([]);
  const ageRef = useRef(0);
  const frameRef = useRef<number>(0);
  const genRef = useRef(1);

  // Simulation Layout Constants
  const CW = 300;
  const CH = 400;
  const TARGET = { x: 150, y: 50, r: 20 };
  const START = { x: 150, y: 380 };
  const OBSTACLES = [
    { x: 50, y: 220, w: 140, h: 10 },
    { x: 110, y: 130, w: 140, h: 10 }
  ];

  // Initialize Generation 1
  useEffect(() => {
    popRef.current = Array.from({ length: POP_SIZE }, () => new Spark(START.x, START.y));
  }, []);

  // Story Sequence Timer
  useEffect(() => {
    if (phase === "story") {
      const interval = setInterval(() => {
        setStoryIndex((prev) => {
          if (prev < STORY_LINES.length - 1) return prev + 1;
          clearInterval(interval);
          return prev;
        });
      }, 4000); // Show each line for 4 seconds
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      // Clear screen with a slight fade for a smooth trailing effect
      ctx.fillStyle = "rgba(255, 249, 246, 0.4)";
      ctx.fillRect(0, 0, CW, CH);

      // Draw Target Heart
      ctx.fillStyle = "#F472B6"; 
      ctx.beginPath();
      ctx.arc(TARGET.x, TARGET.y, TARGET.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "16px sans-serif";
      ctx.fillText("♥", TARGET.x - 7, TARGET.y + 5);

      // Draw Obstacles
      ctx.fillStyle = "rgba(251, 207, 232, 0.8)"; 
      for (const obs of OBSTACLES) {
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 4);
        ctx.fill();
      }

      // Update and Draw Sparks
      let reached = 0;
      for (const spark of popRef.current) {
        spark.update(ageRef.current, TARGET, OBSTACLES);
        if (spark.completed) reached++;

        ctx.fillStyle = spark.completed ? "#F472B6" : spark.crashed ? "#CBD5E1" : "#FB7185";
        ctx.globalAlpha = spark.crashed ? 0.2 : 0.8;
        ctx.beginPath();
        ctx.arc(spark.pos.x, spark.pos.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // End of generation
      ageRef.current++;
      if (ageRef.current >= LIFESPAN) {
        const currentSuccess = Math.round((reached / POP_SIZE) * 100);
        setSuccessRate(currentSuccess);
        
        // TRIGGER STORY MODE: If success > 80% OR it's taking too long (Gen 12)
        if (currentSuccess >= 80 || genRef.current >= 12) {
          setPhase("story");
        }

        evaluateAndReproduce();
        genRef.current++;
        setGeneration(genRef.current);
        ageRef.current = 0;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    const evaluateAndReproduce = () => {
      const pop = popRef.current;
      pop.forEach(spark => spark.calcFitness(TARGET));
      
      let maxFit = 0;
      pop.forEach(s => { if (s.fitness > maxFit) maxFit = s.fitness; });
      pop.forEach(s => { s.fitness /= maxFit; }); 

      const pool: Spark[] = [];
      pop.forEach(spark => {
        const n = spark.fitness * 100;
        for (let i = 0; i < n; i++) pool.push(spark);
      });

      const newPop: Spark[] = [];
      for (let i = 0; i < POP_SIZE; i++) {
        // Fallback if pool is empty for some reason
        if (pool.length === 0) {
            newPop.push(new Spark(START.x, START.y));
            continue;
        }

        const parentA = pool[Math.floor(Math.random() * pool.length)].dna;
        const parentB = pool[Math.floor(Math.random() * pool.length)].dna;
        
        const mid = Math.floor(Math.random() * LIFESPAN);
        const childDna = [];
        for (let j = 0; j < LIFESPAN; j++) {
          let gene = j < mid ? parentA[j] : parentB[j];
          if (Math.random() < MUTATION_RATE) gene = randomForce();
          childDna.push(gene);
        }
        newPop.push(new Spark(START.x, START.y, childDna));
      }
      popRef.current = newPop;
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-caveat font-bold text-rose-500">Finding You</h3>
        <p className="text-[10px] text-slate-400 font-nunito uppercase tracking-widest font-semibold">
          Genetic Algorithm Simulation
        </p>
      </div>

      <div className="relative bg-white/60 p-2 rounded-[2rem] border border-white shadow-inner overflow-hidden">
        {/* The Physics Canvas */}
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={400} 
          className="rounded-[1.5rem] bg-[#FFF9F6]"
        />

        {/* The Story Mode Overlay */}
        <AnimatePresence>
          {phase === "story" && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(6px)" }}
              className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center p-6 text-center"
            >
              <AnimatePresence mode="wait">
                <motion.p
                  key={storyIndex}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 1.05 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className={`font-caveat text-rose-500 leading-relaxed drop-shadow-sm ${
                    storyIndex === STORY_LINES.length - 1 ? "text-3xl font-bold" : "text-2xl"
                  }`}
                >
                  {STORY_LINES[storyIndex]}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer - Fades out during story mode to focus on text */}
      <AnimatePresence>
        {phase === "simulating" && (
          <motion.div 
            className="flex w-full justify-between px-6"
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Generation</p>
              <p className="font-caveat text-2xl text-rose-400 font-bold">{generation}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Success Rate</p>
              <p className="font-caveat text-2xl text-rose-400 font-bold">{successRate}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}