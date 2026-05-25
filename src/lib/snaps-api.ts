import type { Snap, ProfileId, SnapAllowance } from "@/lib/types";

const API = "/api/snaps";
const DIRECT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

async function appsScriptFetch(body: Record<string, unknown>) {
  const res = await fetch(DIRECT_URL, {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return JSON.parse(text);
}

export async function sendSnap(
  imageBase64: string,
  allowance: SnapAllowance,
  senderId: ProfileId
): Promise<{ id: string; fileId: string }> {
  const fd = new FormData();
  fd.set("image", imageBase64);
  fd.set("allowance", allowance);
  fd.set("senderId", senderId);
  const res = await fetch(API, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Failed to send snap");
  return res.json();
}

export async function fetchSnaps(identity?: string): Promise<Snap[]> {
  if (DIRECT_URL) {
    try {
      const data = await appsScriptFetch({ action: "getSnaps", payload: { identity } });
      return data.snaps || [];
    } catch {}
  }

  const params = identity ? `?identity=${identity}` : "";
  const res = await fetch(`${API}${params}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch snaps");
  const data = await res.json();
  return data.snaps || [];
}

export async function fetchSnapContent(
  fileId: string
): Promise<{ content: string; snap: Snap }> {
  const res = await fetch(`${API}?action=getSnapContent&fileId=${fileId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch snap content");
  return res.json();
}

export async function markSnapViewed(snapId: string): Promise<void> {
  if (DIRECT_URL) {
    try {
      await appsScriptFetch({ action: "updateSnapView", payload: { snapId } });
      return;
    } catch {}
  }

  await fetch(`${API}?action=markViewed&snapId=${snapId}`, { cache: "no-store" });
}

export async function addComment(
  snapId: string,
  message: string,
  senderId: ProfileId
): Promise<void> {
  if (DIRECT_URL) {
    try {
      await appsScriptFetch({ action: "addComment", payload: { snapId, message, senderId } });
      return;
    } catch {}
  }

  await fetch(
    `${API}?action=addComment&snapId=${snapId}&message=${encodeURIComponent(message)}&senderId=${senderId}`,
    { cache: "no-store" }
  );
}
