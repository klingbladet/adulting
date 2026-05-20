'use client'

import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { useCourseId } from "@/lib/use-course-id";

interface StepNavigationProps {
  backPath?: string;
  nextPath?: string;
  backLabel?: string;
  nextLabel?: string;
}

export default function StepNavigation({
  backPath,
  nextPath,
  backLabel = "Tillbaka",
  nextLabel = "Nästa"
}: StepNavigationProps) {
  const courseId = useCourseId();
  const query = courseId ? `?courseId=${courseId}` : '';

  return (
    <div className="flex flex-row justify-between mt-10">
      {backPath ? (
        <Link href={`${backPath}${query}`}>
          <CourseButton variant="secondary">{backLabel}</CourseButton>
        </Link>
      ) : <div />}
      
      {nextPath ? (
        <Link href={`${nextPath}${query}`}>
          <CourseButton>{nextLabel}</CourseButton>
        </Link>
      ) : <div />}
    </div>
  );
}