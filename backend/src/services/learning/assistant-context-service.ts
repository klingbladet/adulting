import { z } from "zod";
import {
  formatLessonForAssistantContext,
  getBlockTextForAi,
} from "./block-utils";
import {
  defaultLessonProvider,
  type LessonProvider,
  LessonNotFoundError,
} from "./lesson-provider";
import {
  buildLessonFocusSummary,
} from "./priority-service";
import type {
  BlockPriorityResult,
  LessonBlock,
  LessonWithBlocks,
  QuizAnswerForPriority,
} from "./types";

/**
 * Assistant context service.
 *
 * Den här filen bygger kontext som AI-assistenten kan använda när den svarar.
 *
 * Målet:
 * AI-assistenten ska inte bara svara generellt.
 * Den ska kunna svara utifrån:
 *
 * - vem användaren är
 * - vad användaren vill lära sig
 * - vilken lektion användaren är på
 * - vilka block användaren verkar ha svårt med
 * - vilka regler assistenten ska följa
 *
 * Viktigt:
 * Den här servicen anropar inte AI-modellen direkt.
 * Den bygger bara kontext.
 *
 * AI-route eller assistant-service använder sedan contexten i prompten.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Byt från MockLessonProvider till DatabaseLessonProvider.
 * - Se till att lesson blocks från databasen returneras i LessonWithBlocks-formatet.
 *
 * TODO när onboarding är helt kopplad:
 * - Implementera DatabaseUserLearningProfileProvider mot user_onboarding-tabellen.
 *
 * TODO när quiz_attempts finns:
 * - Hämta användarens senaste quiz answers från DB.
 * - Skicka in dem som quizAnswers till buildAssistantContext().
 */

export const assistantContextModeSchema = z.enum([
  "general",
  "lesson_help",
  "quiz_review",
  "course_recommendation",
]);

export type AssistantContextMode = z.infer<
  typeof assistantContextModeSchema
>;

/**
 * En förenklad lärprofil från onboarding.
 *
 * Den här bör mappas från er user_onboarding-tabell senare.
 *
 * Exempel:
 * - användaren är nybörjare
 * - användaren vill lära sig boende/ekonomi
 * - användaren föredrar korta, praktiska förklaringar
 */
export const userLearningProfileSchema = z.object({
  userId: z.string(),

  /**
   * Exempel:
   * ["boende", "ekonomi", "arbete"]
   */
  interests: z.array(z.string()).default([]),

  /**
   * Exempel:
   * "nybörjare", "lite erfaren", "kan en del"
   */
  experienceLevel: z.string().optional(),

  /**
   * Exempel:
   * "köpa bostad", "förstå lån", "flytta hemifrån"
   */
  focusArea: z.string().optional(),

  /**
   * Exempel:
   * "kort och enkelt", "steg-för-steg", "praktiska exempel"
   */
  preferredLearningStyle: z.string().optional(),

  /**
   * Fritt fält för framtida onboarding-data.
   *
   * TODO:
   * När onboarding-schemat är mer stabilt kan detta ersättas
   * av tydligare fält.
   */
rawOnboardingData: z.record(z.string(), z.unknown()).optional(),
});

export type UserLearningProfile = z.infer<
  typeof userLearningProfileSchema
>;

export interface UserLearningProfileProvider {
  getUserLearningProfile(
    userId: string,
  ): Promise<UserLearningProfile | null>;
}

/**
 * Mockad user profile provider.
 *
 * Gör att vi kan testa AI-assistenten innan onboarding-datan är helt mappad.
 *
 * TODO när onboarding är klar:
 * Ersätt med DatabaseUserLearningProfileProvider.
 */
export class MockUserLearningProfileProvider
  implements UserLearningProfileProvider
{
  async getUserLearningProfile(
    userId: string,
  ): Promise<UserLearningProfile | null> {
    return userLearningProfileSchema.parse({
      userId,
      interests: ["boende", "ekonomi", "life skills"],
      experienceLevel: "nybörjare",
      focusArea: "förstå bostad, lån och hyreskontrakt",
      preferredLearningStyle: "kort, tydligt och praktiskt med exempel",
      rawOnboardingData: {
        source: "mock",
      },
    });
  }
}

