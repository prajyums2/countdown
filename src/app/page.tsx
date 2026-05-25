"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, Heart, Camera } from "lucide-react";
import EvolutionSurprise from "@/components/surprises/EvolutionSurprise";
import { X } from "lucide-react"; // We'll need this for the close button

import { siteConfig } from "@/config/data";
import type { Station, Milestone, JourneyConfig, SheetData } from "@/lib/types";
import type { Milestone as StaticMilestone } from "@/config/data";
import { fetchData } from "@/lib/api";
import { getJourneyProgress } from "@/utils/time";

import HeroCountdown from "@/components/HeroCountdown";
import MapView from "@/components/MapView";
import StationsTrack from "@/components/StationsTrack";
import StationModal from "@/components/StationModal";
import MilestoneCard from "@/components/MilestoneCard";
import AdminPinGate from "@/components/AdminPinGate";
import AdminPanel from "@/components/AdminPanel";
import DevTimeSlider from "@/components/DevTimeSlider";
import LiveSnap from "@/components/LiveSnap";
import ChatDrawer from "@/components/ChatDrawer";
import SnapWidget from "@/components/SnapWidget";

function mapStaticMilestone(m: StaticMilestone, index: number): Milestone {
  return {
    id: m.id || `m-static-${index}`,
    date: m.date,
    title: m.title,
    description: m.description,
    icon: m.icon,
    imageUrl: "",
  };
}

const fallbackConfig: JourneyConfig = {
  startLocation: siteConfig.journey.startLocation,
  endLocation: siteConfig.journey.endLocation,
  trainBoardingDate: siteConfig.journey.trainBoardingDate,
  arrivalDate: siteConfig.journey.arrivalDate,
  showSnapAllowance: false,
};

function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-2 ${className || ""}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
      <motion.span
        className="text-rose-300 text-sm"
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        ♥
      </motion.span>
      <span className="h-px w-12 bg-gradient-to-r from-transparent via-rose-200 to-transparent" />
    </div>
  );
}

