"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronRight,
  Lightbulb,
  Menu,
  MessageCircle,
  Plus,
  Send,
  Settings,
  Sparkles,
  Trash2,
  User,
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
  onClose?: () => void;
  learningContext?: AiLearningContext;
  variant?: "standalone" | "embedded";
};

const suggestions = [
  {
    title: "Förklara ett begrepp",
    description: "Få enkla förklaringar på svåra begrepp",
    icon: Lightbulb,
    prompt: "Förklara ett begrepp enkelt",
  },
  {
    title: "Hjälp med kursen",
    description: "Få hjälp med uppgifter och förståelse",
    icon: Bot,
    prompt: "Hjälp mig med kursen",
  },
  {
    title: "Tips för studier",
    description: "Få personliga tips som hjälper dig",
    icon: Sparkles,
    prompt: "Ge mig tips för studier",
  },
];



function AiRobotIcon({
  size = "md",
}: {
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: {
      wrapper: "h-10 w-10",
      head: "h-6 w-6",
      eyes: "h-1 w-1",
    },
    md: {
      wrapper: "h-14 w-14",
      head: "h-8 w-8",
      eyes: "h-1.5 w-1.5",
    },
    lg: {
      wrapper: "h-28 w-28",
      head: "h-16 w-16",
      eyes: "h-2 w-2",
    },
  };

  const current = sizes[size];

  return (
    <div
      className={`relative flex ${current.wrapper} items-center justify-center rounded-full bg-gradient-to-br from-[#F4F0FF] to-[#E7DEFF] shadow-inner dark:from-[#1A1730] dark:to-[#121829]`}
    >
      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-[#7C5CFF]/10 blur-xl" />

      {/* Sparkles */}
      {size === "lg" && (
        <>
          <Sparkles
            size={16}
            className="absolute right-2 top-2 text-[#A78BFA]"
          />
          <Sparkles
            size={10}
            className="absolute right-6 top-1 text-[#C4B5FD]"
          />
        </>
      )}

      {/* Robot */}
      <div className="relative flex flex-col items-center">
        {/* Antenna */}
        <div className="mb-1 flex flex-col items-center">
          <div className="h-2 w-[2px] rounded-full bg-[#8B5CF6]" />
          <div className="h-2 w-2 rounded-full bg-[#A78BFA]" />
        </div>

        {/* Head */}
        <div
          className={`relative flex ${current.head} items-center justify-center rounded-2xl border border-[#A78BFA]/30 bg-gradient-to-b from-[#6D4CFF] to-[#5B3FF2] shadow-lg`}
        >
          {/* Eyes */}
          <div className="flex gap-2">
            <span
              className={`${current.eyes} rounded-full bg-white`}
            />
            <span
              className={`${current.eyes} rounded-full bg-white`}
            />
          </div>

          {/* Smile */}
          <div className="absolute bottom-2 h-[2px] w-4 rounded-full bg-white/80" />
        </div>
      </div>
    </div>
  );
}

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
      setError(err instanceof Error ? err.message : "Kunde inte hämta chattar.");
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
        { credentials: "include" }
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(data?.error || "Kunde inte hämta meddelanden.");
      }

      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kunde inte hämta meddelanden."
      );
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
      setError(err instanceof Error ? err.message : "Kunde inte skapa ny chatt.");
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
      setError(err instanceof Error ? err.message : "Kunde inte radera chatten.");
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

    const payload = {
      message: cleanMessage,
      ...(learningContext ? { learningContext } : {}),
    };

    try {
      const response = await fetch(
        `${API_BASE}/api/ai/threads/${threadId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await safeJson(response);

      if (!response.ok) {
        throw new Error(
          data?.error || "AI-assistenten kunde inte svara just nu.",
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

  function handleCloseChat() {
    if (onClose) {
      onClose();
      return;
    }

    router.back();
  }

  function handleOpenSettings() {
    if (onClose) {
      onClose();
    }

    router.push("/profile/settings");
  }

  function useSuggestion(text: string) {
    setMessageInput(text);
  }

  useEffect(() => {
    if (session) {
      fetchThreads();
    }
  }, [session]);

  useEffect(() => {
    if (activeThreadId) {
      fetchMessages(activeThreadId);
    }
  }, [activeThreadId]);

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
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm"
      }
    >
      <div
        className={
          isEmbedded
            ? "relative flex h-full w-full overflow-hidden bg-background"
            : "relative flex h-[92vh] w-full max-w-7xl overflow-hidden rounded-[34px] border border-border bg-background shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
        }
      >
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}

        <aside
          className={`fixed left-0 top-0 z-50 flex h-full w-[82%] max-w-77 flex-col border-r border-border bg-card p-5 transition duration-300 lg:static lg:z-auto lg:h-auto lg:w-[320px] lg:max-w-none lg:translate-x-0 lg:p-6 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
        >
          <div className="border-b border-border px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <AiRobotIcon size="md" />

                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-foreground">
                    AI-assistent
                  </h2>

                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    Online • Svarar direkt
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-foreground transition hover:bg-secondary lg:hidden"
                aria-label="Stäng meny"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={createThread}
              disabled={creatingThread}
              className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B3FF2] text-sm font-bold text-white shadow-lg shadow-[#5B3FF2]/25 transition hover:scale-[1.02] hover:bg-[#4F35DE] disabled:opacity-50"
            >
              <Plus size={20} />
              Ny AI-chatt
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
              Senaste chattar
            </p>

            <div className="space-y-2">
              {loadingThreads ? (
                <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Laddar tidigare chattar...
                </div>
              ) : threads.length === 0 ? (
                <div className="rounded-3xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  Ingen tidigare AI-chatt än.
                </div>
              ) : (
                threads.map((thread) => {
                  const isActive = activeThreadId === thread.id;

                  return (
                    <div
                      key={thread.id}
                      className={`group flex items-center gap-2 rounded-2xl px-2 py-2 transition ${isActive ? "bg-secondary" : "hover:bg-secondary/70"
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectThread(thread.id)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-background text-muted-foreground shadow-sm dark:bg-white/10">
                          <MessageCircle size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-foreground">
                            {thread.title}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            {formatDateTime(thread.updatedAt)}
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteThread(thread.id)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-100 transition hover:bg-red-500/10 hover:text-red-500 lg:opacity-0 lg:group-hover:opacity-100"
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

                    <div className="border-t border-border p-4">
            <button
              type="button"
              onClick={handleOpenSettings}
              className="flex w-full items-center justify-between rounded-[24px] border border-border bg-background p-4 transition hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE9FF] text-[#5B3FF2] dark:bg-white/10 dark:text-[#A78BFA]">
                  <Settings size={20} />
                </div>

                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">
                    Inställningar
                  </p>

                  <p className="text-xs text-muted-foreground">
                    Gå till dina inställningar
                  </p>
                </div>
              </div>

              <ChevronRight className="text-muted-foreground" size={20} />
            </button>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-background">
          <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-border px-5 lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-foreground transition hover:bg-secondary lg:hidden"
              aria-label="Öppna meny"
            >
              <Menu size={23} />
            </button>

            <div className="hidden w-10 lg:block" />

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="text-[#5B3FF2] dark:text-[#A78BFA]" size={20} />

                <h1 className="text-xl font-bold text-foreground">
                  AI-chat
                </h1>
              </div>

              <p className="mt-1 text-sm text-muted-foreground">
                Din personliga studieassistent
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={createThread}
                disabled={creatingThread}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEE9FF] text-[#5B3FF2] shadow-sm transition hover:scale-105 hover:bg-[#E4DBFF] disabled:opacity-50 dark:bg-[#5B3FF2]/25 dark:text-white dark:hover:bg-[#5B3FF2]/35"
                title="Ny AI-chatt"
              >
                <Plus size={24} />
              </button>

              <button
                type="button"
                onClick={handleCloseChat}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background text-foreground transition hover:bg-secondary"
                title="Stäng"
              >
                <X size={22} />
              </button>
            </div>
          </header>

          {error && (
            <div className="mx-5 mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
              {error}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-5 py-6 lg:px-10">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Laddar meddelanden...
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-4xl text-center">
                  <div className="mx-auto flex justify-center">
                    <div className="scale-75 md:scale-100">
                      <AiRobotIcon size="lg" />
                    </div>
                  </div>

                  <h2 className="mt-4 text-[24px] font-extrabold tracking-tight text-foreground md:mt-8 md:text-4xl">
                    Hur kan jag hjälpa dig?
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
                    Skriv din fråga så hjälper jag dig på bästa sätt.
                  </p>

                  <div className="mx-auto mt-5 grid max-w-4xl gap-4 text-left md:mt-8 md:grid-cols-3 md:gap-4">
                    {suggestions.map((item) => {
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.title}
                          type="button"
                          onClick={() => useSuggestion(item.prompt)}
                          className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm transition hover:bg-secondary  md:rounded-3xl md:p-5"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#EEE9FF] text-[#5B3FF2] transition group-hover:scale-105 dark:bg-white/10 dark:text-[#A78BFA]">
                            <Icon size={26} />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role === "assistant" && (
                      <AiRobotIcon size="sm" />
                    )}

                    <div
                      className={`max-w-[88%] whitespace-pre-wrap rounded-[24px] px-4 py-3 text-left text-[15px] leading-7 shadow-sm md:max-w-[75%] ${message.role === "user"
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
                    <AiRobotIcon size="sm" />

                    <div className="rounded-[24px] border border-border bg-card px-5 py-3.5 text-left text-[15px] text-muted-foreground shadow-sm">
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
            <div className="mx-auto flex max-w-3xl items-center gap-2 rounded-3xl border border-border bg-card px-3 py-3 shadow-sm">
              <textarea
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Skriv din fråga här..."
                rows={1}
                className="flex justify-center max-h-32 min-h-[24px] flex-1 resize-none bg-transparent px-2 text-left text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending || !messageInput.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#5B3FF2] text-white shadow-lg shadow-[#5B3FF2]/20 transition hover:scale-105 hover:bg-[#4F35DE] disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}