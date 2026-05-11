import AiChatModal from "@/components/chat/ai-chat-modal";

export default function AiChatPopupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-bold text-foreground">
          AI-chatt popup
        </h1>

        <p className="mt-4 text-muted-foreground">
          Klicka på knappen för att öppna chatten.
        </p>

        <div className="mt-8 flex justify-center">
          <AiChatModal />
        </div>
      </div>
    </main>
  );
}