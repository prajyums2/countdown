"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import type { Snap, ProfileId } from "@/lib/types";
import { useProfile } from "@/components/ProfileGate";
import { fetchSnaps, fetchEncryptedContent } from "@/lib/snaps-api";
import { decryptSnapContent } from "@/lib/crypto";
import SnapViewer from "./SnapViewer";

const contentCache = new Map<string, string>();

interface ChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChatDrawer({ open, onOpenChange }: ChatDrawerProps) {
  const { profile } = useProfile();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [viewing, setViewing] = useState<Snap | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      if (document.hidden) return;
      try {
        const data = await fetchSnaps();
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
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [open, snaps]);

  const handleView = (snap: Snap) => setViewing(snap);

  const sorted = [...snaps].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const firstUnreadIndex = sorted.findIndex((s) => s.status === "unread");

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

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                {sorted.map((snap, i) => (
                  <div key={snap.id}>
                    {i === firstUnreadIndex && i > 0 && (
                      <div className="flex items-center gap-2 py-2">
                        <span className="h-px flex-1 bg-rose-200" />
                        <span className="text-[0.55rem] text-rose-400 font-caveat font-semibold whitespace-nowrap">
                          New messages
                        </span>
                        <span className="h-px flex-1 bg-rose-200" />
                      </div>
                    )}
                    <SnapBubble snap={snap} onView={handleView} />
                  </div>
                ))}
                {sorted.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 px-4">
                    <MessageCircle size={32} className="text-rose-200" />
                    <p className="text-sm text-slate-400 font-caveat">No snaps yet</p>
                    <p className="text-xs text-slate-300 font-caveat">Snaps you send and receive will appear here</p>
                  </div>
                )}
                <div ref={bottomRef} />
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

function SnapBubble({ snap, onView }: { snap: Snap; onView: (s: Snap) => void }) {
  const { profile } = useProfile();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  const isUnread = snap.status === "unread";
  const isSent = snap.senderId === profile?.identity;
  const senderName = snap.senderId === "meghs" ? "Meghs" : "Prajyu";
  const senderEmoji = snap.senderId === "meghs" ? "🌸" : "🎮";
  const recipientName = snap.senderId === "meghs" ? "Prajyu" : "Meghs";
  const recipientEmoji = snap.senderId === "meghs" ? "🎮" : "🌸";
  const commentCount = snap.comments?.length || 0;

  useEffect(() => {
    if (loadedRef.current) return;
    let cancelled = false;
    const cached = contentCache.get(snap.fileId);
    if (cached) {
      setThumbnail(cached);
      setLoading(false);
      loadedRef.current = true;
      return;
    }
    fetchEncryptedContent(snap.fileId).then((data) => {
      if (cancelled) return;
      const decrypted = decryptSnapContent(data.content);
      contentCache.set(snap.fileId, decrypted);
      setThumbnail(decrypted);
      setLoading(false);
      loadedRef.current = true;
    });
    return () => { cancelled = true; };
  }, [snap.fileId]);

  const time = new Date(snap.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isSent ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] ${isSent ? "items-end" : "items-start"} flex flex-col`}>
        <div className="flex items-center gap-1.5 mb-1">
          {!isSent && (
            <>
              <span className="text-xs">{senderEmoji}</span>
              <span className="text-[0.55rem] text-slate-400 font-caveat">{senderName}</span>
            </>
          )}
          {isSent && (
            <>
              <span className="text-[0.55rem] text-slate-400 font-caveat">You</span>
              <span className="text-xs">{recipientEmoji}</span>
            </>
          )}
        </div>
        <motion.button
          onClick={() => onView(snap)}
          className={`relative rounded-2xl overflow-hidden border text-left transition-all ${
            isSent
              ? "bg-rose-50/80 border-rose-100"
              : "bg-white/80 border-slate-100"
          } ${isUnread ? "shadow-sm" : ""}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading && (
            <div className="w-40 h-52 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-rose-100/50 animate-pulse" />
                <span className="text-[0.5rem] text-slate-300 font-caveat animate-pulse">Loading...</span>
              </div>
            </div>
          )}
          {thumbnail && (
            <img
              src={thumbnail}
              alt="Snap"
              className="w-40 h-52 object-cover"
              draggable={false}
            />
          )}
          <div className={`px-2.5 py-1.5 flex items-center gap-2 ${thumbnail ? "bg-white/80 backdrop-blur-sm" : ""}`}>
            <span className="text-[0.5rem] text-slate-400 font-caveat">{time}</span>
            <span className="text-[0.45rem] text-slate-300 uppercase">{snap.allowance}</span>
            {commentCount > 0 && (
              <span className="text-[0.45rem] text-rose-400 bg-rose-50 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 ml-auto">
                💬 {commentCount}
              </span>
            )}
            {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />}
          </div>
        </motion.button>
      </div>
    </div>
  );
}
