'use client'

import { useParams, useSearchParams } from 'next/navigation';

export function useCourseId() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const courseId = params?.courseId || searchParams?.get('courseId');
  return courseId ? String(courseId) : null;
}