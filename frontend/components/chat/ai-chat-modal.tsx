"use client";

import { ReactNode, useState } from "react";
import { MessageCircle } from "lucide-react";
import AiChat from "@/components/chat/ai-chat";
import {
  type AiLearningContext,
} from "@/lib/learning-context";

type AiChatModalProps = {
  learningContext?: AiLearningContext;

  /**
   * Optional custom trigger.
   *
   * Om trigger skickas in använder vi den.
   * Annars visas standardknappen "Öppna AI-chatt".
   */
  trigger?: (open: () => void) => ReactNode;
};

export default function AiChatModal({
  learningContext,
  trigger,
}: AiChatModalProps) {
  const [open, setOpen] = useState(false);

  const resolvedLearningContext = learningContext;

  return (
    <>
      {trigger ? (
        trigger(() => setOpen(true))
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <MessageCircle size={20} />
          Öppna AI-chatt
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 animate-in fade-in duration-200">
          <div className="relative h-[90vh] w-full max-w-6xl overflow-hidden rounded-3xl bg-background shadow-xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-200">
            <AiChat
              variant="embedded"
              onClose={() => setOpen(false)}
              learningContext={learningContext}
            />
          </div >
        </div >
      )
      }
    </>
  );
}