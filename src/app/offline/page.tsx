"use client";

import { Heart } from "lucide-react";

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] bg-paper-texture px-4 py-8 md:py-16 flex items-center justify-center">
      <div className="max-w-sm mx-auto text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 flex items-center justify-center">
          <Heart size={36} className="text-rose-300" />
        </div>
        <h1 className="text-2xl font-caveat text-slate-600">You&apos;re offline</h1>
        <p className="text-sm text-slate-400 font-caveat leading-relaxed">
          The journey&apos;s still happening — just can&apos;t show it right now.
          Come back when you&apos;re connected again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-rose-100 text-rose-500 rounded-full text-sm font-caveat hover:bg-rose-200 transition-colors"
        >
          Try again
        </button>
        <p className="text-xs text-slate-300 font-caveat">Every mile brings us closer ♥</p>
      </div>
    </main>
  );
}
