"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Camera, MessageCircle, Home, Settings } from "lucide-react";

interface BottomNavProps {
  showCamera: boolean;
  showChat: boolean;
  showAdmin: boolean;
  unreadCount: number;
  onCamera: () => void;
  onChat: () => void;
  onHome: () => void;
  onAdmin: () => void;
}

export default function BottomNav({
  showCamera,
  showChat,
  showAdmin,
  unreadCount,
  onCamera,
  onChat,
  onHome,
  onAdmin,
}: BottomNavProps) {
  if (showCamera || showChat || showAdmin) return null;

  return (
    <motion.nav
      className="fixed inset-x-0 bottom-0 z-[80] flex items-center justify-around px-4 pb-2 pt-2 bg-white/70 backdrop-blur-2xl border-t border-rose-100/50"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 4px) + 4px)" }}
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 26 }}
    >
      <NavButton icon={<Home size={20} />} label="Home" onClick={onHome} />
      <NavButton icon={<Camera size={20} />} label="Snap" onClick={onCamera} highlight />
      <NavButton
        icon={<MessageCircle size={20} />}
        label="Inbox"
        onClick={onChat}
        badge={unreadCount}
      />
      <NavButton icon={<Settings size={20} />} label="Settings" onClick={onAdmin} />
    </motion.nav>
  );
}

function NavButton({
  icon,
  label,
  onClick,
  highlight,
  badge,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  highlight?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-0.5 min-w-[56px] min-h-[44px] py-1 rounded-xl transition-colors active:bg-rose-50/50"
    >
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
          highlight
            ? "bg-rose-400 text-white shadow-md shadow-rose-200"
            : "text-slate-400 hover:text-rose-400"
        }`}
      >
        {icon}
      </div>
      <span className="text-[0.5rem] text-slate-400 font-caveat">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-rose-400 text-white text-[0.4rem] flex items-center justify-center font-bold">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
  );
}
