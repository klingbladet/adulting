/* "use client";
import { io, type Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import type { Creator } from "@/app/chat/page";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function CreatorChat({ creators }: { creators: Creator[] }) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const { data: session } = useSession();
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3002";

  const roomId = selectedCreator
    ? [session?.user.id, selectedCreator.id].sort().join("_")
    : null;

  useEffect(() => {
    if (!session?.user.id) return;

    const socket = io(socketUrl, {
      auth: { userId: session.user.id },
    });

    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (error) => {
      console.error("Socket connect error:", error);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [session?.user.id, socketUrl]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!roomId || !socket) return;

    socket.emit("join_room", roomId);
    console.log("join_room", roomId);

    const handler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handler);

    return () => {
      if (socket) {
        socket.off("receive_message", handler);
        socket.emit("leave_room", roomId);
      }
      setMessages([]);
    };
  }, [roomId]);

  useEffect(() => {
    console.log("CreatorChat messages changed", messages.length, bottomRef.current);
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!input.trim() || !roomId || !session?.user.id || !socket) return;

    const message: Message = {
      id: crypto.randomUUID(),
      senderId: session.user.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    console.log("send_message", roomId, message);
    socket.emit("send_message", { roomId, message });
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <div className="flex h-full min-h-[78vh] overflow-hidden rounded-[28px] border border-border bg-card shadow-sm">
      <aside className="w-64 border-r border-border bg-background p-6 flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Användare
        </h2>
        {creators.map((creator) => (
          <button
            key={creator.id}
            onClick={() => setSelectedCreator(creator)}
            className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
              selectedCreator?.id === creator.id
                ? "bg-black text-white"
                : "hover:bg-gray-200"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold uppercase">
              {creator.name?.[0]}
            </div>
            <span className="text-sm font-medium">{creator.name}</span>
          </button>
        ))}
      </aside>

      <main className="flex-1 flex flex-col bg-background/70 p-4">
        {selectedCreator ? (
          <>
            <header className="border-b border-border px-6 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold uppercase">
                {selectedCreator.name?.[0]}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{selectedCreator.name}</p>
                <p className={`text-xs ${connected ? "text-green-500" : "text-muted-foreground"}`}>
                  {connected ? "Ansluten" : "Offline"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === session?.user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-[22px] text-sm leading-6 whitespace-pre-wrap shadow-sm ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "border border-border bg-card text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                      <span className="block text-xs mt-1 opacity-50 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString("sv-SE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <footer className="border-t border-border px-6 py-4 flex gap-3">
              <textarea
                className="min-h-19 flex-1 resize-none rounded-[22px] border border-border bg-card px-5 py-4 text-base outline-none placeholder:text-muted-foreground"
                placeholder="Skriv ett meddelande..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="flex h-19 w-19 items-center justify-center rounded-[22px] bg-primary text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
              >
                Skicka
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Välj en användare för att börja chatta
          </div>
        )}
      </main>
    </div>
  );
} */