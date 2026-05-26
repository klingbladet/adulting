"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { BACKEND_URL } from "@/lib/backend-url";
import CourseCard, { type ProfileCourse as CardProfileCourse } from "@/components/courses/course-card";

type Filter = "alla" | "pagaende" | "klart" | "sparade";

type ProfileCourse = CardProfileCourse & {
  status: string;
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
    <main className="min-h-dvh">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] px-4 pb-28 pt-6 bg-background">
        <header className="mb-6 flex items-center justify-between">
          <Link href="/profile" className="text-[#2563EB] dark:text-blue-400">
            <ChevronLeft size={26} />
          </Link>
        </header>

        <h1 className="text-2xl font-bold">Mina kurser</h1>

        <div className="mt-5 flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveFilter(tab.value)}
              className={`h-9 rounded-full px-5 text-sm font-bold ${activeFilter === tab.value
                ? "bg-button text-primary-foreground"
                : "bg-muted text-foreground"
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
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <p className="pt-8 text-sm italic text-gray-500 dark:text-gray-400">
              Inga kurser i denna kategori ännu.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}