'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import BlockCard from "@/components/courses/course-layout";
import getCourseIcon from "@/components/courses/course-dynamic-icon";
import { Course } from "@/types/types";
import { Trash2 } from "lucide-react";

interface DraftData {
  courseTitle?: string;
  courseTime?: string | number;
  blocks?: unknown[];
}

type CourseWithDraft = Course & { hasDraft?: boolean };

export default function CourseListClient({ initialCourses }: { initialCourses: Course[] }) {
  const [courses, setCourses] = useState<CourseWithDraft[]>(initialCourses);
  const [newDraft, setNewDraft] = useState<DraftData | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<CourseWithDraft | 'new' | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const expectedTitleToMatch = courseToDelete === 'new'
    ? (newDraft?.courseTitle || "Osparat utkast")
    : courseToDelete?.title || "";

  useEffect(() => {
    // Använd en timeout för att göra läsningen asynkron och undvika
    // Reacts "cascading renders"-varning vid synkrona state-uppdateringar i en effect.
    const timer = setTimeout(() => {
      // 1. Läs in eventuellt utkast för en ny kurs (som inte ens har sparats i databasen)
      const localNewDraft = localStorage.getItem('course-draft-new');
      if (localNewDraft) {
        try {
          const parsed = JSON.parse(localNewDraft);
          // Visa den i listan om den har en titel eller block påbörjade
          if (parsed.courseTitle || (parsed.blocks && parsed.blocks.length > 0)) {
            setNewDraft(parsed);
          }
        } catch (e) {
          console.error("Kunde inte läsa utkast från localStorage", e);
        }
      }

      // 2. Uppdatera befintliga kurser i listan om vi har nyare data i localStorage
      const updatedCourses = initialCourses.map(course => {
        const draft = localStorage.getItem(`course-draft-${course.id}`);
        const contentDraft = localStorage.getItem(`course-content-draft-${course.id}`);
        
        let parsedDraft: DraftData | null = null;
        if (draft) {
          try {
            parsedDraft = JSON.parse(draft);
          } catch (e) {
            console.error("Kunde inte läsa kursutkast", e);
          }
        }
        
        return {
          ...course,
          title: parsedDraft?.courseTitle || course.title,
          time: parsedDraft?.courseTime || course.time,
          blocks: parsedDraft?.blocks ? parsedDraft.blocks.length : course.blocks,
          hasDraft: !!draft || !!contentDraft
        } as CourseWithDraft;
      });

      setCourses(updatedCourses);
    }, 0);

    return () => clearTimeout(timer);
  }, [initialCourses]);

  const getSteps = (blocks: unknown) => {
    if (typeof blocks === 'number') return blocks;
    if (Array.isArray(blocks)) return blocks.length;
    return undefined;
  };

  const handleDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      if (courseToDelete === 'new') {
        localStorage.removeItem('course-draft-new');
        setNewDraft(null);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        await axios.delete(`${baseUrl}/api/courses/${courseToDelete.id}`, {
          withCredentials: true
        });

        // Rensa eventuella utkast lokalt så de inte dyker upp som "spöken"
        localStorage.removeItem(`course-draft-${courseToDelete.id}`);
        localStorage.removeItem(`course-content-draft-${courseToDelete.id}`);

        // Uppdatera listan direkt i gränssnittet
        setCourses(prev => prev.filter(c => c.id !== courseToDelete.id));
      }

      setCourseToDelete(null);
      setDeleteInput("");
    } catch (error) {
      console.error("Det gick inte att radera kursen", error);
      setDeleteError("Ett fel uppstod när kursen skulle raderas. Kontrollera servern.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {newDraft && (
          <div className="flex gap-2 items-stretch">
            <Link href={`/create/creator-tools/create-blocks`} className="flex-grow">
              <BlockCard
                icon={getCourseIcon({ category: { name: 'Draft' } } as unknown as Course)}
                title={newDraft.courseTitle || "Osparat utkast"}
                time={newDraft.courseTime}
                steps={getSteps(newDraft.blocks)}
                description="LOKALT UTKAST (ej sparad i databasen)"
              />
            </Link>
            <button
              onClick={() => { setCourseToDelete('new'); setDeleteInput(''); setDeleteError(''); }}
              className="px-5 text-red-400 hover:text-red-600 bg-secondary hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-200 flex items-center justify-center shadow-sm"
              title="Kasta utkast"
            >
              <Trash2 size={24} />
            </button>
          </div>
        )}

        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="flex gap-2 items-stretch">
              <Link href={`/create/creator-tools/create-blocks?courseId=${course.id}`} className="flex-grow">
                <BlockCard
                  icon={getCourseIcon(course)}
                  title={course.title}
                  time={course.time}
                  steps={getSteps(course.blocks)}
                  description={course.hasDraft ? "Har osparade ändringar lokalt" : undefined}
                />
              </Link>
              <button
                onClick={() => { setCourseToDelete(course); setDeleteInput(''); setDeleteError(''); }}
                className="px-5 text-red-400 hover:text-red-600 bg-secondary hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-200 flex items-center justify-center shadow-sm"
                title="Radera kurs"
              >
                <Trash2 size={24} />
              </button>
            </div>
          ))
        ) : (
          !newDraft && <p className="text-sm text-muted-foreground italic">Inga kurser hittades ännu.</p>
        )}
      </div>

      {courseToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Radera {courseToDelete === 'new' ? 'utkast' : 'kurs'}</h3>
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