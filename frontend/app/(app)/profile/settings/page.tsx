"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Shield,
  Trash2,
  User,
  Users,
} from "lucide-react";
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

function firstLetter(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Could not fetch profile");
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

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/auth";
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
      <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-gray-500">Laddar inställningar...</p>
      </main>
    );
  }

  const user = profile?.user;

  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-gray-950">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] bg-white">
        <header className="px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <Link
              href="/profile"
              aria-label="Tillbaka"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-700"
            >
              <ChevronLeft size={20} />
            </Link>

            <h1 className="text-lg font-bold">Inställningar</h1>

            <div className="h-8 w-8" />
          </div>

          <Link
            href="/profile/settings/account"
            className="mt-4 flex items-center gap-3 rounded-3xl bg-[#EAF7FF] p-3 shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-lg font-bold text-white">
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
              <p className="truncate text-xs text-gray-500">
                {user?.email ?? "Ingen e-post"}
              </p>
            </div>

            <ChevronRight size={17} className="text-gray-400" />
          </Link>
        </header>

        <SettingsSection title="Konto">
          <SettingsRow
            icon={<User size={18} />}
            title="Namn och e-post"
            description="Uppdatera profil"
            href="/profile/settings/account"
          />

          <SettingsRow
            icon={<Lock size={18} />}
            title="Lösenord"
            description="Byt lösenord"
            href="/profile/settings/password"
          />

          <SettingsRow
            icon={<Globe size={18} />}
            title="Språk"
            description="Svenska"
            href="/profile/settings/language"
          />

          <SettingsRow
            icon={<Calendar size={18} />}
            title="Födelsedatum"
            description="Lägg till datum"
            href="/profile/settings/birthdate"
          />
        </SettingsSection>

        <SettingsSection title="Notifikationer">
          <ToggleRow
            icon={<Bell size={18} />}
            title="Push"
            description="Kurspåminnelser"
            defaultChecked
          />

          <ToggleRow
            icon={<Mail size={18} />}
            title="E-post"
            description="Sammanfattningar"
          />

          <ToggleRow
            icon={<MessageCircle size={18} />}
            title="Framsteg"
            description="Tips och motivation"
            defaultChecked
          />
        </SettingsSection>

        <SettingsSection title="Integritet & säkerhet">
          <SettingsRow
            icon={<Shield size={18} />}
            title="Integritetspolicy"
            description="Hur data hanteras"
            href="/profile/settings/privacy"
          />

          <SettingsRow
            icon={<Shield size={18} />}
            title="GDPR"
            description="Dina rättigheter"
            href="/profile/settings/gdpr"
          />

          <SettingsRow
            icon={<Trash2 size={18} />}
            title="Radera konto"
            description="Ta bort konto"
            href="/profile/settings/delete-account"
            danger
          />
        </SettingsSection>

        <SettingsSection title="Hjälp & om oss">
          <SettingsRow
            icon={<HelpCircle size={18} />}
            title="Hjälpcenter"
            description="Vanliga frågor"
            href="/profile/settings/help"
          />

          <SettingsRow
            icon={<Mail size={18} />}
            title="Kontakta oss"
            description="Skicka meddelande"
            href="/profile/settings/contact"
          />

          <SettingsRow
            icon={<Users size={18} />}
            title="Om teamet"
            description="Vilka vi är"
            href="/profile/settings/about"
          />
        </SettingsSection>

        <div className="px-4 pb-6 pt-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#F1F5F9] text-sm font-bold text-gray-700 disabled:opacity-60"
          >
            <LogOut size={18} />
            {loggingOut ? "Loggar ut..." : "Logga ut"}
          </button>
        </div>
      </section>
    </main>
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
    <section>
      <div className="bg-[#F1F5F9] px-4 py-1.5">
        <h2 className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-gray-100 bg-white px-4">{children}</div>
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
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 py-2.5">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl ${
          danger ? "bg-red-50 text-red-500" : "bg-[#F8FAFC] text-[#2563EB]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold leading-4 ${
            danger ? "text-red-500" : "text-gray-900"
          }`}
        >
          {title}
        </p>
        <p className="truncate text-xs text-gray-500">{description}</p>
      </div>

      <ChevronRight size={16} className="text-gray-400" />
    </Link>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  defaultChecked = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F8FAFC] text-[#2563EB]">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-4 text-gray-900">{title}</p>
        <p className="truncate text-xs text-gray-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => setChecked((value) => !value)}
        className={`relative h-6 w-11 rounded-full transition ${
          checked ? "bg-[#2563EB]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}