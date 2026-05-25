"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye } from "lucide-react";
import type { Snap, SnapAllowance } from "@/lib/types";
import { fetchSnapContent, markSnapViewed } from "@/lib/snaps-api";
import { useProfile } from "@/components/ProfileGate";

interface SnapViewerProps {
  snap: Snap;
  onClose: () => void;
}

export default function SnapViewer({ snap, onClose }: SnapViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    if (!viewedRef.current) {
      viewedRef.current = true;
      markSnapViewed(snap.id);
    }
    onCloseRef.current();
  }, [snap.id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSnapContent(snap.fileId).then((data) => {
      if (cancelled) return;
      setContent(data.content);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [snap.fileId]);

  useEffect(() => {
    if (content && (snap.allowance === "once" || snap.allowance === "twice")) {
      setTimer(10);
      timerRef.current = setInterval(() => {
        setTimer((t) => {
          if (t === null || t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleClose();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [content, snap.allowance, handleClose]);

  const maxViews = { once: 1, twice: 2, keep: Infinity }[snap.allowance as SnapAllowance] || 1;
  const viewsRemaining = Math.max(0, maxViews - snap.view_count - (content ? 1 : 0));

  return (
    <motion.div
      className="fixed inset-0 z-[160] bg-black/95 flex flex-col items-center justify-center"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        className="absolute top-4 right-4 z-10 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
        style={{ top: "calc(env(safe-area-inset-top, 0px) + 8px)" }}
      >
        <X size={20} />
      </button>

      {loading && (
        <div className="flex flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <motion.div
            className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Eye size={28} className="text-white/30" />
          </motion.div>
          <div className="space-y-2 text-center">
            <p className="text-white/60 text-sm font-caveat">Decrypting your snap...</p>
            <div className="flex gap-1 justify-center">
              {[0,1,2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-rose-300/50"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {content && (
        <motion.div
          className="relative w-full max-w-md mx-auto aspect-[9/16] max-h-[85vh] mx-2 sm:mx-4 rounded-2xl overflow-hidden shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img src={content} alt="Snap" className="w-full h-full object-cover" />
          
          {timer !== null && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1">
                <motion.span
                  key={timer}
                  className="text-white text-lg sm:text-xl font-bold tabular-nums"
                  initial={{ scale: 1.3, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {timer}
                </motion.span>
              </div>
            </div>
          )}

          <div className="absolute top-4 left-4 z-10">
            <div className="bg-black/30 backdrop-blur-sm rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
              <span className="text-xs">{snap.senderId === "meghs" ? "🌸" : "🎮"}</span>
              <span className="text-white/80 text-[0.6rem] font-medium">
                {snap.senderId === "meghs" ? "Meghs" : "Prajyu"}
              </span>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
            <div className="flex items-center justify-between text-white/70 text-xs font-caveat">
              <span>
                {snap.allowance === "keep"
                  ? "Kept in chat"
                  : `${viewsRemaining} view${viewsRemaining !== 1 ? "s" : ""} remaining`}
              </span>
              <span className="text-white/50">{new Date(snap.timestamp).toLocaleDateString()}</span>
            </div>
          </div>
        </motion.div>
      )}

      {!loading && !content && (
        <p className="text-white/50 text-sm font-caveat">Could not load snap</p>
      )}
    </motion.div>
  );
}
