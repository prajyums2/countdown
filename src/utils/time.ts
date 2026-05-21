import type { Station, StationProgress } from "@/lib/types";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export type JourneyPhase = "pre-boarding" | "in-transit" | "arrived";

export function getCountdown(targetDate: Date, now?: Date): Countdown {
  const _now = now || new Date();
  const diffMs = Math.max(targetDate.getTime() - _now.getTime(), 0);
  const totalSeconds = Math.floor(diffMs / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function getJourneyProgress(
  trainBoardingDate: Date,
  arrivalDate: Date,
  now?: Date
): number {
  const _now = now || new Date();
  if (_now < trainBoardingDate) return 0;
  if (_now > arrivalDate) return 100;

  const total = arrivalDate.getTime() - trainBoardingDate.getTime();
  const elapsed = _now.getTime() - trainBoardingDate.getTime();

  return Math.min(Math.round((elapsed / total) * 100), 100);
}

export function getJourneyPhase(
  trainBoardingDate: Date,
  arrivalDate: Date,
  now?: Date
): JourneyPhase {
  const _now = now || new Date();
  if (_now < trainBoardingDate) return "pre-boarding";
  if (_now > arrivalDate) return "arrived";
  return "in-transit";
}

export function getStationsProgress(stations: Station[], now?: Date): StationProgress {
  const _now = now || new Date();

  if (!stations.length) {
    return {
      overallPercent: 0,
      currentLegIndex: 0,
      totalLegs: 0,
      legPercent: 0,
      prevStation: null,
      nextStation: null,
    };
  }

  const sorted = [...stations].sort((a, b) => a.orderIndex - b.orderIndex);

  if (_now < new Date(sorted[0].dateTime)) {
    return {
      overallPercent: 0,
      currentLegIndex: 0,
      totalLegs: sorted.length - 1,
      legPercent: 0,
      prevStation: sorted[0],
      nextStation: null,
    };
  }

  if (_now >= new Date(sorted[sorted.length - 1].dateTime)) {
    return {
      overallPercent: 100,
      currentLegIndex: sorted.length - 1,
      totalLegs: sorted.length - 1,
      legPercent: 100,
      prevStation: sorted[sorted.length - 1],
      nextStation: null,
    };
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = new Date(sorted[i].dateTime).getTime();
    const b = new Date(sorted[i + 1].dateTime).getTime();

    if (_now.getTime() >= a && _now.getTime() < b) {
      const legElapsed = _now.getTime() - a;
      const legTotal = b - a;
      const legPercent = Math.round((legElapsed / legTotal) * 100);

      const totalLegs = sorted.length - 1;
      const overallPercent = Math.round(
        ((i + legPercent / 100) / totalLegs) * 100
      );

      return {
        overallPercent,
        currentLegIndex: i,
        totalLegs,
        legPercent,
        prevStation: sorted[i],
        nextStation: sorted[i + 1],
      };
    }
  }

  return {
    overallPercent: 0,
    currentLegIndex: 0,
    totalLegs: sorted.length - 1,
    legPercent: 0,
    prevStation: null,
    nextStation: null,
  };
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
