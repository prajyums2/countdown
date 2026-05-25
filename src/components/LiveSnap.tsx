"use client";

import { useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { SwitchCamera, Flashlight, EyeOff, X, Send } from "lucide-react";
import type { SnapAllowance } from "@/lib/types";
import { useProfile } from "@/components/ProfileGate";
import { sendSnap } from "@/lib/snaps-api";

interface LiveSnapProps {
  onClose: () => void;
  onSent: () => void;
}

const ALLOWANCE_OPTIONS: { value: SnapAllowance; label: string; icon: string }[] = [
  { value: "once", label: "View Once", icon: "👁️" },
  { value: "twice", label: "View Twice", icon: "👀" },
  { value: "keep", label: "Keep", icon: "📌" },
];

export default function LiveSnap({ onClose, onSent }: LiveSnapProps) {
  const webcamRef = useRef<Webcam>(null);
  const { profile } = useProfile();
  const [captured, setCaptured] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [flash, setFlash] = useState(false);
  const [allowance, setAllowance] = useState<SnapAllowance>("once");
  const [sending, setSending] = useState(false);

  const capture = useCallback(() => {
    const img = webcamRef.current?.getScreenshot();
    if (img) setCaptured(img);
  }, []);

  const retake = () => {
    setCaptured(null);
  };

  const handleSend = async () => {
    if (!captured || !profile) return;
    setSending(true);
    try {
      await sendSnap(captured, allowance, profile.identity);
      onSent();
      onClose();
    } catch {
      setSending(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black/90 flex flex-col"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-4 pt-2 pb-2 z-10 shrink-0">
        <button onClick={onClose} className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all min-w-[36px] min-h-[36px] flex items-center justify-center">
          <X size={20} />
        </button>
        <span className="text-sm text-white/50 font-caveat">Send a snap</span>
        <div className="w-9" />
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden px-2">
        {!captured ? (
          <div className="relative w-full h-full max-w-md rounded-2xl overflow-hidden">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.92}
              videoConstraints={{ width: 1920, height: 1080, facingMode: facing, frameRate: 30 }}
              className="absolute inset-0 w-full h-full object-cover"
              mirrored={facing === "user"}
              playsInline
            />
            {flash && <div className="absolute inset-0 bg-white/20 pointer-events-none" />}
            <div className="absolute inset-0 border-2 border-white/10 rounded-2xl pointer-events-none" />
          </div>
        ) : (
          <div className="relative w-full h-full max-w-md rounded-2xl overflow-hidden">
            <img src={captured} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
          </div>
        )}
      </div>

      {!captured && (
        <div className="flex items-center justify-center gap-4 sm:gap-6 py-4 shrink-0">
          <button
            onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
            className="p-3 sm:p-3.5 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <SwitchCamera size={22} />
          </button>
          <button
            onClick={capture}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-white/80 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white" />
          </button>
          <button
            onClick={() => setFlash((f) => !f)}
            className="p-3 sm:p-3.5 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {flash ? <Flashlight size={22} /> : <EyeOff size={22} />}
          </button>
        </div>
      )}

      {captured && (
        <div className="space-y-4 pb-6 sm:pb-8 px-4 shrink-0">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {ALLOWANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAllowance(opt.value)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs font-caveat transition-all ${
                  allowance === opt.value
                    ? "bg-rose-400 text-white shadow-lg"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={retake}
              className="px-5 py-2.5 rounded-full bg-white/10 text-white/70 text-sm font-caveat hover:bg-white/20 transition-all min-w-[80px]"
            >
              Retake
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="px-8 py-2.5 rounded-full bg-rose-400 text-white text-sm font-caveat hover:bg-rose-500 disabled:opacity-50 transition-all flex items-center gap-2 min-w-[100px] justify-center"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send size={14} /> Send</>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
