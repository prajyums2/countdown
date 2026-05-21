"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock } from "lucide-react";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "2026";

export default function AdminPinGate({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [show, setShow] = useState(true);

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      setShow(false);
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-[2rem] shadow-2xl shadow-rose-900/10 p-8 w-full max-w-xs text-center space-y-5"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 18 }}
          >
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-rose-50">
                <Lock size={24} className="text-rose-400" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="font-nunito font-semibold text-slate-700">
                Admin Access
              </h3>
              <p className="text-xs text-slate-400 font-caveat">
                Enter PIN to manage stations & milestones
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter PIN"
                className={`w-full text-center text-lg tracking-[0.3em] px-4 py-3 rounded-xl border ${
                  error ? "border-red-300 bg-red-50" : "border-rose-100 bg-rose-50/50"
                } outline-none focus:border-rose-300 transition-colors font-nunito`}
                autoFocus
                maxLength={10}
              />

              {error && (
                <motion.p
                  className="text-xs text-red-400 font-caveat"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Incorrect PIN. Try again.
                </motion.p>
              )}

              <button
                onClick={handleSubmit}
                className="w-full py-2.5 rounded-xl bg-rose-400 text-white text-sm font-semibold hover:bg-rose-500 transition-colors shadow-sm"
              >
                Unlock
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
