"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  Settings,
  Trophy,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/backend-url";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

type ProfileCourse = {
  id: string;
  title: string;
  description?: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
};

type ProfileResponse = {
  user: ProfileUser;
  stats: {
    startedCourses: number;
    completedCourses: number;
  };
  courses: ProfileCourse[];
  badges: {
    id: string;
    title: string;
  }[];
};

function getFirstLetter(name?: string) {
  return name?.trim()?.charAt(0)?.toUpperCase() || "U";
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/profile/me`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Could not fetch profile");
        }

        const data: ProfileResponse =
          await response.json();

        setProfile(data);
      } catch (error) {
        console.error("PROFILE ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC]">
        <p className="text-sm text-gray-500">
          Laddar profil...
        </p>
      </main>
    );
  }

  const user = profile?.user;
  const courses = profile?.courses ?? [];
  const badges = profile?.badges ?? [];

  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-gray-950">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] bg-white">
        
        <header className="rounded-b-[34px] bg-[#EAF7FF] px-5 pb-7 pt-5">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-600"
            >
              <ChevronLeft size={22} />
            </Link>

            <Link
              href="/profile/settings"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-gray-600"
            >
              <Settings size={22} />
            </Link>
          </div>

          <div className="mt-4 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-3xl font-bold text-white">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                getFirstLetter(user?.name)
              )}
            </div>

            <h1 className="mt-3 text-xl font-bold">
              {user?.name ?? "Användare"}
            </h1>

            <p className="text-sm text-gray-500">
              {user?.email ?? "Ingen e-post"}
            </p>

            <Link
              href="/profile/settings"
              className="mt-1 text-sm font-semibold text-[#2563EB]"
            >
              Ändra profil →
            </Link>
          </div>
        </header>

        
        <div className="-mt-5 px-5">
          <div className="grid grid-cols-2 rounded-[28px] bg-white px-6 py-4 text-center shadow-sm ring-1 ring-black/5">
            <div>
              <p className="text-2xl font-bold text-[#2563EB]">
                {profile?.stats.startedCourses ?? 0}
              </p>

              <p className="text-xs text-gray-500">
                Påbörjade
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {profile?.stats.completedCourses ?? 0}
              </p>

              <p className="text-xs text-gray-500">
                Klara
              </p>
            </div>
          </div>
        </div>

        
        <section className="px-5 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Mina kurser
            </h2>

            <Link
              href="/courses"
              className="text-sm font-semibold text-[#2563EB]"
            >
              Se alla →
            </Link>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-2xl bg-[#EAF7FF] p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {course.title}
                      </h3>

                      <p className="text-xs text-gray-500">
                        {course.completedSteps} av{" "}
                        {course.totalSteps} steg
                      </p>
                    </div>

                    <p className="font-bold text-gray-800">
                      {course.progress}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-[#2563EB]"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#EAF7FF] p-5 text-center">
              <BookOpen
                className="mx-auto text-[#2563EB]"
                size={28}
              />

              <p className="mt-2 text-sm font-semibold">
                Inga kurser ännu
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Dina kurser visas här när du
                börjar en kurs.
              </p>
            </div>
          )}
        </section>

        
        <section className="px-5 pt-7 pb-24">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Mina badges
              </h2>

              <p className="text-xs text-gray-500">
                Lås upp badges genom att
                slutföra kurser
              </p>
            </div>

            <Link
              href="/profile/badges"
              className="text-sm font-semibold text-[#2563EB]"
            >
              Se alla →
            </Link>
          </div>

          {badges.length > 0 ? (
            <div className="flex gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7FF] text-[#2563EB]"
                >
                  <Trophy size={26} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[#F8FAFC] p-5 text-center">
              <Trophy
                className="mx-auto text-gray-400"
                size={28}
              />

              <p className="mt-2 text-sm font-semibold">
                Inga badges ännu
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Badges visas här när du gör
                framsteg.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}