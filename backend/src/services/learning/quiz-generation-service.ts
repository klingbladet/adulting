import { z } from "zod";
import { defaultAiClient, type AiClient } from "../ai/ai-client";
import {
  buildQuizSourceBlocks,
  formatQuizSourceBlocksForPrompt,
  hasQuizEligibleContent,
} from "./block-utils";
import {
  defaultLessonProvider,
  type LessonProvider,
} from "./lesson-provider";
import {
  generatedQuizSchema,
  generateQuizInputSchema,
  generateQuizResultSchema,
  type GeneratedQuiz,
  type GeneratedQuizQuestion,
  type GenerateQuizInput,
  type GenerateQuizResult,
  type LessonWithBlocks,
} from "./types";

/**
 * Quiz generation service.
 *
 * Detta är kärnan för:
 * - MCP tool: generate_quiz_from_lesson_blocks
 * - framtida admin route: POST /api/lessons/:lessonId/generate-quiz
 * - framtida creator-panel knapp: "Generera quiz"
 *
 * Viktigt:
 * Den här filen ska INTE bry sig om ifall lesson-datan kommer från mock eller databas.
 * Den använder LessonProvider för det.
 *
 * Just nu:
 * - genererar quiz som preview
 *
 * Senare:
 * - om saveAsDraft === true ska quizet sparas i quiz-tabellerna
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Byt från MockLessonProvider till DatabaseLessonProvider via env:
 *   LEARNING_LESSON_PROVIDER=database
 *
 * TODO när quiz-tabellerna är klara:
 * - Lägg till QuizRepository eller QuizDraftService
 * - Spara quiz och questions i DB när input.saveAsDraft === true
 * - Returnera riktigt quizId och status: "draft"
 */

export type QuizGenerationServiceDeps = {
  lessonProvider: LessonProvider;
  aiClient: AiClient;
};

export class QuizGenerationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "QuizGenerationError";
  }
}

