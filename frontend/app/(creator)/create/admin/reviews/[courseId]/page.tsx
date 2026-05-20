import { requireRole } from "@/lib/guards";
import { getCourseById } from "@/lib/api";
import ReviewActions from "./review-actions";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function AdminReviewDetailPage({ 
  params 
}: { 
  params: Promise<{ courseId: string }> 
}) {
  await requireRole(["admin"]);
  const { courseId } = await params;
  const course = await getCourseById(courseId).catch(() => null);

  if (!course) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Kursen hittades inte</h1>
        <Link href="/create/admin/reviews" className="text-blue-600 hover:underline">
          Tillbaka till listan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link 
        href="/create/admin/reviews" 
        className="flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ChevronLeft size={16} className="mr-1" />
        Tillbaka till granskningar
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-wider">
            Väntar på granskning
          </span>
          <h1 className="text-3xl font-bold mt-4 text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2 text-lg">{course.textContent}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase">Tid</h4>
            <p className="text-lg font-medium">{course.time} minuter</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-bold text-gray-400 uppercase">Antal block</h4>
            <p className="text-lg font-medium">{course.blocks} st</p>
          </div>
        </div>

        <ReviewActions courseId={courseId} />
      </div>
    </div>
  );
}
