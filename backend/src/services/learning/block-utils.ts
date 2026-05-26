import type { LessonBlock, LessonWithBlocks } from "./types";

/**
 * Utilities for working with lesson blocks.
 *
 * Den här filen är viktig eftersom AI:n inte ska få rå blockdata helt osorterat.
 *
 * Vi behöver:
 * - filtrera bort block som inte går att skapa quiz från
 * - skapa ren text från varje block
 * - behålla blockId så quizfrågor kan kopplas tillbaka till rätt block
 * - använda headings som kontext, utan att skapa frågor direkt från headings
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * Kontrollera att deras blocktyper mappas korrekt här.
 * Om de lägger till nya blocktyper, exempelvis "checklist", "table" eller "accordion",
 * ska de hanteras i getBlockTextForAi() och isQuizEligibleBlock().
 */

const MIN_TEXT_LENGTH_FOR_QUIZ = 40;

/**
 * Ett block i AI-vänligt format.
 *
 * Det här är formatet vi skickar vidare till quiz-generatorn.
 *
 * Skillnaden mot LessonBlock är att:
 * - textForAi är normaliserad och enkel att läsa
 * - contextHeading kan innehålla närmast föregående rubrik
 * - shouldGenerateQuestions styr om quiz-generatorn ska skapa frågor från blocket
 */
export type AiReadableLessonBlock = {
  id: string;
  lessonId: string;
  type: LessonBlock["type"];
  order: number;
  textForAi: string;
  contextHeading?: string;
  shouldGenerateQuestions: boolean;
};

/**
 * Normaliserar text för AI-promptar.
 *
 * Exempel:
 * "Hej    detta\när text" -> "Hej detta är text"
 */
export function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

/**
 * Hämtar primär text från ett block.
 *
 * Olika blocktyper har olika textfält:
 *
 * text:
 *   content.text
 *
 * heading:
 *   content.text
 *
 * quote:
 *   content.text
 *
 * video:
 *   content.transcript
 *
 * image:
 *   content.caption + content.alt
 *
 * code:
 *   content.code
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * Om video-block senare får "summary" i stället för "transcript",
 * lägg till det här.
 */
export function getBlockTextForAi(block: LessonBlock): string {
  const content = block.content;

  switch (block.type) {
    case "heading": {
      return normalizeText(content.text);
    }

    case "text": {
      return normalizeText(content.text);
    }

    case "quote": {
      return normalizeText(content.text);
    }

    case "video": {
      /**
       * Viktigt:
       * AI:n kan inte förstå en video-url.
       * För att video ska vara användbar behöver vi transcript eller summary.
       */
      return normalizeText(content.transcript);
    }

    case "image": {
      /**
       * Bildblock är svårare.
       * I MVP genererar vi normalt inte quiz från bilder,
       * men caption/alt kan användas som kontext.
       */
      const caption = normalizeText(content.caption);
      const alt = normalizeText(content.alt);

      return [caption, alt].filter(Boolean).join(" ");
    }

    case "code": {
      const code = normalizeText(content.code);
      const language = normalizeText(content.language);

      if (!code) {
        return "";
      }

      return language ? `Kodspråk: ${language}. Kod: ${code}` : `Kod: ${code}`;
    }

    default: {
      /**
       * Detta ska normalt aldrig hända eftersom block.type valideras med Zod.
       */
      return "";
    }
  }
}

/**
 * Avgör om ett block kan vara användbart som kontext.
 *
 * Exempel:
 * - heading: bra kontext
 * - image caption: kan vara kontext
 * - kort text: kan vara kontext men kanske inte quizbar
 */
export function isUsefulContextBlock(block: LessonBlock): boolean {
  return getBlockTextForAi(block).length > 0;
}

/**
 * Avgör om quiz-generatorn ska skapa frågor från blocket.
 *
 * Grundregel:
 * - text, quote, video med transcript och code kan vara quizbara
 * - heading används som kontext, men får inte egna frågor
 * - image används normalt inte för quiz i MVP
 *
 * block.quizEligible kan användas av lessonbuildern för att styra detta.
 *
 * Viktigt:
 * Även om quizEligible är true måste blocket ha tillräckligt med text.
 */
export function isQuizEligibleBlock(block: LessonBlock): boolean {
  if (block.quizEligible === false) {
    return false;
  }

  const textForAi = getBlockTextForAi(block);

  if (textForAi.length < MIN_TEXT_LENGTH_FOR_QUIZ) {
    return false;
  }

  if (block.type === "heading") {
    return false;
  }

  if (block.type === "image") {
    /**
     * MVP-beslut:
     * Vi skapar inte quizfrågor direkt från bilder ännu.
     *
     * TODO senare:
     * Om bilder får bra pedagogiska captions kan detta ändras till:
     *
     * return block.quizEligible === true && textForAi.length >= MIN_TEXT_LENGTH_FOR_QUIZ;
     */
    return false;
  }

  if (block.type === "video") {
    /**
     * Video är bara quizbar om den har transcript.
     */
    return Boolean(normalizeText(block.content.transcript));
  }

  if (block.type === "code") {
    return Boolean(normalizeText(block.content.code));
  }

  return block.type === "text" || block.type === "quote";
}