export function createQuizGenerationService(
  deps: QuizGenerationServiceDeps,
) {
  return {
    /**
     * Genererar quizfrågor från en lessons quizbara blocks.
     *
     * Första MVP-regel:
     * - exakt questionCountPerBlock frågor per quizbart block
     * - varje fråga måste ha blockId
     * - endast multiple choice
     * - fyra svarsalternativ
     */
    async generateFromLessonBlocks(
      rawInput: GenerateQuizInput,
    ): Promise<GenerateQuizResult> {
      const input = generateQuizInputSchema.parse(rawInput);

      const lessonWithBlocks = await deps.lessonProvider.getLessonWithBlocks(
        input.lessonId,
      );

      if (!hasQuizEligibleContent(lessonWithBlocks)) {
        throw new QuizGenerationError(
          `Lesson saknar quizbart innehåll: ${input.lessonId}`,
        );
      }

      const quizSourceBlocks = buildQuizSourceBlocks(lessonWithBlocks);

      const expectedQuestionCount =
        quizSourceBlocks.length * input.questionCountPerBlock;

      const prompt = buildQuizGenerationPrompt({
        lessonWithBlocks,
        questionCountPerBlock: input.questionCountPerBlock,
        language: input.language,
        difficulty: input.difficulty,
      });

      const generatedQuiz = await deps.aiClient.generateJson({
        schema: generatedQuizSchema,
        schemaName: "GeneratedQuiz",
        temperature: 0.2,
        maxTokens: Math.max(2500, expectedQuestionCount * 450),
        messages: [
          {
            role: "system",
            content: buildQuizSystemPrompt(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const validatedQuiz = validateGeneratedQuiz({
        generatedQuiz,
        lessonWithBlocks,
        expectedQuestionCountPerBlock: input.questionCountPerBlock,
      });

      /**
       * Just nu returnerar vi preview.
       *
       * TODO när quiz-tabellerna är klara:
       *
       * if (input.saveAsDraft) {
       *   const savedQuiz = await quizRepository.createDraftQuiz(validatedQuiz);
       *
       *   return {
       *     lessonId: input.lessonId,
       *     quizId: savedQuiz.id,
       *     status: "draft",
       *     questionsCreated: savedQuiz.questions.length,
       *     quiz: savedQuiz.quiz,
       *   };
       * }
       */
      return generateQuizResultSchema.parse({
        lessonId: input.lessonId,
        status: "preview",
        questionsCreated: validatedQuiz.questions.length,
        quiz: validatedQuiz,
      });
    },
  };
}

export type QuizGenerationService = ReturnType<
  typeof createQuizGenerationService
>;

export const defaultQuizGenerationService = createQuizGenerationService({
  lessonProvider: defaultLessonProvider,
  aiClient: defaultAiClient,
});

/**
 * Systemprompt för quizgeneratorn.
 *
 * Den ska vara strikt eftersom vi behöver pålitlig JSON.
 */
function buildQuizSystemPrompt(): string {
  return [
    "Du är en pedagogisk quizgenerator för unga vuxna som lär sig life skills.",
    "",
    "Du skapar quizfrågor baserat på kursmaterial.",
    "",
    "Viktiga regler:",
    "- Returnera endast strikt giltig JSON.",
    "- Använd aldrig markdown.",
    "- Hitta inte på fakta som inte finns i materialet.",
    "- Frågorna ska vara tydliga och pedagogiska.",
    "- Felaktiga alternativ ska vara rimliga men tydligt fel.",
    "- Varje fråga måste ha exakt ett korrekt svar.",
    "- Varje fråga måste vara kopplad till ett blockId.",
    "- Du får inte skapa frågor för block som inte finns i input.",
    "",
    "Ton:",
    "- Enkel och tydlig.",
    "- Anpassad för unga vuxna.",
    "- Undvik akademiskt språk om det inte behövs.",
  ].join("\n");
}

function buildQuizGenerationPrompt(input: {
  lessonWithBlocks: LessonWithBlocks;
  questionCountPerBlock: number;
  language: "sv" | "en";
  difficulty: "easy" | "medium" | "hard";
}): string {
  const { lessonWithBlocks, questionCountPerBlock, language, difficulty } =
    input;

  const quizSourceBlocksText =
    formatQuizSourceBlocksForPrompt(lessonWithBlocks);

  const languageInstruction =
    language === "sv"
      ? "Skriv alla frågor, svarsalternativ och förklaringar på svenska."
      : "Write all questions, answer options and explanations in English.";

  const difficultyInstruction =
    difficulty === "easy"
      ? "Svårighetsgrad: lätt. Frågorna ska kontrollera grundläggande förståelse."
      : difficulty === "hard"
        ? "Svårighetsgrad: svår. Frågorna får kräva mer reflektion, men måste fortfarande gå att besvara från materialet."
        : "Svårighetsgrad: medium. Frågorna ska testa både förståelse och viktiga detaljer.";

  return [
    `Lektion: ${lessonWithBlocks.lesson.title}`,
    lessonWithBlocks.lesson.description
      ? `Beskrivning: ${lessonWithBlocks.lesson.description}`
      : null,
    "",
    languageInstruction,
    difficultyInstruction,
    "",
    "Uppgift:",
    `Skapa exakt ${questionCountPerBlock} multiple choice-frågor per block nedan.`,
    "",
    "Regler:",
    "- Varje fråga måste ha samma blockId som blocket den baseras på.",
    "- Skapa inga frågor från andra block än de som listas nedan.",
    "- Använd context heading endast som hjälp för att förstå blocket.",
    "- Frågan ska baseras på blockets content.",
    "- Varje fråga ska ha exakt fyra svarsalternativ: A, B, C och D.",
    "- correctOptionId ska vara ett av: A, B, C eller D.",
    "- explanation ska kort förklara varför rätt svar är rätt.",
    "- Returnera endast JSON i exakt format.",
    "",
    "JSON-format:",
    JSON.stringify(
      {
        lessonId: lessonWithBlocks.lesson.id,
        title: `Quiz: ${lessonWithBlocks.lesson.title}`,
        questions: [
          {
            blockId: "block_id_here",
            type: "multiple_choice",
            question: "Frågetext här?",
            options: [
              {
                id: "A",
                text: "Svarsalternativ A",
              },
              {
                id: "B",
                text: "Svarsalternativ B",
              },
              {
                id: "C",
                text: "Svarsalternativ C",
              },
              {
                id: "D",
                text: "Svarsalternativ D",
              },
            ],
            correctOptionId: "A",
            explanation: "Kort förklaring.",
          },
        ],
      },
      null,
      2,
    ),
    "",
    "Block att skapa frågor från:",
    quizSourceBlocksText,
  ]
    .filter((value): value is string => value !== null)
    .join("\n");
}

/**
 * Extra validering ovanpå Zod.
 *
 * Zod kontrollerar struktur.
 * Här kontrollerar vi domänregler:
 *
 * - lessonId måste matcha
 * - varje fråga måste peka på ett quizbart block
 * - varje quizbart block ska ha exakt N frågor
 * - option IDs ska vara A, B, C, D
 */
export function validateGeneratedQuiz(input: {
  generatedQuiz: GeneratedQuiz;
  lessonWithBlocks: LessonWithBlocks;
  expectedQuestionCountPerBlock: number;
}): GeneratedQuiz {
  const { generatedQuiz, lessonWithBlocks, expectedQuestionCountPerBlock } =
    input;

  if (generatedQuiz.lessonId !== lessonWithBlocks.lesson.id) {
    throw new QuizGenerationError(
      [
        "AI genererade quiz med fel lessonId.",
        `Expected: ${lessonWithBlocks.lesson.id}`,
        `Got: ${generatedQuiz.lessonId}`,
      ].join(" "),
    );
  }

  const quizSourceBlocks = buildQuizSourceBlocks(lessonWithBlocks);

  const allowedBlockIds = new Set(quizSourceBlocks.map((block) => block.id));

  const invalidQuestion = generatedQuiz.questions.find(
    (question) => !allowedBlockIds.has(question.blockId),
  );

  if (invalidQuestion) {
    throw new QuizGenerationError(
      [
        "AI genererade en fråga med ogiltigt blockId.",
        `Invalid blockId: ${invalidQuestion.blockId}`,
      ].join(" "),
    );
  }

  for (const question of generatedQuiz.questions) {
    validateQuestionOptions(question);
  }

  const questionCountByBlock = countQuestionsByBlock(generatedQuiz.questions);

  const missingOrWrongCountBlocks = quizSourceBlocks
    .map((block) => {
      const count = questionCountByBlock.get(block.id) ?? 0;

      return {
        blockId: block.id,
        count,
      };
    })
    .filter((result) => result.count !== expectedQuestionCountPerBlock);

  if (missingOrWrongCountBlocks.length > 0) {
    throw new QuizGenerationError(
      [
        "AI genererade fel antal frågor för ett eller flera block.",
        `Expected per block: ${expectedQuestionCountPerBlock}.`,
        `Result: ${JSON.stringify(missingOrWrongCountBlocks)}`,
      ].join(" "),
    );
  }

  return generatedQuizSchema.parse({
    ...generatedQuiz,
    title: generatedQuiz.title || `Quiz: ${lessonWithBlocks.lesson.title}`,
  });
}

function validateQuestionOptions(question: GeneratedQuizQuestion): void {
  const optionIds = question.options.map((option) => option.id).sort();

  const expectedOptionIds = ["A", "B", "C", "D"];

  const hasExpectedOptionIds =
    optionIds.length === expectedOptionIds.length &&
    optionIds.every((optionId, index) => optionId === expectedOptionIds[index]);

  if (!hasExpectedOptionIds) {
    throw new QuizGenerationError(
      [
        "AI genererade en fråga med ogiltiga option IDs.",
        `Question: ${question.question}`,
        `Expected: A, B, C, D.`,
        `Got: ${optionIds.join(", ")}`,
      ].join(" "),
    );
  }

  const correctOptionExists = question.options.some(
    (option) => option.id === question.correctOptionId,
  );

  if (!correctOptionExists) {
    throw new QuizGenerationError(
      [
        "AI genererade en fråga där correctOptionId inte finns bland alternativen.",
        `Question: ${question.question}`,
        `correctOptionId: ${question.correctOptionId}`,
      ].join(" "),
    );
  }

  const uniqueOptionTexts = new Set(
    question.options.map((option) => option.text.trim().toLowerCase()),
  );

  if (uniqueOptionTexts.size !== question.options.length) {
    throw new QuizGenerationError(
      [
        "AI genererade dubbla svarsalternativ i en fråga.",
        `Question: ${question.question}`,
      ].join(" "),
    );
  }
}

function countQuestionsByBlock(
  questions: GeneratedQuizQuestion[],
): Map<string, number> {
  const countByBlock = new Map<string, number>();

  for (const question of questions) {
    countByBlock.set(
      question.blockId,
      (countByBlock.get(question.blockId) ?? 0) + 1,
    );
  }

  return countByBlock;
}

/**
 * Liten helper för debug/demo.
 *
 * Kan användas i en route eller script för att snabbt se om quiz-generation fungerar.
 *
 * TODO senare:
 * Flytta gärna demo/test helpers till egen testfil när flödet är stabilt.
 */
export async function generateMockBolaneQuizPreview() {
  return defaultQuizGenerationService.generateFromLessonBlocks({
    lessonId: "lesson_bolan_001",
    questionCountPerBlock: 2,
    language: "sv",
    difficulty: "medium",
    saveAsDraft: false,
  });
}

/**
 * Exporterat schema för eventuella API-routes/MCP-tools.
 *
 * Bra om ni vill validera input innan ni anropar servicen.
 */
export const quizGenerationRequestSchema = generateQuizInputSchema;

/**
 * Exporterat response-schema.
 *
 * Bra om ni vill validera response i tester.
 */
export const quizGenerationResponseSchema = generateQuizResultSchema;

/**
 * Enkel typ för request body i framtida API-route.
 */
export type QuizGenerationRequest = z.infer<
  typeof quizGenerationRequestSchema
>;