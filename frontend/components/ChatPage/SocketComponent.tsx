"use client";
import { io, Socket } from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import type { Creator } from "@/app/chat/page";

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

let socket: Socket;

export function CreatorChat({ creators }: { creators: Creator[] }) {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  const roomId = selectedCreator
    ? [session?.user.id, selectedCreator.id].sort().join("_")
    : null;

  useEffect(() => {
    if (!session?.user.id) return;

    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { userId: session.user.id },
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (!roomId || !socket) return;

    socket.emit("join_room", roomId);

    const handler = (message: Message) => {
      setMessages((prev) => [...prev, message]);
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
      socket.emit("leave_room", roomId);
      setMessages([]);
    };
  }, [roomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim() || !roomId || !session?.user.id) return;

    const message: Message = {
      id: crypto.randomUUID(),
      senderId: session.user.id,
      content: input.trim(),
      createdAt: new Date().toISOString(),
    };

    socket.emit("send_message", { roomId, message });
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Kreatörer
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

      <main className="flex-1 flex flex-col">
        {selectedCreator ? (
          <>
            <header className="border-b px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center font-bold uppercase">
                {selectedCreator.name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{selectedCreator.name}</p>
                <p className={`text-xs ${connected ? "text-green-500" : "text-gray-400"}`}>
                  {connected ? "Ansluten" : "Offline"}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
              {messages.map((msg) => {
                const isMe = msg.senderId === session?.user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                        isMe
                          ? "bg-black text-white rounded-br-sm"
                          : "bg-gray-100 text-gray-900 rounded-bl-sm"
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

            <footer className="border-t px-6 py-4 flex gap-3">
              <input
                className="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                placeholder="Skriv ett meddelande..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-black text-white rounded-full px-5 py-2 text-sm font-medium disabled:opacity-40 hover:bg-gray-800 transition-colors"
              >
                Skicka
              </button>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Välj en kreatör för att börja chatta
          </div>
        )}
      </main>
    </div>
  );
}