"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import type { Snap, ProfileId } from "@/lib/types";
import { useProfile } from "@/components/ProfileGate";
import { fetchSnaps } from "@/lib/snaps-api";
import SnapViewer from "./SnapViewer";

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { profile } = useProfile();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [viewing, setViewing] = useState<Snap | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      if (document.hidden) return;
      try {
        const data = await fetchSnaps(profile?.identity);
        setSnaps(data);
      } catch {}
    };
    const onVisible = () => { if (!document.hidden && open) load(); };
    document.addEventListener("visibilitychange", onVisible);
    load();
    intervalRef.current = setInterval(load, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [open, profile?.identity]);

  const handleView = (snap: Snap) => setViewing(snap);

  const sorted = [...snaps].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const unread = sorted.filter((s) => s.status === "unread");
  const viewed = sorted.filter((s) => s.status === "viewed");

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[140] flex justify-end"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
            <div
              className="relative w-full max-w-sm bg-white/90 backdrop-blur-2xl shadow-2xl border-l border-rose-50 flex flex-col"
              style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
              <div className="flex items-center justify-between px-4 pt-4 sm:pt-3 pb-3 border-b border-rose-50 shrink-0">
                <h2 className="text-base font-caveat text-rose-400">Snaps</h2>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
                {unread.map((snap) => (
                  <SnapCard key={snap.id} snap={snap} onView={handleView} />
                ))}
                {viewed.length > 0 && unread.length > 0 && (
                  <div className="text-[0.55rem] text-slate-300 font-caveat text-center pt-3 border-t border-rose-50">
                    Viewed
                  </div>
                )}
                {viewed.map((snap) => (
                  <SnapCard key={snap.id} snap={snap} onView={handleView} />
                ))}
                {sorted.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 px-4">
                    <MessageCircle size={32} className="text-rose-200" />
                    <p className="text-sm text-slate-400 font-caveat">No snaps yet</p>
                    <p className="text-xs text-slate-300 font-caveat">Snaps you receive will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewing && <SnapViewer snap={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </>
  );
}

function SnapCard({ snap, onView }: { snap: Snap; onView: (s: Snap) => void }) {
  const isUnread = snap.status === "unread";
  return (
    <motion.button
      onClick={() => onView(snap)}
      className={`w-full flex items-center gap-3 p-3 sm:p-3.5 rounded-xl text-left transition-all ${
        isUnread
          ? "bg-rose-50/80 border border-rose-100"
          : "bg-white/60 border border-transparent"
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${
        isUnread ? "bg-rose-100" : "bg-slate-50"
      }`}>
        {snap.senderId === "meghs" ? "🌸" : "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs sm:text-sm truncate ${isUnread ? "font-semibold text-slate-700" : "text-slate-500"}`}>
          From {snap.senderId === "meghs" ? "Meghs" : "Prajyu"}
        </p>
        <p className="text-[0.55rem] sm:text-[0.6rem] text-slate-400 font-caveat">
          {new Date(snap.timestamp).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[0.5rem] sm:text-[0.55rem] text-slate-300">{snap.allowance}</span>
        {isUnread && <span className="w-2 h-2 rounded-full bg-rose-400" />}
      </div>
    </motion.button>
  );
}
