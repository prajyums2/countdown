"use client";

import { motion } from "framer-motion";
import HeartRain from "./HeartRain";

export default function DateNightSurprise({
  message,
  spotifyUrl,
}: {
  message: string;
  spotifyUrl: string;
}) {
  // Helper to ensure any standard Spotify link becomes an embeddable widget link
  const embedUrl = spotifyUrl.includes("/embed/") 
    ? spotifyUrl 
    : spotifyUrl.replace("open.spotify.com/", "open.spotify.com/embed/");

  return (
    <div className="relative overflow-hidden rounded-3xl pb-2">
      <HeartRain active />

      <div className="relative z-10 space-y-6 p-2">
        {/* Header */}
        <motion.div
          className="text-center space-y-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 16 }}
        >
          <h3 className="text-2xl font-caveat font-bold text-rose-500">Date Night ✨</h3>
          <p className="text-xs text-slate-400 font-nunito uppercase tracking-widest font-semibold">A night to remember</p>
        </motion.div>

        {/* The Menu / Message Card */}
        {message && (
          <motion.div
            className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 120, damping: 14 }}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-100/50 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🍝</span>
                <span className="text-[11px] font-nunito font-bold text-rose-400 uppercase tracking-widest">
                  Tonight's Menu
                </span>
              </div>
              <p className="text-sm text-slate-600 whitespace-pre-line font-caveat leading-relaxed text-lg">
                {message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Premium Spotify Player Wrapper */}
        {spotifyUrl && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            className="relative"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-rose-200 to-pink-200 rounded-3xl blur opacity-30 animate-pulse" />
            
            <div className="relative bg-white/80 backdrop-blur-xl border border-white shadow-sm rounded-[1.25rem] p-3 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2 w-full justify-center">
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <p className="text-[10px] text-rose-400 font-nunito font-bold uppercase tracking-widest">
                  Playing Our Song
                </p>
                <div className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              </div>
              
              <iframe
                src={embedUrl}
                width="100%"
                height="80"
                allow="encrypted-media"
                className="rounded-xl"
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}