import { requireRole } from "@/lib/guards";
import { getCourseById } from "@/lib/api";
import ReviewActions from "@/components/admin/review-actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import PreviewClient from "@/components/courses/preview-client";
import { JSONContent } from "@tiptap/core";
import { Course } from "@/types/types";

type CourseWithRelations = Course & {
  courseBlocks?: {
    id: number;
    title: string;
    content: JSONContent | string | null;
  }[];
};

export default async function AdminReviewDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>
}) {

  await requireRole(["admin"]);
  const { courseId } = await params;
  const course = (await getCourseById(courseId).catch(() => null)) as CourseWithRelations | null;

  if (!course) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">Kursen hittades inte</h1>
        <Link href="/create/admin/reviews" className="text-primary hover:underline">
          Tillbaka till listan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link
        href="/create/admin/reviews"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft size={16} className="mr-1" />
        Tillbaka till granskningar
      </Link>

      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="mb-8">
          {course.status === 'published' && course.isPublished ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Publicerad
            </span>
          ) : course.status === 'rejected' ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Nekad
            </span>
          ) : (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">
              Väntar på granskning
            </span>
          )}
          <h1 className="text-3xl font-bold mt-4 text-foreground">{course.title}</h1>
          <p className="text-muted-foreground mt-2 text-lg">{course.textContent}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-xs font-bold text-muted-foreground uppercase">Tid</h4>
            <p className="text-lg font-medium text-foreground">{course.time} minuter</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-xs font-bold text-muted-foreground uppercase">Antal steg</h4>
            <p className="text-lg font-medium text-foreground">{course.blocks} st</p>
          </div>
        </div>
        {course ? (
          <PreviewClient blocks={course.courseBlocks || []} />
        ) : (
          <p className="text-red-500 italic mt-8">Ingen kurs hittades att förhandsgranska. Saknas courseId i URL:en?</p>
        )}

        <ReviewActions courseId={courseId} courseStatus={course.status ?? undefined} courseTitle={course.title ?? undefined} />
      </div>
    </div>
  );
}
