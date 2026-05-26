"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, ChevronLeft } from "lucide-react";
import { BACKEND_URL } from "@/lib/backend-url";
import getCourseIcon from "@/components/courses/course-dynamic-icon";

type Filter = "alla" | "pagaende" | "klart" | "sparade";

type ProfileCourse = {
  id: string;
  title: string;
  status: string;
  progress: number;
  totalSteps: number;
  completedSteps: number;
  category?: {
    name?: string;
    iconName?: string | null;
  } | null;
};

type ProfileResponse = {
  courses: ProfileCourse[];
};

function normalizeStatus(status: string): Filter {
  if (status === "in_progress") return "pagaende";
  if (status === "completed") return "klart";
  return "sparade";
}

export default function ProfileCoursesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("alla");
  const [courses, setCourses] = useState<ProfileCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch(`${BACKEND_URL}/api/profile/me`, {
          credentials: "include",
        });

        if (!response.ok) return;

        const data: ProfileResponse = await response.json();
        setCourses(data.courses ?? []);
      } catch (error) {
        console.error("PROFILE COURSES ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  const filteredCourses =
    activeFilter === "alla"
      ? courses
      : courses.filter((course) => normalizeStatus(course.status) === activeFilter);

  const tabs: { label: string; value: Filter }[] = [
    { label: "Alla", value: "alla" },
    { label: "Pågående", value: "pagaende" },
    { label: "Klart", value: "klart" },
    { label: "Sparade", value: "sparade" },
  ];

  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-gray-950 dark:bg-black dark:text-white">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] bg-white px-4 pb-28 pt-6 dark:bg-black md:max-w-5xl md:bg-transparent md:px-8 md:py-8">
        <div className="mx-auto w-full max-w-3xl rounded-none bg-white dark:bg-black md:rounded-[32px] md:p-8 md:shadow-sm md:dark:bg-zinc-950">
          <header className="mb-6 flex items-center justify-between">
            <Link href="/profile" className="text-[#2563EB] dark:text-blue-400">
              <ChevronLeft size={26} />
            </Link>

            <Bell size={22} />
          </header>

          <h1 className="text-2xl font-bold">Mina kurser</h1>

          <div className="mt-5 flex gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={`h-9 rounded-full px-5 text-sm font-bold ${
                  activeFilter === tab.value
                    ? "bg-[#2563EB] text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-zinc-900 dark:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {loading ? (
              <p className="pt-8 text-sm italic text-gray-500 dark:text-gray-400">
                Laddar kurser...
              </p>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex min-h-[86px] items-center gap-4 rounded-2xl bg-[#0E4A73] p-3 text-white shadow-sm"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                    {getCourseIcon(course)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="truncate text-base font-bold">
                        {course.title}
                      </h2>
                      <span className="text-xs font-bold">
                        {course.progress}%
                      </span>
                    </div>

                    <div className="mt-4 h-1.5 rounded-full bg-white/35">
                      <div
                        className="h-1.5 rounded-full bg-white"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="pt-8 text-sm italic text-gray-500 dark:text-gray-400">
                Inga kurser i denna kategori ännu.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}