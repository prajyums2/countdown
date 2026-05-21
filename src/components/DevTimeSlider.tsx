"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Play, Pause, SkipBack, SkipForward, X } from "lucide-react";
import { useDevTime } from "@/lib/dev-time";
import type { Station } from "@/lib/types";

const SPEED_OPTIONS = [
  { label: "1s = 1h", value: 3600000 },
  { label: "1s = 6h", value: 21600000 },
  { label: "1s = 1d", value: 86400000 },
  { label: "1s = 7d", value: 604800000 },
];

export default function DevTimeSlider({
  stations,
  boardingDate,
  arrivalDate,
}: {
  stations: Station[];
  boardingDate: Date;
  arrivalDate: Date;
}) {
  const { devNow, setDevNow, enabled, setEnabled, minDate, maxDate, setMinDate, setMaxDate } = useDevTime();
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [sliderVal, setSliderVal] = useState(50);

  const rangeMin = minDate.getTime();
  const rangeMax = maxDate.getTime();
  const rangeSpan = rangeMax - rangeMin;

  useEffect(() => {
    const threeMonths = 90 * 86400000;
    const start = new Date(boardingDate.getTime() - threeMonths);
    const end = new Date(arrivalDate.getTime() + threeMonths);
    setMinDate(start);
    setMaxDate(end);
  }, [boardingDate, arrivalDate]);

  const sorted = [...stations].sort((a, b) => a.orderIndex - b.orderIndex);

  const updateFromSlider = useCallback(
    (val: number) => {
      setSliderVal(val);
      const t = rangeMin + (val / 100) * rangeSpan;
      setDevNow(new Date(t));
    },
    [rangeMin, rangeSpan, setDevNow]
  );

  const jumpToStation = useCallback(
    (station: Station) => {
      const t = new Date(station.dateTime).getTime();
      const val = Math.max(0, Math.min(100, ((t - rangeMin) / rangeSpan) * 100));
      updateFromSlider(val);
    },
    [rangeMin, rangeSpan, updateFromSlider]
  );

  const jumpToNow = useCallback(() => {
    const t = Date.now();
    const val = Math.max(0, Math.min(100, ((t - rangeMin) / rangeSpan) * 100));
    updateFromSlider(val);
    setDevNow(null);
    setEnabled(false);
  }, [rangeMin, rangeSpan, updateFromSlider, setDevNow, setEnabled]);

  useEffect(() => {
    if (!enabled || !devNow) {
      const t = Date.now();
      const val = Math.max(0, Math.min(100, ((t - rangeMin) / rangeSpan) * 100));
      setSliderVal(val);
    } else {
      const t = devNow.getTime();
      const val = Math.max(0, Math.min(100, ((t - rangeMin) / rangeSpan) * 100));
      setSliderVal(val);
    }
  }, [enabled, devNow, rangeMin, rangeSpan]);

  useEffect(() => {
    if (playing && enabled) {
      intervalRef.current = setInterval(() => {
        const speed = SPEED_OPTIONS[speedIdx].value;
        setDevNow((prev) => {
          const next = new Date((prev || new Date()).getTime() + speed);
          if (next > maxDate) {
            setPlaying(false);
            return maxDate;
          }
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, enabled, speedIdx, maxDate, setDevNow]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-30 p-3 rounded-full bg-white/70 backdrop-blur-md border border-rose-100 shadow-lg shadow-rose-900/5 text-rose-400 hover:text-rose-500 hover:bg-white transition-all"
        title="Dev time slider"
      >
        <Clock size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 left-4 right-4 md:left-6 md:right-auto md:w-96 z-30 bg-white/90 backdrop-blur-xl border border-rose-100 rounded-2xl shadow-xl shadow-rose-900/10 p-5 space-y-4"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-rose-400" />
                <span className="text-sm font-nunito font-semibold text-slate-700">
                  Time Simulator
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Override time</span>
              <button
                onClick={() => {
                  if (enabled) {
                    setEnabled(false);
                    setDevNow(null);
                    setPlaying(false);
                  } else {
                    setEnabled(true);
                    setDevNow(new Date(rangeMin + (sliderVal / 100) * rangeSpan));
                  }
                }}
                className={`relative w-10 h-5 rounded-full transition-colors ${
                  enabled ? "bg-rose-400" : "bg-slate-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {enabled && devNow && (
              <>
                <div className="text-center">
                  <p className="text-lg font-caveat text-rose-500">
                    {devNow.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-400 font-caveat">
                    {devNow.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderVal}
                    onChange={(e) => updateFromSlider(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-rose-400 bg-rose-100"
                  />
                  <div className="flex justify-between text-[0.5rem] text-slate-300">
                    <span>{minDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    <span>{maxDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>

                {sorted.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {sorted.map((s) => {
                      const t = new Date(s.dateTime).getTime();
                      const isPast = t <= (devNow?.getTime() || 0);
                      return (
                        <button
                          key={s.id}
                          onClick={() => jumpToStation(s)}
                          className={`text-[0.55rem] px-2 py-1 rounded-full border transition-colors ${
                            isPast
                              ? "bg-rose-50 border-rose-200 text-rose-500"
                              : "bg-white border-rose-100 text-slate-400 hover:bg-rose-50"
                          }`}
                        >
                          {s.emoji} {s.name}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => jumpToStation(sorted[0])}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                    title="Jump to start"
                  >
                    <SkipBack size={14} />
                  </button>

                  <button
                    onClick={() => setPlaying(!playing)}
                    className={`p-2 rounded-full transition-colors ${
                      playing
                        ? "bg-rose-100 text-rose-500"
                        : "bg-rose-50 text-rose-400 hover:bg-rose-100"
                    }`}
                    title={playing ? "Pause" : "Play"}
                  >
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                  </button>

                  <button
                    onClick={() => jumpToStation(sorted[sorted.length - 1])}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"
                    title="Jump to end"
                  >
                    <SkipForward size={14} />
                  </button>

                  <select
                    value={speedIdx}
                    onChange={(e) => setSpeedIdx(Number(e.target.value))}
                    className="ml-2 text-[0.55rem] px-2 py-1 rounded-lg border border-rose-100 bg-white text-slate-500 outline-none"
                  >
                    {SPEED_OPTIONS.map((opt, i) => (
                      <option key={i} value={i}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={jumpToNow}
                  className="w-full py-1.5 text-[0.6rem] rounded-lg border border-rose-100 text-slate-400 hover:bg-rose-50 transition-colors font-caveat"
                >
                  ↩ Reset to current time
                </button>
              </>
            )}

            {(!enabled || !devNow) && (
              <p className="text-xs text-slate-400 font-caveat text-center py-2">
                Toggle on to simulate a different date/time
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