/**
 * Placeholder för riktig onboarding-provider.
 *
 * TODO när onboarding-teamet/DB är redo:
 *
 * Implementera ungefär:
 *
 * const [row] = await db
 *   .select()
 *   .from(userOnboarding)
 *   .where(eq(userOnboarding.userId, userId));
 *
 * return userLearningProfileSchema.parse({
 *   userId,
 *   interests: mapCategories(row.stepOneData),
 *   experienceLevel: row.stepTwoData?.experience,
 *   focusArea: row.stepThreeData?.focusArea,
 *   preferredLearningStyle: row.stepThreeData?.learningStyle,
 *   rawOnboardingData: {
 *     stepOneData: row.stepOneData,
 *     stepTwoData: row.stepTwoData,
 *     stepThreeData: row.stepThreeData,
 *   },
 * });
 */
export class DatabaseUserLearningProfileProvider
  implements UserLearningProfileProvider
{
  async getUserLearningProfile(
    userId: string,
  ): Promise<UserLearningProfile | null> {
    throw new Error(
      [
        "DatabaseUserLearningProfileProvider is not implemented yet.",
        `Tried to load userId: ${userId}.`,
        "Use MockUserLearningProfileProvider until onboarding mapping is ready.",
      ].join(" "),
    );
  }
}

export function createUserLearningProfileProvider(): UserLearningProfileProvider {
  const provider = process.env.LEARNING_PROFILE_PROVIDER ?? "mock";

  if (provider === "database") {
    return new DatabaseUserLearningProfileProvider();
  }

  return new MockUserLearningProfileProvider();
}

export const defaultUserLearningProfileProvider =
  createUserLearningProfileProvider();

/**
 * Input till assistant context.
 *
 * Det här kan AI-chat route senare ta emot från frontend.
 *
 * Exempel:
 *
 * {
 *   userId: "...",
 *   lessonId: "lesson_bolan_001",
 *   mode: "lesson_help"
 * }
 */
export const buildAssistantContextInputSchema = z.object({
  userId: z.string(),

  /**
   * Optional just nu eftersom assistenten även kan svara generellt.
   */
  courseId: z.string().optional(),
  lessonId: z.string().optional(),

  /**
   * Vilket läge assistenten är i.
   */
  mode: assistantContextModeSchema.default("general"),

  /**
   * Quiz answers kan skickas in direkt i början.
   *
   * TODO när quiz_attempts finns:
   * Hämta answers från databasen med userId + lessonId i stället.
   */
  quizAnswers: z
    .array(
      z.object({
        blockId: z.string(),
        isCorrect: z.boolean(),
      }),
    )
    .optional(),
});

export type BuildAssistantContextInput = z.infer<
  typeof buildAssistantContextInputSchema
>;

export type AssistantWeakArea = {
  blockId: string;
  priority: "high" | "medium" | "low";
  reason: string;
  blockTextPreview?: string;
};

export type AssistantContext = {
  userId: string;
  mode: AssistantContextMode;
  courseId?: string;
  lessonId?: string;

  learningProfile?: UserLearningProfile | null;

  lessonWithBlocks?: LessonWithBlocks | null;

  /**
   * Blockprioritet från quizsvar.
   *
   * Detta gör att assistenten kan säga:
   * "Du verkar behöva lägga extra fokus på kontantinsats."
   */
  blockPriorities?: BlockPriorityResult[];

  weakAreas?: AssistantWeakArea[];

  /**
   * En färdig text som kan stoppas in i systemprompten.
   */
  promptContext: string;
};

export type AssistantContextServiceDeps = {
  lessonProvider: LessonProvider;
  userLearningProfileProvider: UserLearningProfileProvider;
};

export function createAssistantContextService(
  deps: AssistantContextServiceDeps,
) {
  return {
    async buildAssistantContext(
      rawInput: BuildAssistantContextInput,
    ): Promise<AssistantContext> {
      const input = buildAssistantContextInputSchema.parse(rawInput);

      const learningProfile =
        await deps.userLearningProfileProvider.getUserLearningProfile(
          input.userId,
        );

      const lessonWithBlocks = input.lessonId
        ? await safeGetLessonWithBlocks(deps.lessonProvider, input.lessonId)
        : null;

      const blockPriorities =
        lessonWithBlocks && input.quizAnswers?.length
          ? buildLessonFocusSummary({
              lessonWithBlocks,
              answers: input.quizAnswers,
            }).priorities
          : undefined;

      const weakAreas =
        lessonWithBlocks && blockPriorities
          ? buildWeakAreas({
              lessonWithBlocks,
              priorities: blockPriorities,
            })
          : undefined;

      const promptContext = formatAssistantPromptContext({
        userId: input.userId,
        mode: input.mode,
        courseId: input.courseId,
        lessonId: input.lessonId,
        learningProfile,
        lessonWithBlocks,
        blockPriorities,
        weakAreas,
      });

      return {
        userId: input.userId,
        mode: input.mode,
        courseId: input.courseId,
        lessonId: input.lessonId,
        learningProfile,
        lessonWithBlocks,
        blockPriorities,
        weakAreas,
        promptContext,
      };
    },
  };
}

