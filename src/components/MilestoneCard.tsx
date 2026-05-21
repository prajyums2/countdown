"use client";

import { useRef, type MouseEvent } from "react"; 
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Coins, ShoppingBag, type LucideIcon } from "lucide-react";
import type { Milestone } from "@/config/data";

const iconMap: Record<Milestone["icon"], LucideIcon> = {
  salary: Coins,
  shopping: ShoppingBag,
};

const iconBgMap: Record<Milestone["icon"], string> = {
  salary: "bg-amber-50/80 text-amber-500",
  shopping: "bg-teal-50/80 text-teal-500",
};

const iconGradientMap: Record<Milestone["icon"], string> = {
  salary: "from-amber-100/60 via-amber-50/40 to-orange-50/30",
  shopping: "from-teal-100/60 via-teal-50/40 to-cyan-50/30",
};

export default function MilestoneCard({
  milestone,
  index,
  imageUrl,
}: {
  milestone: Milestone;
  index: number;
  imageUrl?: string;
}) {
  const Icon = iconMap[milestone.icon];
  const iconBg = iconBgMap[milestone.icon];
  const iconGrad = iconGradientMap[milestone.icon];
  
  // Base static rotation for that messy scrapbook look
  const baseRotate = index % 2 === 0 ? -2 : 3;

  // --- 3D Hover Effect Logic ---
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Soft spring physics for the tilt to make it feel buttery
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Map mouse position to rotation angles (max tilt is 12 degrees)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);
  
  // Dynamic glare position based on mouse
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate relative position from center (-0.5 to 0.5)
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    // Reset to center smoothly when mouse leaves
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className="relative mx-auto w-full max-w-xs perspective-1000" // Added perspective for 3D
      initial={{ opacity: 0, y: 50, rotate: baseRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: baseRotate }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 14,
        delay: index * 0.15,
      }}
      style={{ zIndex: 10 }}
    >
      {/* The Washi Tape - Positioned absolutely outside the 3D card so it stays pinned */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
        <div className="relative drop-shadow-sm">
          {/* Main tape body */}
          <div className="w-16 h-5 bg-rose-200/60 backdrop-blur-sm -rotate-2 rounded-[1px]" />
          {/* Jagged edges simulation */}
          <div className="absolute -left-[1px] top-0 bottom-0 w-[2px] bg-rose-200/40 mix-blend-multiply" />
          <div className="absolute -right-[1px] top-0 bottom-0 w-[2px] bg-rose-200/40 mix-blend-multiply" />
        </div>
      </div>

      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative bg-[#FDFBF7] rounded-xl shadow-[0_20px_40px_-15px_rgba(255,192,203,0.3)] pb-12 transition-shadow duration-300 hover:shadow-[0_30px_60px_-15px_rgba(255,192,203,0.4)] cursor-pointer"
      >
        {/* Dynamic Glare Overlay */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none rounded-xl overflow-hidden mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
          }}
        />

        {/* Polaroid Inner Frame */}
        <div className="p-3 pb-0" style={{ transform: "translateZ(10px)" }}> 
          {imageUrl ? (
            <div className="relative rounded-lg overflow-hidden bg-slate-100">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10" />
              <img
                src={imageUrl}
                alt={milestone.title}
                className="w-full aspect-square object-cover"
              />
            </div>
          ) : (
            <div
              className={`w-full aspect-square bg-gradient-to-br ${iconGrad} rounded-lg flex items-center justify-center relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-grid-lines opacity-20 mix-blend-multiply" />
              <motion.div
                className={`p-6 rounded-[2rem] ${iconBg} shadow-inner backdrop-blur-sm`}
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 12, delay: 0.2 }}
                style={{ transform: "translateZ(20px)" }} // Pops the icon out even further
              >
                <Icon size={40} strokeWidth={1.5} />
              </motion.div>
            </div>
          )}
        </div>

        {/* Text Section (The thick bottom border of the polaroid) */}
        <div 
            className="px-4 pt-5 space-y-1.5 text-center"
            style={{ transform: "translateZ(5px)" }}
        >
          <h3 className="font-nunito font-bold text-slate-700 text-[15px]">
            {milestone.title}
          </h3>

          <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-3 px-2">
            {milestone.description}
          </p>
        </div>

        {/* The Handwritten Date */}
        <div 
            className="absolute bottom-4 left-0 right-0 text-center"
            style={{ transform: "translateZ(15px)" }}
        >
          <span className="text-sm text-rose-400 font-caveat tracking-wider">
            {new Date(milestone.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            })}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}