"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, MessageCircle, Trash2, User, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
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

const quickQuestions = [
  "Hur gör jag en enkel budget?",
  "Hur skriver jag ett CV?",
  "Vad ska jag tänka på när jag söker bostad?",
  "Hur planerar jag min vecka bättre?",
];

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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function safeJson(response: Response) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  function formatDateTime(value: string) {
    try {
      return new Intl.DateTimeFormat("sv-SE", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value));
    } catch {
      return "";
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
      setActiveThreadId(data?.id);
      setMessages([]);
      setSidebarOpen(false);

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

  async function deleteThread(threadId: string) {
    const confirmed = window.confirm("Vill du radera den här AI-chatten?");
    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API_BASE}/api/ai/threads/${threadId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte radera chatten.");
      }

      if (activeThreadId === threadId) {
        setActiveThreadId(null);
        setMessages([]);
      }

      await fetchThreads(true);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Kunde inte radera chatten.";
      setError(message);
    }
  }

  async function handleSelectThread(threadId: string) {
    setActiveThreadId(threadId);
    setSidebarOpen(false);
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

      const data = await safeJson(response);

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
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-2xl border border-border bg-card px-4 py-2 text-sm font-medium"
        >
          Chattar
        </button>

        <button
          onClick={createThread}
          disabled={creatingThread}
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          Ny AI-chatt
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <div className="grid min-h-[78vh] grid-cols-1 overflow-hidden rounded-[28px] border border-border bg-card shadow-sm lg:grid-cols-[340px_1fr]">
        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[320px] border-r border-border bg-card p-6 transition lg:static lg:z-auto lg:h-auto lg:w-auto lg:p-8 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              Chatt
            </h1>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-xl border border-border p-2 text-sm lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

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
            <div className="mt-6 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
              Här kommer person-chatt senare från Daniel.
            </div>
          ) : (
            <>
              <button
                onClick={createThread}
                disabled={creatingThread}
                className="mt-6 hidden w-full rounded-2xl bg-primary px-5 py-4 text-lg font-medium text-primary-foreground transition hover:opacity-95 disabled:opacity-60 lg:block"
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
                        <div
                          key={thread.id}
                          className={`group flex items-center gap-2 rounded-2xl border p-3 transition ${
                            isActive
                              ? "border-primary bg-secondary"
                              : "border-border bg-background hover:border-primary/40"
                          }`}
                        >
                          <button
                            onClick={() => handleSelectThread(thread.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="line-clamp-1 text-base font-semibold text-foreground">
                              {thread.title}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDateTime(thread.updatedAt)}
                            </p>
                          </button>

                          <button
                            onClick={() => deleteThread(thread.id)}
                            className="rounded-xl p-2 text-muted-foreground opacity-70 transition hover:bg-background hover:text-red-600 group-hover:opacity-100"
                            title="Radera chatt"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Users size={28} />
              </div>

              <h2 className="mt-6 text-4xl font-bold text-foreground">
                Person-chatt
              </h2>

              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Här kommer användaren kunna kontakta en riktig person från
                teamet och få svar direkt eller senare.
              </p>

              <button
                disabled
                className="mt-8 rounded-2xl border border-border bg-card px-6 py-3 text-sm text-muted-foreground"
              >
                Kommer snart
              </button>
            </div>
          </section>
        ) : (
          <section className="flex min-h-[78vh] flex-col bg-gradient-to-br from-secondary via-background to-accent p-5 md:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-foreground md:text-4xl">
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
              <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
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
                  <div className="max-w-2xl rounded-[28px] border border-border bg-card px-8 py-8 text-center shadow-sm">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot size={28} />
                    </div>

                    <p className="mt-5 text-2xl font-semibold text-foreground">
                      Ställ din första fråga
                    </p>

                    <p className="mt-3 text-base leading-7 text-muted-foreground">
                      Välj en snabbfråga eller skriv själv.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {quickQuestions.map((question) => (
                        <button
                          key={question}
                          onClick={() => setMessageInput(question)}
                          className="rounded-2xl border border-border bg-background px-4 py-3 text-left text-sm text-foreground transition hover:border-primary hover:bg-secondary"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot size={17} />
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] rounded-[24px] px-5 py-4 text-base leading-7 shadow-sm whitespace-pre-wrap ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground">
                          <User size={17} />
                        </div>
                      )}
                    </div>
                  ))}

                  {sending && (
                    <div className="flex items-end gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Bot size={17} />
                      </div>

                      <div className="rounded-[24px] border border-border bg-card px-5 py-4 text-base text-muted-foreground shadow-sm">
                        <span>AI skriver</span>
                        <span className="ml-1 inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce delay-100">.</span>
                          <span className="animate-bounce delay-200">.</span>
                        </span>
                      </div>
                    </div>
                  )}

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
                className="flex h-[76px] w-[76px] items-center justify-center rounded-[22px] bg-primary text-primary-foreground transition hover:opacity-95 disabled:opacity-50"
              >
                {sending ? (
                  <MessageCircle size={24} />
                ) : (
                  <MessageCircle size={26} />
                )}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}