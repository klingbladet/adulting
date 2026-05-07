"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AiChat from "@/components/chat/ai-chat";

export default function AiChatModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
      >
        <MessageCircle size={20} />
        Öppna AI-chatt
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="relative h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-background shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition hover:bg-black/70"
              aria-label="Stäng AI-chatt"
            >
              <X size={20} strokeWidth={2.5} className="text-white" />
            </button>

            <div className="h-full overflow-y-auto">
              <AiChat />
            </div>
          </div>
        </div>
      )}
    </>
  );
}