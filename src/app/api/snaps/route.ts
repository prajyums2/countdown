import { NextRequest, NextResponse } from "next/server";
import CryptoJS from "crypto-js";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";
const ENCRYPTION_KEY = process.env.SNAP_ENCRYPTION_KEY || "fallback-dev-key-change-me";

function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function decrypt(data: string): string {
  const bytes = CryptoJS.AES.decrypt(data, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

async function fetchScript(body: Record<string, unknown>) {
  if (!APPS_SCRIPT_URL) {
    throw new Error("APPS_SCRIPT_URL not configured in Vercel env vars");
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; Next.js/14)",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    throw new Error(
      "Apps Script returned an HTML page instead of JSON — " +
      "ensure the web app is deployed as 'Anyone, even anonymous' " +
      "and the URL in Vercel env vars is correct"
    );
  }
  return JSON.parse(text);
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const imageBase64 = form.get("image") as string;
    const allowance = form.get("allowance") as string;
    const senderId = form.get("senderId") as string;

    if (!imageBase64 || !allowance || !senderId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const encrypted = encrypt(imageBase64);

    const result = await fetchScript({
      action: "addSnap",
      payload: { encryptedContent: encrypted, allowance, senderId },
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "getSnaps";
    const identity = searchParams.get("identity");

    if (action === "getSnapContent") {
      const fileId = searchParams.get("fileId");
      if (!fileId) return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
      const data = await fetchScript({ action: "getSnapContent", payload: { fileId } });
      const decrypted = decrypt(data.content || "");
      return NextResponse.json({ content: decrypted, snap: data.snap });
    }

    if (action === "markViewed") {
      const snapId = searchParams.get("snapId");
      if (!snapId) return NextResponse.json({ error: "Missing snapId" }, { status: 400 });
      const data = await fetchScript({ action: "updateSnapView", payload: { snapId } });
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
