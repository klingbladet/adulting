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

  const courseId = searchParams.get("courseId");

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeCourseId, setActiveCourseId] = useState<number | null>(
    courseId ? Number(courseId) : null,
  );
  const [courseTitle, setCourseTitle] = useState("");
  const [courseTime, setCourseTime] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
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
  const fetchCourseData = async (id: string) => {
    setLoading(true);
    setError("");

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      const [courseResponse, blocksResponse] = await Promise.all([
        axios.get(`${baseUrl}/api/courses/${id}`, {
          withCredentials: true,
        }),
        axios.get(`${baseUrl}/api/courses/${id}/blocks`, {
          withCredentials: true,
        }),
      ]);

      console.log("COURSE RESPONSE:", courseResponse.data);
      console.log("BLOCKS RESPONSE:", blocksResponse.data);

      const courseData =
        courseResponse.data.course ?? courseResponse.data;

      const blocksData =
        blocksResponse.data.blocks ?? blocksResponse.data;

      if (!courseData?.id) {
        throw new Error("Kursen hittades inte i API-svaret.");
      }

      setCourseTitle(courseData.title ?? "");
      setActiveCourseId(Number(courseData.id));

      if (courseData.categoryId) {
        setCategoryId(String(courseData.categoryId));
      }

      if (courseData.time) {
        setCourseTime(String(courseData.time));
      }

      setBlocks(Array.isArray(blocksData) ? blocksData : []);
      setSaved(true);
    } catch (err) {
      console.error("Failed to fetch course data", err);

      setError(
        "Kunde inte ladda kursdata. Kursen kanske inte finns eller så är du inte inloggad.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (courseId) {
    fetchCourseData(courseId);
  }
}, [courseId]);

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

  const handleSave = async (): Promise<number | null> => {
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

        router.replace(
          `/create/creator-tools/create-blocks?courseId=${targetCourseId}`,
          { scroll: false },
        );
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

      return Number(targetCourseId);
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

    let courseIdForNext = activeCourseId;

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

  function getTextFromBlockContent(content: unknown): string {
    const parts: string[] = [];

    function walk(node: unknown) {
      if (!node || typeof node !== "object") return;

      if ("text" in node && typeof node.text === "string") {
        parts.push(node.text);
      }

      if ("content" in node && Array.isArray(node.content)) {
        for (const child of node.content) {
          walk(child);
        }
      }
    }

    walk(content);

    return parts.join(" ").trim();
  }

  return (
    <div className="space-y-6">
      <CreatorStepper currentStep={1} />

      <h1 className="text-2xl font-bold">Skapa en kurs</h1>

      <div>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => {
            setCourseTitle(e.target.value);
            setSaved(false);
          }}
          placeholder="Kursnamn"
          className="w-full font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSaved(false);
          }}
          className="w-full sm:w-1/2 font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
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
          className="w-full sm:w-1/2 font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {blocks.map((block, index) => (
        <div
          key={block.id}
          className="border p-4 rounded-lg relative bg-white shadow-sm"
        >
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-grow max-w-sm">
              <span className="font-medium text-gray-400">#{index + 1}</span>

              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                placeholder="Skriv en rubrik (minst 5 tecken)"
                className="w-full font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {blocks.length > 1 && (
              <button
                type="button"
                className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                onClick={() => removeBlock(block.id)}
              >
                ✕ Remove
              </button>
            )}
          </div>

          <textarea
            value={getTextFromBlockContent(block.content)}
            onChange={(e) => updateBlockContent(block.id, e.target.value)}
            placeholder="Skriv blockets innehåll här..."
            rows={5}
            className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-blue-500"
          />
        </div>
      ))}

      <div className="flex gap-4">
        <button
          type="button"
          onClick={addBlock}
          disabled={loading}
          className="border rounded-sm border-blue-500 py-2 px-4 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
        >
          + Add block
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="border rounded-sm border-gray-300 py-2 px-4 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition disabled:opacity-50"
        >
          {loading ? "Wait..." : saved ? "Sparad" : "Spara"}
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