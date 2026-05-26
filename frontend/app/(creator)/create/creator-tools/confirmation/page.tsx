import React from "react";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { CheckCircle, Save } from "lucide-react";

export default async function CreatorSummary({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const resolvedParams = await searchParams;
  const status = resolvedParams?.status;

  const isReview = status === "review";

  return (
    <div className="w-full max-w-3xl mx-auto p-12 mt-20 bg-card rounded-2xl shadow-sm border border-border text-center">
      <div className="mb-8">
        {isReview ? (
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
        ) : (
          <div className="w-20 h-20 bg-muted text-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6">
            <Save size={40} />
          </div>
        )}

        <h1 className="text-3xl font-bold text-foreground mb-4">
          {isReview ? "Kursen är inskickad för granskning!" : "Kursen är sparad som utkast"}
        </h1>

        <p className="text-muted-foreground text-lg leading-relaxed">
          {isReview
            ? "En administratör kommer nu att gå igenom din kurs och publicera den om allt ser bra ut. Du kommer få en notifikation när processen är klar."
            : "Din kurs har sparats säkert och du kan fortsätta arbeta på den senare från listan över dina skapade kurser."}
        </p>
      </div>

      <div className="mt-10 flex justify-center">
        <Link href="/create/creator-tools">
          <CourseButton variant="primary" fullWidth={false} className="px-8">
            Tillbaka till mina kurser
          </CourseButton>
        </Link>
      </div>
    </div>
  );
}
