import type { Snap, ProfileId, SnapAllowance } from "@/lib/types";

const API = "/api/snaps";

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
  await fetch(`${API}?action=markViewed&snapId=${snapId}`, { cache: "no-store" });
}
