import { getMockLessonWithBlocks, listMockLessons } from "./mock-lessons";
import {
  lessonWithBlocksSchema,
  type LessonWithBlocks,
} from "./types";

/**
 * LessonProvider
 *
 * Detta är adapter-kontraktet mellan learning/AI/MCP-lagret och lesson-datan.
 *
 * Quiz-generatorn, MCP:n och AI-assistenten ska använda detta interface
 * i stället för att hämta direkt från databasen.
 *
 * Varför?
 *
 * Just nu:
 * - Vi kan använda mockade lessons.
 *
 * Senare:
 * - Vi byter till DatabaseLessonProvider.
 *
 * Då slipper vi skriva om:
 * - quiz-generation-service
 * - MCP-tools
 * - AI-assistentens context-service
 */
export interface LessonProvider {
  getLessonWithBlocks(lessonId: string): Promise<LessonWithBlocks>;

  /**
   * Inte obligatorisk för alla providers,
   * men praktisk för demo, debug och MCP-tools senare.
   */
  listLessons?(): Promise<LessonWithBlocks[]>;
}

/**
 * Custom error så services och API-routes kan skilja på:
 *
 * - lesson saknas
 * - AI failade
 * - databas failade
 * - validering failade
 */
export class LessonNotFoundError extends Error {
  constructor(lessonId: string) {
    super(`Lesson not found: ${lessonId}`);
    this.name = "LessonNotFoundError";
  }
}

/**
 * Normaliserar och validerar en lesson.
 *
 * Detta ger oss ett säkert format oavsett om datan kommer från:
 * - mockLessons
 * - Drizzle/Postgres
 * - annan framtida CMS/lessonbuilder
 *
 * Den sorterar också blocks efter order.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * Om deras block-format skiljer sig från LessonWithBlocks
 * ska mappningen ske INNAN denna funktion anropas.
 */
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

  /**
   * Safety check.
   *
   * Om detta kastas betyder det nästan alltid att:
   * - lessonWithBlocksSchema inte exporteras korrekt från types.ts
   * - importen i denna fil pekar fel
   * - eller att dev-servern kör gammal cache
   */
  if (!lessonWithBlocksSchema) {
    throw new Error(
      "lessonWithBlocksSchema is undefined. Check exports/imports in backend/src/services/learning/types.ts",
    );
  }

  return lessonWithBlocksSchema.parse(normalized);
}

/**
 * MockLessonProvider
 *
 * Används nu medan lessonbuildern byggs klart.
 *
 * Den returnerar mockade life skills-lektioner från mock-lessons.ts.
 *
 * Detta gör att vi kan bygga klart:
 * - quiz-generator
 * - MCP-server
 * - MCP-tools
 * - AI-assistent context
 *
 * innan riktig lesson/block-data finns i databasen.
 */
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

/**
 * DatabaseLessonProvider
 *
 * Placeholder för den riktiga implementationen.
 *
 * Den här ska användas när lessonbuilder-teamet har:
 * - lessons-tabell
 * - lesson_blocks-tabell
 * - stabila block IDs
 * - endpoint eller service för att hämta lesson med blocks
 *
 * Viktigt:
 * Quiz/MCP-lagret ska fortfarande få tillbaka exakt LessonWithBlocks-formatet.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 *
 * Implementera ungefär:
 *
 * const lesson = await db.query.lessons.findFirst(...)
 * const blocks = await db.query.lessonBlocks.findMany(...)
 *
 * return normalizeLessonWithBlocks({
 *   lesson: {
 *     id: lesson.id,
 *     courseId: lesson.courseId,
 *     title: lesson.title,
 *     description: lesson.description ?? undefined,
 *   },
 *   blocks: blocks.map((block) => ({
 *     id: block.id,
 *     lessonId: block.lessonId,
 *     type: block.type,
 *     order: block.order,
 *     content: block.content,
 *     quizEligible: block.quizEligible,
 *   })),
 * });
 */
export class DatabaseLessonProvider implements LessonProvider {
  async getLessonWithBlocks(lessonId: string): Promise<LessonWithBlocks> {
    /**
     * Detta är avsiktligt inte implementerat ännu.
     *
     * Vi vill inte gissa hur lessonbuilder-teamets tabeller exakt kommer se ut.
     * När deras schema är klart implementerar vi denna provider.
     */
    throw new Error(
      [
        "DatabaseLessonProvider is not implemented yet.",
        `Tried to load lessonId: ${lessonId}`,
        "Use MockLessonProvider until lesson/block database schema is ready.",
      ].join(" "),
    );
  }

  async listLessons(): Promise<LessonWithBlocks[]> {
    throw new Error(
      [
        "DatabaseLessonProvider.listLessons is not implemented yet.",
        "Use MockLessonProvider until lesson/block database schema is ready.",
      ].join(" "),
    );
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