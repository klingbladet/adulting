'use client';

import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Course } from "@/types/types";
import { Trash2, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type CourseWithTimestamps = Course & {
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminReviewsClient({
  pendingCourses,
  rejectedCourses,
  publishedCourses,
  statusParam
}: {
  pendingCourses: CourseWithTimestamps[];
  rejectedCourses: CourseWithTimestamps[];
  publishedCourses: CourseWithTimestamps[];
  statusParam?: string;
}) {
  const router = useRouter();
  const [courseToDelete, setCourseToDelete] = useState<CourseWithTimestamps | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const expectedTitleToMatch = courseToDelete?.title || "";

  const handleDelete = async () => {
    if (!courseToDelete) return;
    
    setIsDeleting(true);
    setDeleteError("");

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${baseUrl}/api/courses/${courseToDelete.id}`, {
        withCredentials: true
      });
      router.refresh();
      setCourseToDelete(null);
      setDeleteInput("");
    } catch (error) {
      console.error("Det gick inte att ta bort kursen", error);
      setDeleteError("Något gick fel när kursen skulle raderas.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-6">
        {statusParam === 'approved' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="w-6 h-6" />
            <span className="font-medium">Kursen har godkänts och publicerats!</span>
          </div>
        )}
        {statusParam === 'rejected' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <XCircle className="w-6 h-6" />
            <span className="font-medium">Kursen har nekats och skickats tillbaka som nekad.</span>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-2">Väntande granskningar</h1>
        <p className="text-gray-500 mb-8">Kurser som har skickats in av kreatörer och väntar på ditt godkännande.</p>

        {pendingCourses.length === 0 ? (
          <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow-sm border border-gray-100">Det finns inga kurser att granska just nu.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {pendingCourses.map((course) => (
              <div key={course.id} className="p-4 border border-gray-100 rounded-lg bg-white flex justify-between items-center shadow-sm">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{course.title || "Kurs utan titel"}</h3>
                  <p className="text-sm text-gray-500">
                    Inskickad för granskning
                    {course.updatedAt && ` • ${new Date(course.updatedAt).toLocaleDateString('sv-SE')}`}
                  </p>
                </div>
                <Link href={`/create/admin/reviews/${course.id}`}>
                  <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                    Granska kurs
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {publishedCourses && publishedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Publicerade kurser</h2>
            <p className="text-gray-500 mb-6">Kurser som är aktiva och synliga för användare.</p>
            
            <div className="flex flex-col gap-4">
              {publishedCourses.map((course) => (
                <div key={course.id} className="p-4 border border-green-100 rounded-lg bg-green-50/30 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{course.title || "Kurs utan titel"}</h3>
                    <p className="text-sm text-green-700 font-medium">
                      Publicerad
                      {course.updatedAt && ` • ${new Date(course.updatedAt).toLocaleDateString('sv-SE')}`}
                    </p>
                  </div>
                  <Link href={`/create/admin/reviews/${course.id}`}>
                    <button className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                      Hantera kurs
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {rejectedCourses.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Nekade kurser</h2>
            <p className="text-gray-500 mb-6">Dessa kurser har nekats. Som administratör kan du välja att radera dem permanent.</p>
            
            <div className="flex flex-col gap-4">
              {rejectedCourses.map((course) => (
                <div key={course.id} className="p-4 border border-red-100 rounded-lg bg-red-50 flex justify-between items-center shadow-sm">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{course.title || "Kurs utan titel"}</h3>
                    <p className="text-sm text-gray-500">
                      Nekad
                      {course.updatedAt && ` • ${new Date(course.updatedAt).toLocaleDateString('sv-SE')}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/create/admin/reviews/${course.id}`}>
                      <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                        Hantera kurs
                      </button>
                    </Link>
                    <button 
                      onClick={() => { setCourseToDelete(course); setDeleteInput(''); setDeleteError(''); }}
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition font-medium flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Ta bort permanent
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {courseToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Radera kurs</h3>
            <p className="mb-4 text-sm text-gray-600">
              Är du säker på att du vill radera <strong>{expectedTitleToMatch}</strong>? Denna åtgärd går inte att ångra och all data kommer att försvinna permanent.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skriv <strong>{expectedTitleToMatch}</strong> för att bekräfta:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 bg-transparent"
                placeholder={expectedTitleToMatch}
              />
            </div>

            {deleteError && (
              <p className="text-red-500 text-sm mb-4 font-medium">{deleteError}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCourseToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== expectedTitleToMatch || isDeleting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Raderar..." : "Radera permanent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
