"use client";

import { useState } from "react";
import ChatDrawer from "@/components/ChatDrawer";

export default function ChatPage() {
  const [open, setOpen] = useState(true);
  return <ChatDrawer open={open} onOpenChange={setOpen} />;
}