function FloatingBgHeart({ 
  delay, left, size, duration, onClick 
}: { 
  delay: number; left: number; size: number; duration: number; onClick?: () => void;
}) {
  return (
    <motion.button // Changed from span to button
      onClick={onClick}
      className="fixed text-rose-200/50 hover:text-rose-300 z-0 cursor-pointer transition-colors"
      style={{ left: `${left}%`, bottom: -20, fontSize: size }}
      initial={{ y: 0, opacity: 0 }}
      animate={{
        y: [0, -1200],
        opacity: [0, 0.6, 0.3, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "linear" }}
    >
      ♥
    </motion.button>
  );
}

export default function Home() {
  const [data, setData] = useState<SheetData | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const result = await fetchData();
      if (result.config && result.stations) setData(result);
      else setData(null);
    } catch {
      setData(null);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const config = data?.config || fallbackConfig;
  const stations: Station[] = data?.stations || [];
  const milestones: Milestone[] = data?.milestones || siteConfig.milestones.map(mapStaticMilestone);

  const boarding = new Date(config.trainBoardingDate);
  const arrival = new Date(config.arrivalDate);

  const handleStationClick = (station: Station) => setSelectedStation(station);
  const handleAdminUnlock = () => {
    setShowAdminPin(false);
    setShowAdmin(true);
  };

  return (
    <main className="min-h-screen bg-[#FFF9F6] bg-paper-texture px-4 py-8 md:py-16 relative">
      <div className="fixed inset-0 bg-grid-lines opacity-[0.05] pointer-events-none" />
     <FloatingBgHeart delay={0} left={5} size={24} duration={28} onClick={() => setShowSecret(true)} />
      <FloatingBgHeart delay={5} left={15} size={16} duration={32} />
      <FloatingBgHeart delay={10} left={85} size={20} duration={26} onClick={() => setShowSecret(true)} />
      <FloatingBgHeart delay={15} left={92} size={14} duration={35} />
      <FloatingBgHeart delay={8} left={50} size={18} duration={30} />
      <FloatingBgHeart delay={3} left={35} size={22} duration={24} />
      <FloatingBgHeart delay={12} left={75} size={18} duration={36} />
      <FloatingBgHeart delay={18} left={15} size={14} duration={28} />
      <FloatingBgHeart delay={7} left={88} size={16} duration={32} />

      <div className="relative z-10 max-w-[1200px] mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1 bg-rose-50/80 text-rose-400 text-[0.6rem] uppercase tracking-[0.2em] font-semibold rounded-full border border-rose-100/50 delicate-border">
              A love story in transit
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-5xl font-caveat text-gradient-rose mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {config.startLocation}
            <motion.span
              className="inline-block mx-2 text-rose-300"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ♥
            </motion.span>
            {config.endLocation}
          </motion.h1>

          <motion.p
            className="text-sm text-slate-400 font-caveat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Every mile brings us closer
          </motion.p>
        </header>

<div className="mb-12">
          <HeroCountdown config={config} />
        </div>

        <div className="mb-6">
          <SnapWidget onRequestSendSnap={() => setShowCamera(true)} />
        </div>

        {stations.length > 0 && (
          <>
            <SectionDivider className="mb-8" />
            <div className="mb-12">
              <MapView stations={stations} />
            </div>
          </>
        )}

        <SectionDivider className="mb-8" />

        <div className="mb-12">
          <StationsTrack key={refreshKey} stations={stations} onStationClick={handleStationClick} />
        </div>

        <SectionDivider className="mb-8" />

        <section className="mb-12">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-rose-200" />
              <h2 className="text-2xl font-caveat text-gradient-rose">Our Milestones</h2>
              <span className="h-px w-8 bg-gradient-to-l from-transparent to-rose-200" />
            </div>
            <p className="text-sm text-slate-400 font-caveat">
              Celebrating every step of the way
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
            {milestones.map((milestone, i) => (
              <div key={milestone.id} className="pin-style">
                <MilestoneCard
                  milestone={milestone as unknown as StaticMilestone}
                  index={i}
                  imageUrl={(milestone as Milestone).imageUrl}
                />
              </div>
            ))}
          </div>
        </section>

        <SectionDivider className="mb-8" />

        <footer className="text-center pb-8 relative z-50">
          <div className="flex items-center justify-center gap-1 text-xs text-slate-400 font-caveat mb-4">
            <span>Made with</span>
            {/* --- NEW SECRET TRIGGER --- */}
            <button 
              onClick={() => setShowSecret(true)}
              className="text-rose-300 hover:text-rose-500 hover:scale-150 transition-all cursor-pointer drop-shadow-sm px-1"
              title="A little secret..."
            >
              <Heart size={14} className="fill-current" />
            </button>
            <span>from across the distance</span>
          </div>
          <p className="text-[0.55rem] text-slate-300 font-caveat">
            {config.startLocation} · {config.endLocation}
          </p>
        </footer>
      </div> {/* End of main wrapper */}

      <StationModal station={selectedStation} allStations={stations} onClose={() => setSelectedStation(null)} />

      <AnimatePresence>
        {showAdminPin && <AdminPinGate onUnlock={handleAdminUnlock} />}
      </AnimatePresence>

      <AnimatePresence>
        {showAdmin && (
          <AdminPanel
            stations={stations}
            milestones={milestones}
            config={config}
            onRefresh={() => { setRefreshKey((k) => k + 1); setShowAdmin(false); }}
            onClose={() => setShowAdmin(false)}
          />
        )}
      </AnimatePresence>

      <div className="mb-8">
        <DevTimeSlider stations={stations} boardingDate={boarding} arrivalDate={arrival} />
      </div>

      {/* --- EASTER EGG MODAL --- */}
      <AnimatePresence>
        {showSecret && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-white/20 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSecret(false)}
            />
            <motion.div
              className="relative bg-white/80 backdrop-blur-xl border border-white rounded-[2rem] shadow-2xl shadow-rose-900/10 w-full max-w-md overflow-hidden p-2"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            >
              <button
                onClick={() => setShowSecret(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
              
              <div className="pt-8 pb-4">
                <EvolutionSurprise />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ChatDrawer />

      <AnimatePresence>
        {showCamera && (
          <LiveSnap
            onClose={() => setShowCamera(false)}
            onSent={() => setShowCamera(false)}
            showAllowance={config.showSnapAllowance}
          />
        )}
      </AnimatePresence>

      <button
        onClick={() => setShowCamera(true)}
        className="fixed bottom-4 sm:bottom-6 left-4 sm:left-20 z-[90] p-3 rounded-full bg-white/80 backdrop-blur-md border border-rose-100/50 shadow-md shadow-rose-200/50 text-rose-400 hover:text-rose-500 hover:bg-white/90 transition-all"
        title="Send a snap"
      >
        <Camera size={20} />
      </button>

      <button
        onClick={() => setShowAdminPin(true)}
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[90] p-3 rounded-full bg-white/80 backdrop-blur-md border border-rose-100/50 shadow-md shadow-rose-200/50 text-rose-400 hover:text-rose-500 hover:bg-white/90 transition-all"
        title="Admin"
      >
        <Settings size={20} />
      </button>
    </main>
  );
}