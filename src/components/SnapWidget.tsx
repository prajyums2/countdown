"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Snap } from "@/lib/types";
import { useProfile } from "@/components/ProfileGate";
import { fetchSnaps, fetchSnapContent } from "@/lib/snaps-api";
import SnapViewer from "./SnapViewer";

export default function SnapWidget() {
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
          // Fetch thumbnail
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
      <motion.button
        onClick={() => setViewing(latest)}
        className="fixed top-20 right-4 z-[80] w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-white/80 shadow-lg shadow-rose-200/40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="New snap!"
      >
        {thumb ? (
          <img src={thumb} alt="snap" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-rose-200 to-purple-200 flex items-center justify-center">
            <span className="text-lg">✨</span>
          </div>
        )}
        <motion.div
          className="absolute inset-0 border-2 border-rose-300/50 rounded-2xl"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-400 border-2 border-white" />
      </motion.button>

      <AnimatePresence>
        {viewing && <SnapViewer snap={viewing} onClose={() => setViewing(null)} />}
      </AnimatePresence>
    </>
  );
}
