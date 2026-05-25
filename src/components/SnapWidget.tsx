"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye } from "lucide-react";
import type { Snap } from "@/lib/types";
import { useProfile } from "@/components/ProfileGate";
import { fetchSnaps, fetchSnapContent } from "@/lib/snaps-api";
import SnapViewer from "./SnapViewer";

interface SnapWidgetProps {
  onRequestSendSnap?: () => void;
}

export default function SnapWidget({ onRequestSendSnap }: SnapWidgetProps) {
  const { profile } = useProfile();
  const [latest, setLatest] = useState<Snap | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [viewing, setViewing] = useState<Snap | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!profile?.identity) return;
      try {
        const snaps = await fetchSnaps(profile.identity);
        const unread = snaps.filter((s) => s.status === "unread");
        if (unread.length > 0) {
          const newest = unread.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];
          setLatest(newest);
          const data = await fetchSnapContent(newest.fileId);
          setThumb(data.content);
        } else {
          setLatest(null);
          setThumb(null);
        }
      } catch {}
    };
    load();
    pollRef.current = setInterval(load, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [profile?.identity]);

  if (!latest) return null;

  return (
    <>
      <motion.div
        className="relative bg-white/70 backdrop-blur-md rounded-2xl border border-rose-100/50 shadow-sm overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 p-3">
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-rose-100/50">
            {thumb ? (
              <img src={thumb} alt="snap" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-rose-200 to-purple-200 flex items-center justify-center">
                <span className="text-lg">✨</span>
              </div>
            )}
            <motion.div
              className="absolute inset-0 border-2 border-rose-300/40 rounded-xl"
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-caveat text-rose-400 font-semibold">
              New snap from {latest.senderId === "meghs" ? "Meghs" : "Prajyu"}
            </p>
            <p className="text-[0.6rem] text-slate-400 mt-0.5">
              {new Date(latest.timestamp).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <button
            onClick={() => setViewing(latest)}
            className="px-3 py-1.5 rounded-full bg-rose-400 text-white text-xs font-caveat hover:bg-rose-500 transition-colors flex items-center gap-1 shrink-0"
          >
            <Eye size={12} /> View
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {viewing && (
          <SnapViewer
            snap={viewing}
            onClose={() => setViewing(null)}
            onRequestSendSnap={onRequestSendSnap}
          />
        )}
      </AnimatePresence>
    </>
  );
}
