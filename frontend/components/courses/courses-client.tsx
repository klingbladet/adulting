'use client';

import { useState } from 'react';
import Link from 'next/link';
import getCourseIcon from '@/components/courses/course-dynamic-icon';
import { Course, UserCourse } from '@/types/types';

type CourseWithPublishStatus = Course & {
  isPublished?: boolean;
  userCourses?: UserCourse[];
  enrollments?: UserCourse[];
};

const CATEGORY_FILTERS = [
  { label: 'körkort', colorClass: 'bg-category-one text-category-one-text' },
  { label: 'bostad', colorClass: 'bg-category-two text-category-two-text' },
  { label: 'ekonomi', colorClass: 'bg-border text-foreground' },
  { label: 'jobb', colorClass: 'bg-category-three text-category-three-text' },
];

function matchesCategory(course: CourseWithPublishStatus, key: string): boolean {
  const name = course.category?.name?.toLowerCase() ?? '';
  const title = course.title?.toLowerCase() ?? '';
  return name.includes(key) || title.includes(key);
}

interface CoursesClientProps {
  courses: CourseWithPublishStatus[];
  totalEnrolled: number;
  completedCourses: number;
}

export default function CoursesClient({ courses, totalEnrolled, completedCourses }: CoursesClientProps) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggleFilter(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  }

  const visibleCourses =
    selected.length === 0
      ? courses
      : courses.filter((c) => selected.some((key) => matchesCategory(c, key)));

  return (
    <>
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORY_FILTERS.map((f) => {
          const isActive = selected.includes(f.label);
          return (
            <button
              key={f.label}
              onClick={() => toggleFilter(f.label)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold ${f.colorClass} ${isActive ? 'ring-2 ring-foreground/40' : 'opacity-70'}`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Course grid */}
      {visibleCourses.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {visibleCourses.map((course: CourseWithPublishStatus) => {
            const enrollment =
              course.enrollments?.[0] || course.userCourses?.[0];
            const hasStarted =
              enrollment && enrollment.status !== "not_started";
            const targetUrl = hasStarted
              ? `/courses/${course.id}/overview`
              : `/courses/${course.id}`;

            return (
              <Link key={course.id} href={targetUrl} className="block">
                <div className="flex flex-row justify-between items-center gap-2 rounded-2xl bg-secondary dark:bg-[#1a2f5a] p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shrink-0">
                      {getCourseIcon(course)}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2">
                      {course.title}
                    </p>
                    {course.time && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {course.time}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Inga kurser hittades för de valda kategorierna.
        </p>
      )}

      {/* Insikt */}
      <section className="mt-10 flex flex-col justify-end">
        <h2 className="text-lg font-extrabold text-foreground mb-4">Insikt</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-[#E8D97A] dark:bg-[#6F5909] p-4 flex flex-col justify-between min-h-[100px]">
            <span className="text-4xl font-extrabold text-foreground">
              {totalEnrolled}
            </span>
            <span className="text-xs font-medium text-foreground/80 leading-tight mt-1">
              Färdiga kurser
            </span>
          </div>

          <div className="rounded-2xl bg-category-three dark:bg-[#6460A2] p-4 flex flex-col justify-between min-h-[100px]">
            <span className="text-4xl font-extrabold text-foreground">
              {completedCourses}
            </span>
            <span className="text-xs font-medium text-foreground/80 leading-tight mt-1">
              Guider
            </span>
          </div>

          <div className="rounded-2xl bg-[#C8E6DC] dark:bg-[#234042] p-4 flex flex-col justify-between min-h-[100px]">
            <span className="text-2xl font-extrabold text-foreground">
              20min
            </span>
            <span className="text-xs font-medium text-foreground/80 leading-tight mt-1">
              Tid spenderad på att lära sig
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