/**
 * Returnerar endast blocks som quiz-generatorn ska skapa frågor från.
 */
export function getQuizEligibleBlocks(blocks: LessonBlock[]): LessonBlock[] {
  return blocks
    .filter(isQuizEligibleBlock)
    .sort((a, b) => a.order - b.order);
}

/**
 * Bygger AI-vänliga blocks från en lektion.
 *
 * Den håller reda på närmast föregående heading och lägger den som contextHeading.
 *
 * Exempel:
 *
 * blocks:
 * 1. heading: "Ränta och amortering"
 * 2. text: "Ränta är kostnaden..."
 *
 * blir:
 *
 * {
 *   id: "...",
 *   textForAi: "Ränta är kostnaden...",
 *   contextHeading: "Ränta och amortering"
 * }
 */
export function buildAiReadableBlocks(
  lessonWithBlocks: LessonWithBlocks,
): AiReadableLessonBlock[] {
  let currentHeading: string | undefined;

  return lessonWithBlocks.blocks
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((block) => {
      const textForAi = getBlockTextForAi(block);

      if (block.type === "heading" && textForAi) {
        currentHeading = textForAi;
      }

      return {
        id: block.id,
        lessonId: block.lessonId,
        type: block.type,
        order: block.order,
        textForAi,
        contextHeading: block.type === "heading" ? undefined : currentHeading,
        shouldGenerateQuestions: isQuizEligibleBlock(block),
      };
    });
}

/**
 * Bygger de blocks som ska skickas till quiz-generatorn.
 *
 * Här ingår bara block där shouldGenerateQuestions är true.
 *
 * Rubriker följer med indirekt genom contextHeading.
 */
export function buildQuizSourceBlocks(
  lessonWithBlocks: LessonWithBlocks,
): AiReadableLessonBlock[] {
  return buildAiReadableBlocks(lessonWithBlocks).filter(
    (block) => block.shouldGenerateQuestions,
  );
}

/**
 * Skapar en kompakt textrepresentation av en lektion.
 *
 * Denna kan användas i AI-assistentens context prompt.
 *
 * Exempel:
 *
 * Lektion: Förstå bolån
 *
 * [1] Vad är ett bolån?
 * [2] Ett bolån är...
 * [3] Ränta är...
 */
export function formatLessonForAssistantContext(
  lessonWithBlocks: LessonWithBlocks,
): string {
  const sortedBlocks = lessonWithBlocks.blocks
    .slice()
    .sort((a, b) => a.order - b.order);

  const blockTexts = sortedBlocks
    .map((block) => {
      const text = getBlockTextForAi(block);

      if (!text) {
        return null;
      }

      return `[${block.order}] ${text}`;
    })
    .filter((value): value is string => value !== null);

  return [
    `Lektion: ${lessonWithBlocks.lesson.title}`,
    lessonWithBlocks.lesson.description
      ? `Beskrivning: ${lessonWithBlocks.lesson.description}`
      : null,
    "",
    ...blockTexts,
  ]
    .filter((value): value is string => value !== null)
    .join("\n");
}

/**
 * Skapar en kompakt textrepresentation för quiz-prompten.
 *
 * Denna är mer strikt än assistant context.
 *
 * Här vill vi vara tydliga med:
 * - blockId
 * - heading/context
 * - exakt vilket innehåll frågorna får baseras på
 */
export function formatQuizSourceBlocksForPrompt(
  lessonWithBlocks: LessonWithBlocks,
): string {
  const sourceBlocks = buildQuizSourceBlocks(lessonWithBlocks);

  return sourceBlocks
    .map((block) => {
      return [
        `Block ID: ${block.id}`,
        `Block type: ${block.type}`,
        `Order: ${block.order}`,
        block.contextHeading ? `Context heading: ${block.contextHeading}` : null,
        `Content: ${block.textForAi}`,
      ]
        .filter((value): value is string => value !== null)
        .join("\n");
    })
    .join("\n\n---\n\n");
}

/**
 * Hjälpfunktion för att snabbt kontrollera om en lektion överhuvudtaget
 * har något quizbart innehåll.
 */
export function hasQuizEligibleContent(
  lessonWithBlocks: LessonWithBlocks,
): boolean {
  return buildQuizSourceBlocks(lessonWithBlocks).length > 0;
}