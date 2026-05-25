"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Profile, ProfileId } from "@/lib/types";

interface ProfileContextType {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  setProfile: () => {},
  clearProfile: () => {},
});

export function useProfile() {
  return useContext(ProfileContext);
}

const STORAGE_KEY = "countdown_profile";
const TTL = 12 * 60 * 60 * 1000;

interface StoredProfile {
  profile: Profile;
  expiresAt: number;
}

const PROFILES: Profile[] = [
  { identity: "prajyu", name: "Prajyu", avatar: "🎮" },
  { identity: "meghs", name: "Meghs", avatar: "🌸" },
];

function loadProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored: StoredProfile = JSON.parse(raw);
    if (Date.now() > stored.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored.profile;
  } catch {
    return null;
  }
}

function saveProfile(profile: Profile) {
  const stored: StoredProfile = { profile, expiresAt: Date.now() + TTL };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export default function ProfileGate({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfileState(loadProfile());
    setLoaded(true);
  }, []);

  const setProfile = (p: Profile) => {
    saveProfile(p);
    setProfileState(p);
  };

  const clearProfile = () => {
    localStorage.removeItem(STORAGE_KEY);
    setProfileState(null);
  };

  if (!loaded) return null;

  return (
    <ProfileContext.Provider value={{ profile, setProfile, clearProfile }}>
      <AnimatePresence mode="wait">
        {!profile ? (
          <motion.div
            key="gate"
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-xl" />
            <motion.div
              className="relative bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-rose-900/10 border border-white/80 p-8 w-full max-w-sm text-center space-y-6"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 150, damping: 18 }}
            >
              <div className="space-y-2">
                <h1 className="text-2xl font-caveat text-rose-400">Who&apos;s holding the phone?</h1>
                <p className="text-xs text-slate-400 font-caveat">Pick your profile to continue</p>
              </div>
              <div className="flex flex-col gap-3">
                {PROFILES.map((p) => (
                  <motion.button
                    key={p.identity}
                    onClick={() => setProfile(p)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-rose-50 hover:border-rose-200 hover:bg-white/80 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-3xl">{p.avatar}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{p.name}</p>
                      <p className="text-xs text-slate-400 font-caveat">
                        {p.identity === "meghs" ? "Receive memories" : "Send memories"}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <p className="text-[0.55rem] text-slate-300 font-caveat">
                Selection lasts 12 hours
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </ProfileContext.Provider>
  );
}
