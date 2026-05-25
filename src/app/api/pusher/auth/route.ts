import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const socket_id = form.get("socket_id") as string;
    const channel_name = form.get("channel_name") as string;

    if (!socket_id || !channel_name) {
      return NextResponse.json({ error: "Missing socket_id or channel_name" }, { status: 400 });
    }

    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
    const secret = process.env.PUSHER_SECRET || "";

    const stringToSign = `${socket_id}::${channel_name}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(stringToSign);
    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, msgData);
    const auth = `${key}:${Buffer.from(signature).toString("hex")}`;

    return NextResponse.json({ auth });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
