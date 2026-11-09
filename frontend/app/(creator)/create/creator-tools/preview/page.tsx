import { Suspense } from "react";
import CreatorStepper from "@/components/courses/creator-stepper";
import StepNavigation from "@/components/courses/step-navigation";
import { getCourseById } from "@/lib/api";
import PreviewClient from "@/components/courses/preview-client";
import { JSONContent } from "@tiptap/react";

export const dynamic = "force-dynamic";

type CourseWithRelations = {
  title: string;
  courseBlocks?: {
    id: number;
    title: string;
    content: JSONContent | string | null;
  }[];
};

export default async function PreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>;
}) {
  const resolvedParams = await searchParams;
  const courseId = resolvedParams?.courseId;

  let course: CourseWithRelations | null = null;
  if (courseId) {
    try {
      course = (await getCourseById(courseId)) as unknown as CourseWithRelations;
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 font-sans md:pr-20">
      <CreatorStepper currentStep={4} />

      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Laddar förhandsgranskning...</div>}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Förhandsgranska: {course?.title || "Laddar..."}
          </h1>
          <p className="text-muted-foreground mb-6">
            Här kan du se exakt hur innehållet i dina block kommer att presenteras för studenterna.
          </p>

          {course ? (
            <PreviewClient blocks={course.courseBlocks || []} />
          ) : (
            <p className="text-red-500 italic mt-8">
              Ingen kurs hittades att förhandsgranska. Saknas courseId i URL:en?
            </p>
          )}
        </div>

        <StepNavigation
          backPath="/create/creator-tools/create-quiz"
          nextPath="/create/creator-tools/publish"
        />
      </Suspense>
    </div>
  );
}
