"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  toast: (message: string, type?: ToastType) => void;
}

const Ctx = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(Ctx);
}

const ICONS: Record<ToastType, string> = {
  success: "✨",
  error: "❤️‍🩹",
  info: "💌",
};

const COLORS: Record<ToastType, string> = {
  success: "border-emerald-200/50 bg-emerald-50/80",
  error: "border-rose-200/50 bg-rose-50/80",
  info: "border-purple-200/50 bg-purple-50/80",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" style={{ top: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-2xl backdrop-blur-xl border shadow-lg shadow-rose-900/5 ${COLORS[t.type]}`}
            >
              <span className="text-sm">{ICONS[t.type]}</span>
              <p className="text-xs text-slate-600 font-medium">{t.message}</p>
              <button
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                className="ml-1 p-0.5 rounded-full hover:bg-white/50 text-slate-400"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
