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
import { SERVER_BACKEND_URL } from "@/lib/backend-url";
import { authClient } from "@/lib/auth-client";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type ProfileCourse = {
  id: string;
  title: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  image?: string | null;
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
        const response = await fetch(`${SERVER_BACKEND_URL}/api/profile/me`, {
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
      callbackURL: "/profile",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-gray-500">Laddar profil...</p>
      </main>
    );
  }

  const isLoggedIn = Boolean(profile?.user);

  return (
    <>
      <main className="min-h-dvh overflow-hidden bg-[#F8FAFC] text-gray-950">
        <section className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-white">
          <header className="bg-[#EAF7FF] px-5 pb-5 pt-4">
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#2563EB]"
                aria-label="Tillbaka"
              >
                <ArrowLeft size={20} />
              </Link>

              <Link
                href="/profile/settings"
                className="flex flex-col items-center text-[#2563EB]"
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

      <p className="text-xs text-gray-500">{user.email}</p>

      <div className="mx-auto mt-5 flex w-[230px] items-center justify-between text-center">
        <div className="flex-1">
          <p className="text-2xl font-bold text-[#2563EB]">
            {profile.stats.startedCourses}
          </p>
          <p className="text-xs text-gray-500">Pågående</p>
        </div>

        <div className="h-12 w-px bg-gray-300" />

        <div className="flex-1">
          <p className="text-2xl font-bold text-[#7C8A22]">
            {profile.stats.completedCourses}
          </p>
          <p className="text-xs text-gray-500">Klara</p>
        </div>
      </div>
    </div>
  );
}

function GuestHeader() {
  return (
    <div className="mt-7 flex flex-col items-center text-center">
      <div className="flex h-[92px] w-[92px] items-center justify-center rounded-full bg-white shadow-sm ring-4 ring-white">
        <User size={50} className="text-[#2563EB]" />
      </div>

      <h1 className="mt-4 text-2xl font-bold">Hej!</h1>

      <p className="mt-1 text-lg font-bold">Logga in för att komma igång</p>
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
    <div className="flex-1 px-5 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Mina kurser</h2>

        <Link
          href="/courses"
          className="flex items-center gap-1 text-sm font-bold text-[#2563EB]"
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
        <div className="rounded-3xl bg-[#EAF7FF] p-4 text-center">
          <BookOpen className="mx-auto text-[#2563EB]" size={26} />
          <p className="mt-2 text-sm font-bold">Inga kurser ännu</p>
          <p className="mt-1 text-xs text-gray-500">
            Dina kurser visas här när du börjar.
          </p>
        </div>
      )}

      <section className="mt-6">
        <h2 className="text-lg font-bold">Mina badges</h2>
        <p className="text-xs text-gray-500">
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
    <div className="flex flex-1 flex-col justify-center px-7 pb-24">
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

function CourseCard({ course }: { course: ProfileCourse }) {
  const progress = safeProgress(course.progress);

  return (
    <Link
      href={`/courses/${course.id}`}
      className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-[#EAF7FF] px-3 py-2.5 shadow-sm"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-300 bg-white">
        {course.image ? (
          <img
            src={course.image}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <BookOpen className="text-[#2563EB]" size={26} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-sm font-bold">{course.title}</h3>
          <p className="text-xs font-bold">{progress}%</p>
        </div>

        <p className="mt-0.5 text-[11px] text-gray-500">
          {course.completedSteps} av {course.totalSteps} steg
        </p>

        <div className="mt-2 h-1.5 rounded-full bg-white">
          <div
            className="h-1.5 rounded-full bg-[#2563EB]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function BadgeItem({ badge }: { badge: ProfileBadge }) {
  const unlocked = badge.unlocked ?? true;

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border bg-white ${
          unlocked ? "border-[#7C8A22]" : "border-gray-300 opacity-50 grayscale"
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
      <div className="flex h-24 w-24 items-center justify-center rounded-full border border-gray-300 bg-gray-100 opacity-60">
        <Lock className="text-gray-400" size={30} />
      </div>

      <p className="mt-2 text-sm font-bold text-gray-500">{title}</p>
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-[430px] rounded-t-[34px] bg-white px-6 pb-7 pt-5 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold">Välj hur du vill fortsätta</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1F5F9]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onGoogle}
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm"
          >
            <span className="text-xl">G</span>
            Fortsätt med Google
          </button>

          <Link
            href="/auth"
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm"
          >
            <span className="text-xl"></span>
            Fortsätt med Apple
          </Link>

          <Link
            href="/sign-in"
            className="flex w-full items-center gap-4 rounded-2xl bg-[#F8FAFC] px-4 py-4 text-left text-sm font-bold shadow-sm"
          >
            <Mail size={20} />
            Fortsätt med e-post
          </Link>
        </div>
      </div>
    </div>
  );
}