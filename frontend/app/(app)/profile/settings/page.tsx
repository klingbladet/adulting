"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { BACKEND_URL } from "@/lib/backend-url";
import { authClient } from "@/lib/auth-client";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type ProfileResponse = {
  user: ProfileUser;
};

type NotificationSettings = {
  push: boolean;
  email: boolean;
  progress: boolean;
};

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  push: true,
  email: false,
  progress: true,
};

function firstLetter(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

function getStoredNotifications() {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;

  const stored = localStorage.getItem("profile-notifications");
  if (!stored) return DEFAULT_NOTIFICATIONS;

  try {
    return JSON.parse(stored) as NotificationSettings;
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    setNotifications(getStoredNotifications());

    const savedTheme = localStorage.getItem("app-theme");

    if (savedTheme === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("app-theme", "light");
    }

    async function fetchProfile() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          setProfile(null);
          return;
        }

        const data: ProfileResponse = await response.json();
        setProfile(data);
      } catch (error) {
        console.error("SETTINGS PROFILE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  function toggleTheme() {
    const newTheme = theme === "dark" ? "light" : "dark";

    setTheme(newTheme);
    localStorage.setItem("app-theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  function updateNotification(key: keyof NotificationSettings) {
    setNotifications((current) => {
      const updated = {
        ...current,
        [key]: !current[key],
      };

      localStorage.setItem("profile-notifications", JSON.stringify(updated));
      return updated;
    });
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);

      localStorage.setItem("app-theme", "light");
      document.documentElement.classList.remove("dark");

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/profile";
          },
        },
      });
    } catch (error) {
      console.error("LOGOUT ERROR:", error);
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] dark:bg-black">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Laddar inställningar...
        </p>
      </main>
    );
  }

  const user = profile?.user;

  return (
    <>
      <main className="min-h-dvh bg-[#F8FAFC] text-gray-950 dark:bg-black dark:text-white">
        <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white dark:bg-black md:max-w-5xl md:bg-transparent md:px-8 md:py-8">
          <header className="shrink-0 px-4 pb-3 pt-4 md:rounded-[32px] md:bg-white md:p-6 md:shadow-sm md:dark:bg-zinc-950">
            <div className="flex items-center justify-between">
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-700 dark:bg-zinc-900 dark:text-white"
              >
                <ChevronLeft size={20} />
              </Link>

              <h1 className="text-lg font-bold">Inställningar</h1>

              <div className="h-9 w-9" />
            </div>

            <Link
              href="/profile/settings/account"
              className="mt-4 flex items-center gap-3 rounded-3xl bg-[#EAF7FF] p-3 shadow-sm dark:bg-[#0D2B49]"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-xl font-bold text-white">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  firstLetter(user?.name)
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {user?.name ?? "Användare"}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-300">
                  {user?.email ?? "Ingen e-post"}
                </p>
              </div>

              <ChevronRight size={17} className="text-gray-400" />
            </Link>
          </header>

          <div className="mx-auto w-full max-w-5xl flex-1 pb-28 pt-4 md:grid md:grid-cols-2 md:gap-6 md:pb-8">
            <SettingsSection title="Konto">
              <SettingsRow
                icon="👤"
                title="Namn och e-post"
                description="Uppdatera profil"
                href="/profile/settings/account"
              />

              <SettingsRow
                icon="🔑"
                title="Lösenord"
                description="Byt lösenord"
                href="/profile/settings/password"
              />

              <SettingsRow
                icon="🌍"
                title="Språk"
                description="Svenska"
                href="/profile/settings/language"
              />

              <ToggleRow
                icon={theme === "dark" ? "🌙" : "☀️"}
                title={theme === "dark" ? "Mörkt tema" : "Ljust tema"}
                description={
                  theme === "dark"
                    ? "Mörk bakgrund och ljus text"
                    : "Ljus bakgrund och mörk text"
                }
                checked={theme === "dark"}
                onChange={toggleTheme}
              />
            </SettingsSection>

            <SettingsSection title="Notifikationer">
              <ToggleRow
                icon="🔔"
                title="Push-notifikationer"
                description="Påminnelser om kurser"
                checked={notifications.push}
                onChange={() => updateNotification("push")}
              />

              <ToggleRow
                icon="📩"
                title="E-postnotifikationer"
                description="Veckovisa sammanfattningar"
                checked={notifications.email}
                onChange={() => updateNotification("email")}
              />

              <ToggleRow
                icon="🎯"
                title="Framstegspåminnelser"
                description="Dagliga tips och uppmuntran"
                checked={notifications.progress}
                onChange={() => updateNotification("progress")}
              />
            </SettingsSection>

            <SettingsSection title="Integritet & säkerhet">
              <SettingsRow
                icon="🔒"
                title="Integritetspolicy"
                description="Hur data hanteras"
                href="/profile/settings/privacy"
              />

              <SettingsRow
                icon="📋"
                title="GDPR & dina rättigheter"
                description="Dina rättigheter"
                href="/profile/settings/gdpr"
              />

              <SettingsRow
                icon="🗑️"
                title="Radera mitt konto"
                description="Ta bort konto"
                href="/profile/settings/delete-account"
                danger
              />
            </SettingsSection>

            <SettingsSection title="Hjälp & om oss">
              <SettingsRow
                icon="❗"
                title="Hjälpcenter"
                description="Vanliga frågor"
                href="/profile/settings/help"
              />

              <SettingsRow
                icon="☎️"
                title="Kontakta oss"
                description="Skicka meddelande"
                href="/profile/settings/contact"
              />

              <SettingsRow
                icon="👾"
                title="Om teamet"
                description="Vilka vi är"
                href="/profile/settings/about"
              />
            </SettingsSection>

            <div className="px-4 pb-6 pt-5 md:col-span-2 md:flex md:justify-center">
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F1F5F9] text-sm font-bold text-gray-700 dark:bg-zinc-900 dark:text-white md:max-w-sm"
              >
                <LogOut size={18} />
                Logga ut
              </button>
            </div>
          </div>
        </section>
      </main>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-5 shadow-xl dark:bg-zinc-900 dark:text-white">
            <h2 className="text-lg font-bold">Logga ut?</h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
              Är du säker på att du vill logga ut från ditt konto?
            </p>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="h-12 flex-1 rounded-2xl bg-[#F1F5F9] text-sm font-bold text-gray-700 dark:bg-zinc-800 dark:text-white"
              >
                Avbryt
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="h-12 flex-1 rounded-2xl bg-[#2563EB] text-sm font-bold text-white disabled:opacity-60"
              >
                {loggingOut ? "Loggar ut..." : "Logga ut"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden md:rounded-[28px] md:bg-white md:shadow-sm md:dark:bg-zinc-950">
      <div className="bg-[#F1F5F9] px-4 py-2 dark:bg-zinc-900">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-gray-100 bg-white dark:divide-zinc-800 dark:bg-black md:dark:bg-zinc-950">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon,
  title,
  description,
  href,
  danger = false,
}: {
  icon: string;
  title: string;
  description: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-6 text-lg">{icon}</span>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold leading-4 ${
            danger ? "text-red-500" : "text-gray-900 dark:text-white"
          }`}
        >
          {title}
        </p>

        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <ChevronRight size={16} className="text-gray-400" />
    </Link>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span className="w-6 text-lg">{icon}</span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-4 text-gray-900 dark:text-white">
          {title}
        </p>

        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-7 w-12 rounded-full transition ${
          checked ? "bg-[#2563EB]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}