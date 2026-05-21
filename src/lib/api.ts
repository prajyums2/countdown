import type { SheetData, Station, Milestone, JourneyConfig } from "@/lib/types";

const API_BASE = "/api/data";
const DIRECT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

export async function fetchData(): Promise<SheetData> {
  if (DIRECT_URL) {
    const res = await fetch(DIRECT_URL, { cache: "no-store" });
    if (res.ok) {
      const text = await res.text();
      return JSON.parse(text);
    }
  }

  const res = await fetch(API_BASE, { cache: "no-store" });
  if (res.ok) return res.json();

  throw new Error("No data source available");
}

export async function addStation(station: Omit<Station, "id">, pin: string): Promise<Station> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addStation", payload: station, pin }),
  });
  if (!res.ok) throw new Error("Failed to add station");
  return res.json();
}

export async function updateStation(station: Station, pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateStation", payload: station, pin }),
  });
  if (!res.ok) throw new Error("Failed to update station");
}

export async function deleteStation(id: string, pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteStation", payload: { id }, pin }),
  });
  if (!res.ok) throw new Error("Failed to delete station");
}

export async function reorderStations(ids: string[], pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "reorderStations", payload: { ids }, pin }),
  });
  if (!res.ok) throw new Error("Failed to reorder stations");
}

export async function addMilestone(milestone: Omit<Milestone, "id">, pin: string): Promise<Milestone> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "addMilestone", payload: milestone, pin }),
  });
  if (!res.ok) throw new Error("Failed to add milestone");
  return res.json();
}

export async function updateMilestone(milestone: Milestone, pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateMilestone", payload: milestone, pin }),
  });
  if (!res.ok) throw new Error("Failed to update milestone");
}

export async function deleteMilestone(id: string, pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "deleteMilestone", payload: { id }, pin }),
  });
  if (!res.ok) throw new Error("Failed to delete milestone");
}

export async function updateConfig(config: JourneyConfig, pin: string): Promise<void> {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "updateConfig", payload: config, pin }),
  });
  if (!res.ok) throw new Error("Failed to update config");
}
