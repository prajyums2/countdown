import type { ProfileId } from "./types";

let PusherClient: any = null;
let channel: any = null;

export async function getPusher() {
  if (PusherClient) return PusherClient;
  const Pusher = (await import("pusher-js")).default;
  Pusher.logToConsole = false;
  PusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || "", {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "",
    authEndpoint: "/api/pusher/auth",
    forceTLS: true,
  });
  return PusherClient;
}

export async function subscribeToSnap(
  snapId: string,
  onTyping: (senderId: ProfileId) => void,
  onStopTyping: () => void
) {
  const p = await getPusher();
  channel = p.subscribe(`private-snap-${snapId}`);
  channel.bind("client-typing", (data: { senderId: ProfileId }) => {
    onTyping(data.senderId);
  });
  channel.bind("client-stop-typing", () => {
    onStopTyping();
  });
  return channel;
}

export function emitTyping(snapId: string, senderId: ProfileId) {
  if (!channel) return;
  channel.trigger("client-typing", { senderId });
}

export function emitStopTyping(snapId: string) {
  if (!channel) return;
  channel.trigger("client-stop-typing", {});
}

export function unsubscribeFromSnap() {
  if (channel) {
    channel.unbind_all();
    channel.unsubscribe();
    channel = null;
  }
}

export function disconnectPusher() {
  unsubscribeFromSnap();
  if (PusherClient) {
    PusherClient.disconnect();
    PusherClient = null;
  }
}
