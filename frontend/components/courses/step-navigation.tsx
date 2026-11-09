'use client'

import { Suspense } from "react";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { useCourseId } from "@/lib/use-course-id";

interface StepNavigationProps {
  backPath?: string;
  nextPath?: string;
  backLabel?: string;
  nextLabel?: string;
}

function StepNavigationInner({
  backPath,
  nextPath,
  backLabel = "Tillbaka",
  nextLabel = "Nästa",
}: StepNavigationProps) {
  const courseId = useCourseId();
  const query = courseId ? `?courseId=${courseId}` : "";

  return (
    <div className="flex flex-row justify-between mt-12 pt-8 border-t border-border">
      {backPath ? (
        <Link href={`${backPath}${query}`}>
          <CourseButton variant="secondary">{backLabel}</CourseButton>
        </Link>
      ) : (
        <div />
      )}

      {nextPath ? (
        <Link href={`${nextPath}${query}`}>
          <CourseButton>{nextLabel}</CourseButton>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

export default function StepNavigation(props: StepNavigationProps) {
  return (
    <Suspense fallback={<div className="flex flex-row justify-between mt-12 pt-8 border-t border-border" />}>
      <StepNavigationInner {...props} />
    </Suspense>
  );
}
