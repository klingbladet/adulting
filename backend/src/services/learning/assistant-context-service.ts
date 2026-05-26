import { z } from "zod";
import { formatLessonForAssistantContext } from "./block-utils";
import {
  defaultLessonProvider,
  type LessonProvider,
  LessonNotFoundError,
} from "./lesson-provider";
import type { BlockPriorityResult, LessonWithBlocks } from "./types";

/**
 * Bygger kontext som AI-assistenten kan använda i prompten.
 *
 * Frontend skickar bara pekare, t.ex. courseId och lessonId.
 * Användarspecifik data ska hämtas i backend.
 */

export const assistantContextModeSchema = z.enum([
  "general",
  "lesson_help",
  "quiz_review",
  "course_recommendation",
]);

export type AssistantContextMode = z.infer<typeof assistantContextModeSchema>;

export const userLearningProfileSchema = z.object({
  userId: z.string(),
  interests: z.array(z.string()).default([]),
  experienceLevel: z.string().optional(),
  focusArea: z.string().optional(),
  preferredLearningStyle: z.string().optional(),
  rawOnboardingData: z.record(z.string(), z.unknown()).optional(),
});

export type UserLearningProfile = z.infer<typeof userLearningProfileSchema>;

export interface UserLearningProfileProvider {
  getUserLearningProfile(userId: string): Promise<UserLearningProfile | null>;
}

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

export const buildAssistantContextInputSchema = z.object({
  userId: z.string(),
  courseId: z.string().optional(),
  lessonId: z.string().optional(),
  currentBlockId: z.string().optional(),
  mode: assistantContextModeSchema.default("general"),
});

export type BuildAssistantContextInput = z.input<
  typeof buildAssistantContextInputSchema
>;

type ParsedBuildAssistantContextInput = z.output<
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
  currentBlockId?: string;
  learningProfile?: UserLearningProfile | null;
  lessonWithBlocks?: LessonWithBlocks | null;
  blockPriorities?: BlockPriorityResult[];
  weakAreas?: AssistantWeakArea[];
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

      const promptContext = formatAssistantPromptContext({
        userId: input.userId,
        mode: input.mode,
        courseId: input.courseId,
        lessonId: input.lessonId,
        currentBlockId: input.currentBlockId,
        learningProfile,
        lessonWithBlocks,
      });

      return {
        userId: input.userId,
        mode: input.mode,
        courseId: input.courseId,
        lessonId: input.lessonId,
        currentBlockId: input.currentBlockId,
        learningProfile,
        lessonWithBlocks,
        promptContext,
      };
    },
  };
}

export type AssistantContextService = ReturnType<
  typeof createAssistantContextService
>;

export const defaultAssistantContextService = createAssistantContextService({
  lessonProvider: defaultLessonProvider,
  userLearningProfileProvider: defaultUserLearningProfileProvider,
});

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

export function formatAssistantPromptContext(
  input: ParsedBuildAssistantContextInput & {
    learningProfile?: UserLearningProfile | null;
    lessonWithBlocks?: LessonWithBlocks | null;
    blockPriorities?: BlockPriorityResult[];
    weakAreas?: AssistantWeakArea[];
  },
): string {
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

  if (input.currentBlockId) {
    lines.push(`Current Block ID: ${input.currentBlockId}`);
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
    "- Gissa aldrig quizresultat, poäng eller progression. Sådan data måste komma från backend.",
  );
  lines.push(
    "- Om frågan gäller ekonomi, lån eller bostad: ge generell utbildande information, inte personlig finansiell rådgivning.",
  );

  return lines.join("\n");
}

function formatLearningProfileForPrompt(profile: UserLearningProfile): string {
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
        area.blockTextPreview ? `preview: ${area.blockTextPreview}` : null,
      ]
        .filter((value): value is string => value !== null)
        .join(", ");
    })
    .join("\n");
}

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