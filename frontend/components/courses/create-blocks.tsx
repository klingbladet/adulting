"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Block } from "@/types/types";
import { Course } from "@/types/types";
import { Category } from "@/types/types";
import CreatorStepper from "./creator-stepper";

export default function CreateBlocks() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // Hämtar courseId från antingen sökvägen (/courses/123) eller query-parametern (?courseId=123)
  const courseId = params?.courseId || searchParams.get('courseId');

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(courseId ? Number(courseId) : null);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseTime, setCourseTime] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: Date.now(),
      courseId: 0,
      orderIndex: 0,
      title: "",
      content: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    },
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

        const res = await axios.get(`${baseUrl}/api/courses/categories`, {
          withCredentials: true,
        });

        setCategories(res.data?.categories || res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // Denna effekt körs om ett courseId finns i URL:en när komponenten laddas.
    // Den hämtar då befintlig kursdata så att du kan redigera en existerande kurs.
    const fetchCourseData = async (id: string | number) => {
      setLoading(true);
      setError('');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

        // Hämta kursinformation (titel etc.) - OBS: Antar att GET /api/courses/:id finns.
        const coursePromise = axios.get(`${baseUrl}/api/courses/${id}`, { withCredentials: true });
        // Hämta alla block för kursen (innehåll)
        const blocksPromise = axios.get(`${baseUrl}/api/courses/${id}/blocks`, { withCredentials: true });

        const [courseResponse, blocksResponse] = await Promise.all([coursePromise, blocksPromise]);

        // Lägg till fallbacks ifall backend returnerar datan direkt på .data 
        // istället för inkapslat i .data.course / .data.blocks
        const courseData: Course = courseResponse.data?.course || courseResponse.data;
        const blocksData: Block[] = blocksResponse.data?.blocks || blocksResponse.data || [];

        if (courseData) {
          let useLocal = false;
          const localDraft = localStorage.getItem(`course-draft-${courseData.id}`);
          if (localDraft) {
            try {
              const parsed = JSON.parse(localDraft);
              setCourseTitle(parsed.courseTitle || courseData.title);
              const extendedCourse = courseData as Course & { categoryId?: string | number | null, time?: string | number | null };
              setCategoryId(parsed.categoryId || String(extendedCourse.categoryId || ''));
              setCourseTime(parsed.courseTime || String(extendedCourse.time || ''));
              setBlocks(parsed.blocks || blocksData || []);
              useLocal = true;
            } catch (e) {
              console.error("Kunde inte läsa från localStorage", e);
            }
          }

          if (!useLocal) {
            setCourseTitle(courseData.title);
            // Sätt categoryId om det finns (vi utökar typen temporärt för att undvika 'any' varningen)
            const extendedCourse = courseData as Course & { categoryId?: string | number | null, time?: string | number | null };
            if (extendedCourse.categoryId) setCategoryId(String(extendedCourse.categoryId));
            if (extendedCourse.time) setCourseTime(String(extendedCourse.time));
            setBlocks(blocksData || []);
            setSaved(true);
          }
          setActiveCourseId(courseData.id);
        }
      } catch (err) {
        console.error("Failed to fetch course data", err);
        setError("Kunde inte ladda kursdata. Kursen kanske inte finns eller så är du inte inloggad.");
        router.replace('/create/creator-tools/create-blocks'); // Återställ URL om kursen inte hittas
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    if (courseId) {
      // Säkerställ att vi bara skickar en sträng, även om `useParams` skulle ge en array (vid catch-all routes)
      const idToFetch = Array.isArray(courseId) ? courseId[0] : courseId;
      fetchCourseData(idToFetch);
    } else {
      // Ladda utkast för ny kurs
      const localDraft = localStorage.getItem('course-draft-new');
      if (localDraft) {
        try {
          const parsed = JSON.parse(localDraft);
          if (parsed.courseTitle !== undefined) setCourseTitle(parsed.courseTitle);
          if (parsed.courseTime !== undefined) setCourseTime(parsed.courseTime);
          if (parsed.categoryId !== undefined) setCategoryId(parsed.categoryId);
          if (parsed.blocks && parsed.blocks.length > 0) setBlocks(parsed.blocks);
        } catch (e) {
          console.error("Kunde inte läsa utkast från localStorage", e);
        }
      } else {
        setSaved(true);
      }
      setIsLoaded(true);
    }
  }, [courseId, router]);

  // Spara ändringar till localStorage varje gång de uppdateras
  useEffect(() => {
    if (isLoaded && !saved) {
      const draftKey = activeCourseId ? `course-draft-${activeCourseId}` : 'course-draft-new';
      localStorage.setItem(draftKey, JSON.stringify({
        courseTitle,
        courseTime,
        categoryId,
        blocks
      }));
    }
  }, [courseTitle, courseTime, categoryId, blocks, activeCourseId, isLoaded, saved]);

  const addBlock = () => {
    const newBlock: Block = {
      id: Date.now(),
      courseId: 0,
      orderIndex: blocks.length,
      title: "",
      content: {
        type: "doc",
        content: [{ type: "paragraph" }],
      },
    };

    setBlocks([...blocks, newBlock]);
    setSaved(false);
  };

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter((block) => block.id !== id));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!courseTitle || courseTitle.trim().length < 3) {
      setError("Kursen måste ha en titel på minst 3 tecken.");
      return null;
    }

    if (!categoryId) {
      setError("Du måste välja en kategori för kursen.");
      return null;
    }

    if (!courseTime || Number(courseTime) <= 0) {
      setError("Du måste ange en giltig uppskattad tid (i minuter).");
      return null;
    }

    const invalidBlock = blocks.find(
      (block) => !block.title || block.title.trim().length < 5,
    );

    if (invalidBlock) {
      setError("Alla block måste ha en titel på minst 5 tecken.");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      let targetCourseId = activeCourseId;

      if (!targetCourseId) {
        const courseRes = await axios.post(
          `${baseUrl}/api/courses`,
          {
            title: courseTitle,
            categoryId,
            time: Number(courseTime),
            status: "draft",
          },
          {
            withCredentials: true,
          },
        );

        targetCourseId = courseRes.data.id || courseRes.data.course?.id;

        if (!targetCourseId) {
          throw new Error("Kunde inte hämta ID för den nya kursen");
        }

        setActiveCourseId(targetCourseId);
      } else {
        await axios
          .patch(
            `${baseUrl}/api/courses/${targetCourseId}`,
            {
              title: courseTitle,
              categoryId,
              time: Number(courseTime),
            },
            {
              withCredentials: true,
            },
          )
          .catch((err) => console.warn("Update course details failed", err));
      }

      const blocksToSave = blocks.map((block, index) => {
        const isNewBlock = block.id > 1000000000000;

        const blockPayload = {
          ...block,
          courseId: Number(targetCourseId),
          orderIndex: index,
          type: "text",
          quizEligible: true,
        };

        if (isNewBlock) {
          const { id, ...rest } = blockPayload;
          return rest;
        }

        return blockPayload;
      });

      const url = `${baseUrl}/api/courses/${targetCourseId}/blocks`;

      console.log("BLOCKS TO SAVE:", blocksToSave);

      await axios.put(
        url,
        { blocks: blocksToSave },
        {
          withCredentials: true,
        },
      );

      setSaved(true);

      // Rensa draft nu när det är sparat i databasen
      localStorage.removeItem(`course-draft-${targetCourseId}`);
      if (!activeCourseId) {
        localStorage.removeItem('course-draft-new');

        // Uppdatera URL:en med det nya kurs-ID:t EFTER att alla block sparats,
        // så att den inte råkar hämta gamla block via useEffecten under tiden den sparar.
        router.replace(`/create/creator-tools/create-blocks?courseId=${targetCourseId}`, { scroll: false });
      }
      return targetCourseId;
    } catch (error) {
      console.error("Det gick ej att spara lektionen pga servern", error);
      setError("Det gick inte att spara!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (loading) return;

    let courseIdForNext: number | null = activeCourseId;

    if (!saved || !courseIdForNext) {
      courseIdForNext = await handleSave();
    }

    if (!courseIdForNext) {
      return;
    }

    router.push(
      `/create/creator-tools/create-content?courseId=${courseIdForNext}`,
    );
  };

  const updateBlockTitle = (id: number, newTitle: string) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id ? { ...block, title: newTitle } : block,
      ),
    );

    setSaved(false);
  };

  const updateBlockContent = (id: number, newText: string) => {
    setBlocks(
      blocks.map((block) =>
        block.id === id
          ? {
            ...block,
            content: createTextContent(newText),
          }
          : block,
      ),
    );

    setSaved(false);
  };

  function createTextContent(text: string) {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: text.trim()
            ? [
              {
                type: "text",
                text,
              },
            ]
            : [],
        },
      ],
    };
  }

  return (
    <div className="space-y-6">
      <CreatorStepper currentStep={1} />

      <h1 className="text-2xl font-bold text-foreground">Skapa en kurs</h1>

      <div>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => {
            setCourseTitle(e.target.value);
            setSaved(false);
          }}
          placeholder="Kursnamn"
          className="w-full font-medium text-foreground bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSaved(false);
          }}
          className="w-full sm:w-1/2 font-medium text-foreground bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="" disabled>
            Välj kategori
          </option>

          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          value={courseTime}
          onChange={(e) => {
            setCourseTime(e.target.value);
            setSaved(false);
          }}
          placeholder="Uppskattad tid (minuter)"
          min="1"
          className="w-full sm:w-1/2 font-medium text-foreground bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="border border-border p-5 rounded-2xl relative bg-card shadow-sm"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 flex-grow max-w-lg">
              <span className="font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">#{index + 1}</span>

              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                placeholder="Skriv en rubrik (minst 5 tecken)"
                className="w-full font-semibold text-foreground bg-transparent px-2 py-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg placeholder:text-muted-foreground/70"
              />
            </div>

            {blocks.length > 1 && (
              <button
                type="button"
                className="text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/50"
                onClick={() => removeBlock(block.id)}
              >
                Ta bort
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addBlock}
          disabled={loading}
          className="border border-primary rounded-xl py-3 px-5 text-primary hover:bg-primary/10 font-semibold disabled:opacity-50"
        >
          + Lägg till steg
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="border border-border rounded-xl py-3 px-5 text-muted-foreground hover:bg-border hover:text-foreground font-semibold disabled:opacity-50"
        >
          {loading ? "Väntar..." : saved ? "Sparad" : "Spara"}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-row justify-between mt-10">
        <Link href="/create/creator-tools">
          <CourseButton variant="secondary">Tillbaka</CourseButton>
        </Link>

        <CourseButton
          type="button"
          onClick={handleNext}
          disabled={loading}
        >
          {loading ? "Sparar..." : "Nästa"}
        </CourseButton>
      </div>
    </div>
  );
}