export type AssistantContextService = ReturnType<
  typeof createAssistantContextService
>;

export const defaultAssistantContextService =
  createAssistantContextService({
    lessonProvider: defaultLessonProvider,
    userLearningProfileProvider: defaultUserLearningProfileProvider,
  });

/**
 * Hämtar lesson på ett säkert sätt.
 *
 * Om lesson saknas returnerar vi null i stället för att krascha hela chatten.
 *
 * Varför?
 * AI-assistenten ska fortfarande kunna svara generellt även om frontend
 * råkar skicka ett gammalt eller felaktigt lessonId.
 */
async function safeGetLessonWithBlocks(
  lessonProvider: LessonProvider,
  lessonId: string,
): Promise<LessonWithBlocks | null> {
  try {
    return await lessonProvider.getLessonWithBlocks(lessonId);
  } catch (error) {
    if (error instanceof LessonNotFoundError) {
      return null;
    }

    throw error;
  }
}

/**
 * Bygger svaga områden från blockprioritering.
 *
 * Första MVP:
 * - high och medium visas som weakAreas
 * - low räknas som behärskat område
 */
function buildWeakAreas(input: {
  lessonWithBlocks: LessonWithBlocks;
  priorities: BlockPriorityResult[];
}): AssistantWeakArea[] {
  const blocksById = new Map<string, LessonBlock>(
    input.lessonWithBlocks.blocks.map((block) => [block.id, block]),
  );

  return input.priorities
    .filter(
      (priority) =>
        priority.priority === "high" || priority.priority === "medium",
    )
    .map((priority) => {
      const block = blocksById.get(priority.blockId);
      const blockText = block ? getBlockTextForAi(block) : "";

      const reason =
        priority.priority === "high"
          ? "Eleven svarade fel på de flesta frågor kopplade till detta block."
          : "Eleven svarade delvis rätt men kan behöva repetera detta block.";

      return {
        blockId: priority.blockId,
        priority: priority.priority,
        reason,
        blockTextPreview: blockText ? blockText.slice(0, 180) : undefined,
      };
    });
}

/**
 * Formaterar all kontext till en promptvänlig text.
 *
 * Denna text kan läggas in i systemprompten eller som ett separat system-meddelande.
 */
export function formatAssistantPromptContext(input: {
  userId: string;
  mode: AssistantContextMode;
  courseId?: string;
  lessonId?: string;
  learningProfile?: UserLearningProfile | null;
  lessonWithBlocks?: LessonWithBlocks | null;
  blockPriorities?: BlockPriorityResult[];
  weakAreas?: AssistantWeakArea[];
}): string {
  const lines: string[] = [];

  lines.push("ASSISTENTKONTEXT");
  lines.push("");

  lines.push(`Mode: ${input.mode}`);
  lines.push(`User ID: ${input.userId}`);

  if (input.courseId) {
    lines.push(`Course ID: ${input.courseId}`);
  }

  if (input.lessonId) {
    lines.push(`Lesson ID: ${input.lessonId}`);
  }

  lines.push("");

  if (input.learningProfile) {
    lines.push("Användarens lärprofil:");
    lines.push(formatLearningProfileForPrompt(input.learningProfile));
    lines.push("");
  } else {
    lines.push("Användarens lärprofil: ingen onboarding-data hittades.");
    lines.push("");
  }

  if (input.lessonWithBlocks) {
    lines.push("Aktuell lektion:");
    lines.push(formatLessonForAssistantContext(input.lessonWithBlocks));
    lines.push("");
  } else if (input.lessonId) {
    lines.push(
      "Aktuell lektion: lessonId skickades in, men lektionen hittades inte.",
    );
    lines.push("");
  }

  if (input.blockPriorities?.length) {
    lines.push("Quizbaserad blockprioritering:");
    lines.push(formatBlockPrioritiesForPrompt(input.blockPriorities));
    lines.push("");
  }

  if (input.weakAreas?.length) {
    lines.push("Områden eleven bör fokusera extra på:");
    lines.push(formatWeakAreasForPrompt(input.weakAreas));
    lines.push("");
  }

  lines.push("Regler för assistenten:");
  lines.push("- Svara på svenska om användaren skriver svenska.");
  lines.push("- Var konkret, varm och pedagogisk.");
  lines.push("- Anpassa nivån till unga vuxna och nybörjare.");
  lines.push("- Utgå från kursmaterialet när lesson context finns.");
  lines.push("- Hitta inte på innehåll som inte finns i lektionen.");
  lines.push(
    "- Om frågan gäller ekonomi, lån eller bostad: ge generell utbildande information, inte personlig finansiell rådgivning.",
  );
  lines.push(
    "- Uppmana användaren att kontrollera viktiga beslut med relevant expert, bank, myndighet eller hyresvärd när det behövs.",
  );

  return lines.join("\n");
}

