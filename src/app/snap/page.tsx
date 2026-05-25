"use client";

import { useRouter } from "next/navigation";
import LiveSnap from "@/components/LiveSnap";

export default function SnapPage() {
  const router = useRouter();
  return (
    <LiveSnap
      onClose={() => router.push("/")}
      onSent={() => router.push("/")}
    />
  );
}
