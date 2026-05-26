"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Lock,
  Mail,
  Settings,
  User,
  X,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/backend-url";
import { authClient } from "@/lib/auth-client";
import getCourseIcon from "@/components/courses/course-dynamic-icon";
import CourseCard from "@/components/courses/course-card";
import type { ProfileCourse } from "@/components/courses/course-card";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type ProfileBadge = {
  id: string;
  title: string;
  image?: string | null;
  unlocked?: boolean;
};

type ProfileResponse = {
  user: ProfileUser | null;
  stats: {
    startedCourses: number;
    completedCourses: number;
  };
  courses: ProfileCourse[];
  badges: ProfileBadge[];
};

function getFirstLetter(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "O";
}

function safeProgress(progress: number) {
  return Math.min(Math.max(progress, 0), 100);
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function getProfile() {
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
        console.error("PROFILE ERROR:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  async function handleGoogleLogin() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${window.location.origin}/profile`,
    });
  }

  if (loading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#F8FAFC] dark:bg-[#0B1120]">
        <p className="text-sm text-gray-500 dark:text-gray-300">
          Laddar profil...
        </p>
      </main>
    );
  }

  const isLoggedIn = Boolean(profile?.user);

  return (
    <>
      <main className="h-dvh overflow-hidden bg-[#F8FAFC] text-gray-950 dark:bg-[#0B1120] dark:text-white">
        <section className="mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white dark:bg-[#07111F]">
          <header className="shrink-0 bg-[#EAF7FF] px-5 pb-5 pt-4 dark:bg-[#0E3A5F]">
            <div className="flex items-center justify-between">
              <Link
                href="/learn"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#2563EB] dark:bg-white/15 dark:text-white"
                aria-label="Tillbaka"
              >
                <ArrowLeft size={20} />
              </Link>

              <Link
                href="/profile/settings"
                className="flex flex-col items-center text-[#2563EB] dark:text-white"
              >
                <Settings size={25} />
                <span className="mt-0.5 text-[11px] font-semibold">
                  Inställningar
                </span>
              </Link>
            </div>

            {isLoggedIn && profile?.user ? (
              <LoggedInHeader profile={profile} />
            ) : (
              <GuestHeader />
            )}
          </header>

          {isLoggedIn && profile ? (
            <ProfileContent
              courses={profile.courses ?? []}
              badges={profile.badges ?? []}
            />
          ) : (
            <GuestContent onLoginClick={() => setShowLogin(true)} />
          )}
        </section>
      </main>

      {showLogin && (
        <LoginBottomSheet
          onClose={() => setShowLogin(false)}
          onGoogle={handleGoogleLogin}
        />
      )}
    </>
  );
}

function LoggedInHeader({ profile }: { profile: ProfileResponse }) {
  const user = profile.user;
  if (!user) return null;

  return (
    <div className="mt-3 text-center">
      <div className="mx-auto flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full border-[5px] border-white bg-[#2563EB] text-3xl font-bold text-white shadow-sm">
        {user.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="h-full w-full object-cover"
          />
        ) : (
          getFirstLetter(user.name)
        )}
      </div>

      <h1 className="mt-3 text-2xl font-bold">{user.name}</h1>

      <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>

      <div className="mx-auto mt-5 flex w-[230px] items-center justify-between text-center">
        <div className="flex-1">
          <p className="text-2xl font-bold text-[#2563EB] dark:text-blue-300">
            {profile.stats.startedCourses}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300">Pågående</p>
        </div>

        <div className="h-12 w-px bg-gray-300 dark:bg-white/30" />

        <div className="flex-1">
          <p className="text-2xl font-bold text-[#7C8A22] dark:text-lime-300">
            {profile.stats.completedCourses}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-300">Klara</p>
        </div>
      </div>
    </div>
  );
}

function GuestHeader() {
  return (
    <div className="mt-6 flex flex-col items-center text-center">
      <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white dark:bg-white/10 dark:ring-white/10">
        <User size={54} className="text-[#2563EB] dark:text-white" />
      </div>

      <h1 className="mt-4 text-[34px] font-bold">Hej!</h1>

      <p className="mt-1 text-lg font-semibold">
        Logga in för att komma igång
      </p>
    </div>
  );
}

function ProfileContent({
  courses,
  badges,
}: {
  courses: ProfileCourse[];
  badges: ProfileBadge[];
}) {
  return (
    <div className="flex-1 overflow-y-auto px-5 pb-28 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Mina kurser</h2>

        <Link
          href="/profile/courses"
          className="flex items-center gap-1 text-sm font-bold text-[#2563EB] dark:text-blue-300"
        >
          Se alla <ChevronRight size={16} />
        </Link>
      </div>

      {courses.length > 0 ? (
        <div className="space-y-2.5">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-[#EAF7FF] p-4 text-center dark:bg-white/10">
          <BookOpen
            className="mx-auto text-[#2563EB] dark:text-blue-300"
            size={26}
          />
          <p className="mt-2 text-sm font-bold">Inga kurser ännu</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
            Dina kurser visas här när du börjar.
          </p>
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-bold">Mina badges</h2>
        <p className="text-xs text-gray-500 dark:text-gray-300">
          Lås upp badges genom att slutföra kurser
        </p>

        {badges.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-4">
            {badges.slice(0, 3).map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-5">
            <LockedBadge title="Boende" />
            <LockedBadge title="Körkort" />
          </div>
        )}
      </section>
    </div>
  );
}

function GuestContent({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center overflow-hidden px-7 pb-28">
      <button
        type="button"
        onClick={onLoginClick}
        className="h-14 rounded-2xl bg-[#2563EB] text-base font-bold text-white shadow-sm"
      >
        Skapa konto / Logga in
      </button>

      <ul className="mx-auto mt-12 space-y-2 text-sm font-semibold">
        <li>• Spara dina framsteg</li>
        <li>• Fortsätta där du slutade</li>
        <li>• Få personliga rekommendationer</li>
      </ul>
    </div>
  );
}


function BadgeItem({ badge }: { badge: ProfileBadge }) {
  const unlocked = badge.unlocked ?? true;

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-white ${unlocked ? "border-[#7C8A22]" : "border-gray-300 opacity-50 grayscale"
          }`}
      >
        {badge.image ? (
          <img
            src={badge.image}
            alt={badge.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Lock className="text-gray-400" size={26} />
        )}
      </div>

      <p className="mt-2 text-sm font-bold">{badge.title}</p>
    </div>
  );
}

function LockedBadge({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-300 bg-gray-100 opacity-60 dark:bg-white/10">
        <Lock className="text-gray-400" size={30} />
      </div>

      <p className="mt-2 text-sm font-bold text-gray-500 dark:text-gray-300">
        {title}
      </p>
    </div>
  );
}

function LoginBottomSheet({
  onClose,
  onGoogle,
}: {
  onClose: () => void;
  onGoogle: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="mb-[88px] w-full max-w-[430px] rounded-t-[36px] bg-white px-6 pb-6 pt-6 text-gray-950 shadow-2xl dark:bg-[#111827] dark:text-white">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Välj hur du vill fortsätta</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onGoogle}
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm dark:bg-white/10"
          >
            <span className="text-xl">G</span>
            Fortsätt med Google
          </button>

          <Link
            href="/auth"
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm dark:bg-white/10"
          >
            <span className="text-xl"></span>
            Fortsätt med Apple
          </Link>

          <Link
            href="/sign-in"
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm dark:bg-white/10"
          >
            <Mail size={20} />
            Fortsätt med e-post
          </Link>
        </div>
      </div>
    </div>
  );
}