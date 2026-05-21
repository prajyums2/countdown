"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Station } from "@/lib/types";
import { formatDateTime } from "@/utils/time";

import BirthdaySurprise from "./surprises/BirthdaySurprise";
import DateNightSurprise from "./surprises/DateNightSurprise";
import CozySurprise from "./surprises/CozySurprise";
import DepartureSurprise from "./surprises/DepartureSurprise";
import HugSurprise from "./surprises/HugSurprise";
import SurpriseReveal from "./surprises/SurpriseReveal";

function NormalContent({ station }: { station: Station }) {
  return (
    <div className="space-y-4">
      {station.imageUrl && (
        <div className="w-full aspect-video rounded-xl overflow-hidden bg-rose-50">
          <img
            src={station.imageUrl}
            alt={station.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {station.description && (
        <p className="text-sm text-slate-600 leading-relaxed">
          {station.description}
        </p>
      )}
    </div>
  );
}

function SurpriseContent({
  station,
  allStations,
}: {
  station: Station;
  allStations: Station[];
}) {
  const sorted = [...allStations].sort((a, b) => a.orderIndex - b.orderIndex);
  const prevStations = sorted.filter(
    (s) => s.orderIndex < station.orderIndex
  );

  switch (station.eventType) {
    case "birthday":
      return (
        <BirthdaySurprise
          message={station.customMessage}
          spotifyUrl={station.spotifyUrl}
          stations={prevStations}
        />
      );
    case "date-night":
      return (
        <DateNightSurprise
          message={station.customMessage}
          spotifyUrl={station.spotifyUrl}
        />
      );
    case "cozy":
      return <CozySurprise message={station.customMessage} />;
    case "departure":
      return (
        <DepartureSurprise
          message={station.customMessage}
          stations={prevStations}
        />
      );
    case "hug":
      return <HugSurprise message={station.customMessage} />;
    case "surprise":
      return <SurpriseReveal message={station.customMessage} />;
    default:
      return <NormalContent station={station} />;
  }
}

export default function StationModal({
  station,
  allStations,
  onClose,
}: {
  station: Station | null;
  allStations: Station[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!station) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [station]);

  return (
    <AnimatePresence>
      {station && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative bg-white rounded-[2rem] shadow-2xl shadow-rose-900/10 w-full max-w-md max-h-[85vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-5 pb-3 bg-white/80 backdrop-blur-sm border-b border-rose-50 rounded-t-[2rem]">
              <div className="flex items-center gap-2">
                <span className="text-xl">{station.emoji}</span>
                <div>
                  <h3 className="font-nunito font-semibold text-slate-700 text-base">
                    {station.name}
                  </h3>
                  <p className="text-xs text-rose-400 font-caveat">
                    {formatDateTime(station.dateTime)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-rose-50 transition-colors text-slate-400 hover:text-rose-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 pt-4">
              <SurpriseContent station={station} allStations={allStations} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