function formatLearningProfileForPrompt(
  profile: UserLearningProfile,
): string {
  const lines: string[] = [];

  if (profile.interests.length) {
    lines.push(`- Intressen: ${profile.interests.join(", ")}`);
  }

  if (profile.experienceLevel) {
    lines.push(`- Erfarenhetsnivå: ${profile.experienceLevel}`);
  }

  if (profile.focusArea) {
    lines.push(`- Fokusområde: ${profile.focusArea}`);
  }

  if (profile.preferredLearningStyle) {
    lines.push(`- Föredragen lärstil: ${profile.preferredLearningStyle}`);
  }

  if (!lines.length) {
    return "- Ingen tydlig lärprofil finns ännu.";
  }

  return lines.join("\n");
}

function formatBlockPrioritiesForPrompt(
  priorities: BlockPriorityResult[],
): string {
  return priorities
    .map((priority) => {
      return [
        `- Block ${priority.blockId}`,
        `priority: ${priority.priority}`,
        `correct: ${priority.correct}/${priority.total}`,
        `masteryScore: ${priority.masteryScore.toFixed(2)}`,
      ].join(", ");
    })
    .join("\n");
}

function formatWeakAreasForPrompt(weakAreas: AssistantWeakArea[]): string {
  return weakAreas
    .map((area) => {
      return [
        `- Block ${area.blockId}`,
        `priority: ${area.priority}`,
        `reason: ${area.reason}`,
        area.blockTextPreview
          ? `preview: ${area.blockTextPreview}`
          : null,
      ]
        .filter((value): value is string => value !== null)
        .join(", ");
    })
    .join("\n");
}

/**
 * Bygger en systemprompt för assistenten.
 *
 * Den här kan användas direkt i er befintliga AI-route.
 *
 * Exempel:
 *
 * const context = await defaultAssistantContextService.buildAssistantContext(...)
 *
 * messages = [
 *   {
 *     role: "system",
 *     content: buildAssistantSystemPrompt(context.promptContext)
 *   },
 *   ...
 * ]
 */
export function buildAssistantSystemPrompt(promptContext: string): string {
  return [
    "Du är en AI-assistent i en lärplattform för unga vuxna.",
    "",
    "Tjänsten hjälper unga vuxna att förstå viktiga life skills, till exempel:",
    "- boende",
    "- lån",
    "- privatekonomi",
    "- arbete",
    "- myndigheter",
    "- vuxenlivets praktiska beslut",
    "",
    "Din roll:",
    "- Förklara svåra saker enkelt.",
    "- Hjälp användaren förstå, inte bara få rätt svar.",
    "- Använd exempel när det hjälper.",
    "- Var trygg, pedagogisk och tydlig.",
    "",
    promptContext,
  ].join("\n");
}

/**
 * Demo-helper.
 *
 * Användbar för att testa assistentkontext innan frontend skickar riktig context.
 *
 * TODO senare:
 * Flytta till test/demo-fil när flödet är stabilt.
 */
export async function buildMockBolaneAssistantContext(userId: string) {
  return defaultAssistantContextService.buildAssistantContext({
    userId,
    lessonId: "lesson_bolan_001",
    courseId: "course_bostad_001",
    mode: "lesson_help",
    quizAnswers: [
      /**
       * Simulerat:
       * Eleven verkar kunna första blocket men har svårt med ränta/amortering.
       */
      {
        blockId: "block_bolan_text_001",
        isCorrect: true,
      },
      {
        blockId: "block_bolan_text_001",
        isCorrect: true,
      },
      {
        blockId: "block_bolan_text_002",
        isCorrect: false,
      },
      {
        blockId: "block_bolan_text_002",
        isCorrect: false,
      },
    ],
  });
}