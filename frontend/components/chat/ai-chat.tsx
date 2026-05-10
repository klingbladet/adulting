"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  MessageCircle,
  Menu,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import type { AiLearningContext } from "@/lib/learning-context";

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

type AiChatProps = {
  /**
   * Används när chatten ligger i en modal.
   * Då ska stäng-knappen stänga modal, inte köra router.back().
   */
  onClose?: () => void;

  /**
   * Optional learning context.
   *
   * Om denna skickas med blir befintlig AI-chat lesson-aware.
   */
  learningContext?: AiLearningContext;

  /**
   * standalone:
   * AiChat renderar egen overlay.
   *
   * embedded:
   * AiChat ligger redan inuti en modal och ska inte skapa extra overlay.
   */
  variant?: "standalone" | "embedded";
};

export default function AiChat({
  onClose,
  learningContext,
  variant = "standalone",
}: AiChatProps) {
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
  const [view, setView] = useState<"ai" | "personer">("ai");
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
      setView("ai");

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
    setView("ai");
    setActiveThreadId(threadId);
    setSidebarOpen(false);
    await fetchMessages(threadId);
  }

  async function handleSendMessage() {
    const cleanMessage = messageInput.trim();

    if (!cleanMessage || sending) return;

    setError("");
    setSending(true);
    setView("ai");

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

          /**
           * Om AiChat får learningContext via props skickar vi den till backend.
           *
           * Backend använder då:
           * - courseId
           * - lessonId
           * - mode
           * - quizAnswers
           *
           * för att göra assistenten lesson-aware.
           */
          ...(learningContext ? { learningContext } : {}),
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

  function openAiChat() {
    setView("ai");
    setSidebarOpen(false);
  }

  function openPersonChat() {
    setView("personer");
    setSidebarOpen(false);
  }

  function handleCloseChat() {
  if (onClose) {
    onClose();
    return;
  }

  router.back();
}

  useEffect(() => {
    if (session) {
      fetchThreads();
    }
  }, [session]);

  useEffect(() => {
    if (activeThreadId && view === "ai") {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId, view]);

  const activeThreadTitle = useMemo(() => {
    const active = threads.find((item) => item.id === activeThreadId);
    return active?.title || "Ny AI-chatt";
  }, [threads, activeThreadId]);

  if (isPending || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black/50 px-4">
        <div className="rounded-3xl border border-border bg-card px-6 py-5 text-base shadow-xl">
          Laddar chatt...
        </div>
      </main>
    );
  }

  const isEmbedded = variant === "embedded";

return (
  <main
    className={
      isEmbedded
        ? "flex h-full w-full items-center justify-center bg-transparent"
        : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 py-4"
    }
  >
    <div
      className={
        isEmbedded
          ? "relative flex h-full w-full overflow-hidden bg-background"
          : "relative flex h-[90vh] w-full max-w-6xl overflow-hidden rounded-[30px] bg-background shadow-2xl md:h-[82vh] md:border md:border-border"
      }
    >
       {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-50 h-full w-[82%] max-w-77 border-r border-border bg-card p-5 transition duration-300 lg:static lg:z-auto lg:h-auto lg:w-[320px] lg:max-w-none lg:translate-x-0 lg:p-6 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Meny
            </h2>

            <button
              onClick={() => setSidebarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground lg:hidden"
            >
              <X size={19} />
            </button>
          </div>

          <div className="mt-7">
            <button
              onClick={openAiChat}
              className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                view === "ai" ? "bg-secondary" : "hover:bg-secondary/70"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Bot size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  AI-chat
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gå tillbaka till AI-assistenten
                </p>
              </div>
            </button>
          </div>

          <div className="mt-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Historik
            </p>

            <div className="space-y-1">
              {loadingThreads ? (
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Laddar tidigare chattar...
                </div>
              ) : threads.length === 0 ? (
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Ingen tidigare AI-chatt än.
                </div>
              ) : (
                threads.map((thread) => {
                  const isActive = activeThreadId === thread.id && view === "ai";

                  return (
                    <div
                      key={thread.id}
                      className={`group flex items-center gap-2 rounded-2xl px-2 py-2 transition ${
                        isActive ? "bg-secondary" : "hover:bg-secondary/70"
                      }`}
                    >
                      <button
                        onClick={() => handleSelectThread(thread.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                          <MessageCircle size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold text-foreground">
                            {thread.title}
                          </p>

                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDateTime(thread.updatedAt)}
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => deleteThread(thread.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-background hover:text-red-600"
                        title="Radera chatt"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <button
              onClick={openPersonChat}
              className={`flex w-full items-center justify-between rounded-2xl p-3 text-left transition ${
                view === "personer"
                  ? "bg-secondary"
                  : "hover:bg-secondary/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Person-chatt
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Chatta med en riktig person
                  </p>
                </div>
              </div>

              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/70 px-4 md:h-20 md:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-2xl text-foreground hover:bg-secondary lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div className="hidden h-10 w-10 lg:block" />

            <div className="min-w-0 text-center">
              <h1 className="text-base font-bold tracking-tight text-foreground md:text-lg">
                {view === "ai" ? "AI-chat" : "Person-chatt"}
              </h1>

              <p className="hidden max-w-[260px] truncate text-xs text-muted-foreground md:block">
                {view === "ai"
                  ? activeThreadTitle
                  : "Kontakta en riktig person"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={createThread}
                disabled={creatingThread}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition hover:scale-105 disabled:opacity-50"
                title="Ny AI-chatt"
              >
                <Plus size={22} />
              </button>

              <button
                onClick={handleCloseChat}
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-foreground transition hover:bg-secondary"
                title="Stäng"
              >
                <X size={22} />
              </button>
            </div>
          </header>

          {error && (
            <div className="mx-4 mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {error}
            </div>
          )}

          {view === "personer" ? (
            <div className="flex flex-1 items-center justify-center px-6 py-8">
              <div className="w-full max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                  <Users size={30} />
                </div>

                <h2 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
                  Person-chatt
                </h2>

                <p className="mx-auto mt-3 max-w-[280px] text-sm leading-6 text-muted-foreground">
                  Här kommer användaren kunna chatta med en riktig person från
                  teamet.
                </p>

                <button
                  onClick={openAiChat}
                  className="mt-7 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  Tillbaka till AI-chat
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-8 md:py-6">
                {loadingMessages ? (
                  <div className="text-sm text-muted-foreground">
                    Laddar meddelanden...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="w-full max-w-sm text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                        <Bot size={30} />
                      </div>

                      <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                        Hur kan jag hjälpa dig?
                      </h2>

                      <p className="mx-auto mt-3 max-w-[280px] text-sm leading-6 text-muted-foreground">
                        Skriv din fråga så hjälper jag dig på bästa sätt.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-auto max-w-3xl space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Bot size={15} />
                          </div>
                        )}

                        <div
                          className={`max-w-[88%] whitespace-pre-wrap rounded-[24px] px-4 py-3 text-left text-[15px] leading-7 shadow-sm md:max-w-[75%] ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-card text-foreground"
                          }`}
                        >
                          {message.content}
                        </div>

                        {message.role === "user" && (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground">
                            <User size={15} />
                          </div>
                        )}
                      </div>
                    ))}

                    {sending && (
                      <div className="flex items-end gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Bot size={15} />
                        </div>

                        <div className="rounded-[22px] border border-border bg-card px-4 py-3 text-left text-[15px] text-muted-foreground shadow-sm">
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

              <div className="shrink-0 border-t border-border/70 px-4 py-3 md:px-8 md:py-5">
                <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-card px-3 py-3 shadow-sm">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Skriv din fråga här..."
                    rows={1}
                    className="max-h-32 min-h-[24px] flex-1 resize-none bg-transparent px-2 text-left text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
                  />

                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !messageInput.trim()}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
                  >
                    <MessageCircle size={20} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}