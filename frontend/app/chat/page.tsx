"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { CreatorChat } from "@/components/ChatPage/SocketComponent";


type Thread = {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type Message = {
  id: string;
  threadId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type Creator = {
  id: string;
  name: string;
  image: string | null;
};
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function ChatPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"personer" | "ai">("ai");
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
  if (tab === "personer" && session) {
    fetchCreators();
  }
}, [tab, session]);

  async function fetchCreators() {
  try {
    setLoadingCreators(true);
    const response = await fetch(`${API_BASE}/api/users/creators`, {
      credentials: "include",
    });
    const data = await safeJson(response);
    if (!response.ok) throw new Error(data?.error);
    setCreators(Array.isArray(data) ? data : []);
  } catch {
    setCreators([]);
  } finally {
    setLoadingCreators(false);
  }
}

  async function safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async function fetchThreads(selectNewest = false) {
    try {
      setLoadingThreads(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/ai/threads`, {
        credentials: "include",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte hämta chattar.");
      }

      const list = Array.isArray(data) ? data : [];
      setThreads(list);

      if (list.length === 0) {
        setActiveThreadId(null);
        setMessages([]);
        return;
      }

      if (selectNewest) {
        setActiveThreadId(list[0].id);
        return;
      }

      if (!activeThreadId) {
        setActiveThreadId(list[0].id);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte hämta chattar.";
      setError(message);
    } finally {
      setLoadingThreads(false);
    }
  }

  async function fetchMessages(threadId: string) {
    try {
      setLoadingMessages(true);
      setError("");

      const response = await fetch(
        `${API_BASE}/api/ai/threads/${threadId}/messages`,
        {
          credentials: "include",
        }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte hämta meddelanden.");
      }

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte hämta meddelanden.";
      setError(message);
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createThread() {
    try {
      setCreatingThread(true);
      setError("");

      const response = await fetch(`${API_BASE}/api/ai/threads`, {
        method: "POST",
        credentials: "include",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte skapa ny chatt.");
      }

      await fetchThreads(true);
      setMessages([]);

      return data?.id as string;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte skapa ny chatt.";
      setError(message);
      return null;
    } finally {
      setCreatingThread(false);
    }
  }

  async function handleSelectThread(threadId: string) {
    setActiveThreadId(threadId);
    await fetchMessages(threadId);
  }

  async function handleSendMessage() {
    const cleanMessage = messageInput.trim();

    if (!cleanMessage || sending) return;

    setError("");
    setSending(true);

    let threadId = activeThreadId;

    if (!threadId) {
      threadId = await createThread();
      if (!threadId) {
        setSending(false);
        return;
      }
    }

    const optimisticUserMessage: Message = {
      id: `temp-${Date.now()}`,
      threadId,
      role: "user",
      content: cleanMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticUserMessage]);
    setMessageInput("");

    try {
      const response = await fetch(
        `${API_BASE}/api/ai/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message: cleanMessage,
          }),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error || "AI-assistenten kunde inte svara just nu."
        );
      }

      await fetchThreads();
      await fetchMessages(threadId);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "AI-assistenten kunde inte svara just nu.";

      setError(message);

      await fetchThreads();
      await fetchMessages(threadId);
    } finally {
      setSending(false);
    }
  }

  function handleTextareaKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  useEffect(() => {
    if (session) {
      fetchThreads();
    }
  }, [session]);

  useEffect(() => {
    if (activeThreadId && tab === "ai") {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId, tab]);

  const activeThreadTitle = useMemo(() => {
    const active = threads.find((item) => item.id === activeThreadId);
    return active?.title || "Ny AI-chatt";
  }, [threads, activeThreadId]);

  if (isPending || !session) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border bg-card p-8 text-lg">
          Laddar chatt...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid min-h-[78vh] grid-cols-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
        <aside className="border-r border-border bg-card p-8">
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            Chatt
          </h1>

          <div className="mt-8 rounded-2xl border border-border bg-background p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setTab("personer")}
                className={`rounded-xl px-4 py-3 text-base transition ${
                  tab === "personer"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                Personer
              </button>

              <button
                onClick={() => setTab("ai")}
                className={`rounded-xl px-4 py-3 text-base transition ${
                  tab === "ai"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground"
                }`}
              >
                AI
              </button>
            </div>
          </div>

          {tab === "personer" ? (
  <div className="mt-6 space-y-3">
    {loadingCreators ? (
      <div className="rounded-2xl border border-border bg-background p-4 text-muted-foreground">
        Laddar creators...
      </div>
    ) : creators.length === 0 ? (
      <div className="rounded-2xl border border-border bg-background p-4 text-muted-foreground">
        Inga creators hittades.
      </div>
    ) : (
      creators.map((creator) => (
  <div
    key={creator.id}
    onClick={() => setSelectedCreator(creator)}
    className={`flex items-center gap-3 rounded-2xl border p-4 cursor-pointer transition ${
      selectedCreator?.id === creator.id
        ? "border-primary bg-secondary"
        : "border-border bg-background hover:border-primary/40"
    }`}
  >
          {creator.image ? (
            <img
              src={creator.image}
              alt={creator.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
              {creator.name.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="text-base font-medium text-foreground">
            {creator.name}
          </p>
        </div>
      ))
    )}
  </div>
          ) : (
            <>
              <button
                onClick={createThread}
                disabled={creatingThread}
                className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-lg font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-60"
              >
                {creatingThread ? "Skapar..." : "Ny AI-chatt"}
              </button>

              <div className="mt-10">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  Senaste
                </p>

                <div className="space-y-3">
                  {loadingThreads ? (
                    <div className="rounded-2xl border border-border bg-background p-4 text-muted-foreground">
                      Laddar tidigare chattar...
                    </div>
                  ) : threads.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-background p-4 text-muted-foreground">
                      Ingen tidigare AI-chatt än.
                    </div>
                  ) : (
                    threads.map((thread) => {
                      const isActive = activeThreadId === thread.id;

                      return (
                        <button
                          key={thread.id}
                          onClick={() => handleSelectThread(thread.id)}
                          className={`block w-full rounded-2xl border p-4 text-left transition ${
                            isActive
                              ? "border-primary bg-secondary"
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <p className="line-clamp-2 text-base font-medium text-foreground">
                            {thread.title}
                          </p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </aside>

       {tab === "personer" ? (
  <section className="flex min-h-[78vh] items-center justify-center bg-gradient-to-br from-secondary via-background to-accent p-6 md:p-8">
    <div className="w-full max-w-2xl rounded-[24px] border border-dashed border-border bg-background/70 px-8 py-16 text-center">
      <h2 className="text-4xl font-bold text-foreground">
        Välj en person
      </h2>
      <p className="mt-4 text-lg text-muted-foreground">
        Välj en creator i listan till vänster för att starta en chatt.
      </p>
    </div>
  </section>
        ) : (
          <section className="flex min-h-[78vh] flex-col bg-gradient-to-br from-secondary via-background to-accent p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-foreground">
                  AI-assistent
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fråga om vad som helst i vardagen.
                </p>
              </div>

              <div className="hidden rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground md:block">
                {activeThreadTitle}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto rounded-[24px] border border-border bg-background/70 p-4 md:p-6">
              {loadingMessages ? (
                <div className="text-muted-foreground">
                  Laddar meddelanden...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="max-w-xl rounded-[24px] border border-border bg-card px-8 py-7 text-center shadow-sm">
                    <p className="text-2xl font-semibold text-foreground">
                      Ställ din första fråga
                    </p>
                    <p className="mt-3 text-lg leading-8 text-muted-foreground">
                      Till exempel:
                      <br />
                      “Hur gör jag en enkel budget?”
                      <br />
                      “Vad ska jag tänka på när jag söker bostad?”
                      <br />
                      “Hur skriver jag ett enkelt CV?”
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-[24px] px-5 py-4 text-base leading-7 shadow-sm whitespace-pre-wrap ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="mt-5 flex items-end gap-3">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Skriv din fråga här..."
                rows={2}
                className="min-h-[76px] flex-1 resize-none rounded-[22px] border border-border bg-card px-5 py-4 text-base outline-none placeholder:text-muted-foreground"
              />

              <button
                onClick={handleSendMessage}
                disabled={sending || !messageInput.trim()}
                className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-primary text-2xl text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
              >
                {sending ? "..." : "➤"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}