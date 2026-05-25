import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";
const ADMIN_PIN = process.env.ADMIN_PIN || "2026";

async function fetchAppsScript(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...options?.headers,
      "User-Agent": "Mozilla/5.0 (compatible; Next.js/14)",
    },
  });
  const text = await res.text();
  if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
    throw new Error(
      "Apps Script returned HTML — ensure it's deployed as 'Anyone, even anonymous'"
    );
  }
  return { text, ok: res.ok };
}

export async function GET() {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { error: "Apps Script URL not configured" },
      { status: 503 }
    );
  }

  try {
    const { text } = await fetchAppsScript(APPS_SCRIPT_URL);
    return NextResponse.json(JSON.parse(text));
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { error: "Apps Script URL not configured" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { pin, ...rest } = body;

    if (pin !== ADMIN_PIN) {
      return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
    }

    const { text } = await fetchAppsScript(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });

    return NextResponse.json(text ? JSON.parse(text) : null);
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 502 }
    );
  }
}
