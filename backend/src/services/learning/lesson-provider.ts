import { getMockLessonWithBlocks, listMockLessons } from "./mock-lessons";
import {
  lessonWithBlocksSchema,
  type LessonWithBlocks,
} from "./types";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db";
import { blocks, courses } from "../../db/course-schema";

export interface LessonProvider {
  getLessonWithBlocks(lessonId: string): Promise<LessonWithBlocks>;

 
  listLessons?(): Promise<LessonWithBlocks[]>;
}


export class LessonNotFoundError extends Error {
  constructor(lessonId: string) {
    super(`Lesson not found: ${lessonId}`);
    this.name = "LessonNotFoundError";
  }
}

export function normalizeLessonWithBlocks(
  lessonWithBlocks: LessonWithBlocks,
): LessonWithBlocks {
  const normalized: LessonWithBlocks = {
    lesson: {
      ...lessonWithBlocks.lesson,
    },
    blocks: lessonWithBlocks.blocks
      .map((block) => ({
        ...block,
        content: {
          ...block.content,
        },
      }))
      .sort((a, b) => a.order - b.order),
  };

  if (!lessonWithBlocksSchema) {
    throw new Error(
      "lessonWithBlocksSchema is undefined. Check exports/imports in backend/src/services/learning/types.ts",
    );
  }

  return lessonWithBlocksSchema.parse(normalized);
}

export class MockLessonProvider implements LessonProvider {
  async getLessonWithBlocks(lessonId: string): Promise<LessonWithBlocks> {
    const lessonWithBlocks = getMockLessonWithBlocks(lessonId);

    if (!lessonWithBlocks) {
      throw new LessonNotFoundError(lessonId);
    }

    return normalizeLessonWithBlocks(lessonWithBlocks);
  }

  async listLessons(): Promise<LessonWithBlocks[]> {
    return listMockLessons().map((lessonWithBlocks) =>
      normalizeLessonWithBlocks(lessonWithBlocks),
    );
  }
}

export class DatabaseLessonProvider implements LessonProvider {
  async getLessonWithBlocks(lessonId: string): Promise<LessonWithBlocks> {
    const courseId = Number(lessonId);

    if (!Number.isInteger(courseId)) {
      throw new LessonNotFoundError(lessonId);
    }

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId));

    if (!course) {
      throw new LessonNotFoundError(lessonId);
    }

    const courseBlocks = await db
      .select()
      .from(blocks)
      .where(eq(blocks.courseId, courseId))
      .orderBy(asc(blocks.orderIndex));

    return normalizeLessonWithBlocks({
      lesson: {
        id: String(course.id),

        courseId: String(course.id),

        title: course.title,
        description: course.textContent ?? undefined,
      },

      blocks: courseBlocks.map((block) => ({
        id: String(block.id),
        lessonId: String(course.id),

        
        type: "text",

        order: block.orderIndex,

        content: normalizeDatabaseBlockContent(block.content, block.title),

        quizEligible: block.quizEligible ?? true,
      })),
    });
  }

  async listLessons(): Promise<LessonWithBlocks[]> {
    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(asc(courses.id));

    const result: LessonWithBlocks[] = [];

    for (const course of allCourses) {
      result.push(await this.getLessonWithBlocks(String(course.id)));
    }

    return result;
  }
}

/**
 * Skapar rätt provider beroende på environment.
 *
 * Under utveckling kan vi köra:
 *
 * LEARNING_LESSON_PROVIDER=mock
 *
 * Senare, när databasen är redo:
 *
 * LEARNING_LESSON_PROVIDER=database
 *
 * Default är mock för att MCP/AI-utvecklingen ska kunna fortsätta direkt.
 */
export function createLessonProvider(): LessonProvider {
  const provider = process.env.LEARNING_LESSON_PROVIDER ?? "mock";

  if (provider === "database") {
    return new DatabaseLessonProvider();
  }

  return new MockLessonProvider();
}

/**
 * Default provider för enkel användning.
 *
 * Den här kan användas i tidiga services.
 *
 * Exempel:
 *
 * const lesson = await defaultLessonProvider.getLessonWithBlocks(lessonId);
 *
 * Senare, om ni vill dependency-injecta providers i tester,
 * använd createLessonProvider() direkt i stället.
 */


export const defaultLessonProvider = createLessonProvider();

function normalizeDatabaseBlockContent(
  rawContent: unknown,
  title?: string | null,
): LessonWithBlocks["blocks"][number]["content"] {
  if (typeof rawContent === "string") {
    try {
      const parsed = JSON.parse(rawContent);
      return normalizeDatabaseBlockContent(parsed, title);
    } catch {
      return {
        text: [title, rawContent].filter(Boolean).join("\n\n"),
      };
    }
  }

  if (
    typeof rawContent === "object" &&
    rawContent !== null &&
    "text" in rawContent &&
    typeof rawContent.text === "string"
  ) {
    return {
      text: [title, rawContent.text].filter(Boolean).join("\n\n"),
    };
  }

  const extractedText = extractTextFromRichContent(rawContent);

  return {
    text: [title, extractedText].filter(Boolean).join("\n\n"),
  };
}

function extractTextFromRichContent(value: unknown): string {
  const parts: string[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== "object") {
      return;
    }

    if ("text" in node && typeof node.text === "string") {
      parts.push(node.text);
    }

    if ("content" in node && Array.isArray(node.content)) {
      for (const child of node.content) {
        walk(child);
      }
    }
  }

  walk(value);

  return parts.join(" ").trim();
}