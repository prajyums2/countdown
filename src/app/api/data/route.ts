import { NextResponse } from "next/server";

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || "";
const ADMIN_PIN = process.env.ADMIN_PIN || "2026";

async function fetchAppsScript(url: string, options?: RequestInit) {
  return fetch(url, {
    ...options,
    cache: "no-store",
    headers: {
      ...options?.headers,
      "User-Agent":
        "Mozilla/5.0 (compatible; Next.js/14)",
    },
  });
}

export async function GET() {
  if (!APPS_SCRIPT_URL) {
    return NextResponse.json(
      { error: "Apps Script URL not configured" },
      { status: 503 }
    );
  }

  try {
    const res = await fetchAppsScript(APPS_SCRIPT_URL);
    if (res.ok) {
      const text = await res.text();
      return NextResponse.json(JSON.parse(text));
    }
  } catch {}

  return NextResponse.redirect(APPS_SCRIPT_URL);
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

    const res = await fetchAppsScript(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rest),
    });

    if (!res.ok) throw new Error(`Apps Script returned ${res.status}`);
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 502 }
    );
  }
}
