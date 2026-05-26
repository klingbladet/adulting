import type { LessonWithBlocks } from "./types";

/**
 * Mock lessons for local AI/MCP development.
 *
 * Den här filen gör att vi kan bygga MCP, quiz-generator och AI-assistent
 * innan lessonbuilder-teamet har kopplat riktig lesson/block-data till databasen.
 *
 * Viktigt:
 * Detta är INTE tänkt som slutgiltig data.
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * - Ersätt mockLessonsById med en DatabaseLessonProvider.
 * - Säkerställ att riktiga lesson blocks returneras i samma format som LessonWithBlocks.
 * - Säkerställ att block.id är stabilt och inte återskapas vid varje save.
 */

export const mockBolaneLesson: LessonWithBlocks = {
  lesson: {
    id: "lesson_bolan_001",
    courseId: "course_bostad_001",
    title: "Förstå bolån",
    description:
      "En introduktion till hur bolån, ränta, amortering och kontantinsats fungerar.",
  },
  blocks: [
    {
      id: "block_bolan_heading_001",
      lessonId: "lesson_bolan_001",
      type: "heading",
      order: 1,
      content: {
        text: "Vad är ett bolån?",
      },
      /**
       * Heading används som kontext för AI:n,
       * men vi genererar normalt inte quizfrågor direkt från en rubrik.
       */
      quizEligible: false,
    },
    {
      id: "block_bolan_text_001",
      lessonId: "lesson_bolan_001",
      type: "text",
      order: 2,
      content: {
        text:
          "Ett bolån är ett lån som används för att köpa en bostad. " +
          "Bostaden fungerar ofta som säkerhet för banken. Det betyder att banken kan ha rätt att sälja bostaden om lånet inte betalas tillbaka enligt avtalet.",
      },
      quizEligible: true,
    },
    {
      id: "block_bolan_text_002",
      lessonId: "lesson_bolan_001",
      type: "text",
      order: 3,
      content: {
        text:
          "Ränta är kostnaden du betalar för att få låna pengar. " +
          "Om räntan är hög blir månadskostnaden högre. Om räntan är låg blir månadskostnaden lägre. " +
          "Räntan kan vara bunden under en viss period eller rörlig och ändras över tid.",
      },
      quizEligible: true,
    },
    {
      id: "block_bolan_text_003",
      lessonId: "lesson_bolan_001",
      type: "text",
      order: 4,
      content: {
        text:
          "Amortering betyder att du betalar tillbaka på själva lånet. " +
          "När du amorterar minskar din skuld. Ränta är alltså kostnaden för lånet, medan amortering är återbetalning av lånet.",
      },
      quizEligible: true,
    },
    {
      id: "block_bolan_text_004",
      lessonId: "lesson_bolan_001",
      type: "text",
      order: 5,
      content: {
        text:
          "Kontantinsats är den del av bostadens pris som du behöver betala med egna pengar. " +
          "I Sverige behöver du vanligtvis ha minst 15 procent av bostadens pris som kontantinsats. " +
          "Resten kan ofta finansieras med bolån, om banken godkänner din ekonomi.",
      },
      quizEligible: true,
    },
    {
      id: "block_bolan_video_001",
      lessonId: "lesson_bolan_001",
      type: "video",
      order: 6,
      content: {
        url: "https://example.com/videos/lanelofte-intro",
        transcript:
          "Ett lånelöfte är ett besked från banken om ungefär hur mycket du kan få låna. " +
          "Det är inte samma sak som ett färdigt lån, men det hjälper dig att veta vilken prisklass du kan leta bostad i.",
      },
      /**
       * Video kan vara quizbar om det finns transcript eller summary.
       *
       * TODO när riktiga videoblock finns:
       * AI:n ska inte generera frågor från en video-url utan transcript/summary.
       */
      quizEligible: true,
    },
    {
      id: "block_bolan_image_001",
      lessonId: "lesson_bolan_001",
      type: "image",
      order: 7,
      content: {
        url: "https://example.com/images/bolan-overview.png",
        alt: "Illustration över hur bostadens pris delas upp i kontantinsats och bolån.",
        caption:
          "Exempel: Om bostaden kostar 2 000 000 kr behöver 15 procent, alltså 300 000 kr, ofta betalas som kontantinsats.",
      },
      /**
       * Bildblock kan eventuellt bli quizbara om de har tydlig alt-text/caption.
       * I MVP låter vi quiz-generatorn fokusera på text och video transcript.
       */
      quizEligible: false,
    },
  ],
};

export const mockHyreskontraktLesson: LessonWithBlocks = {
  lesson: {
    id: "lesson_hyreskontrakt_001",
    courseId: "course_bostad_001",
    title: "Förstå hyreskontrakt",
    description:
      "En enkel genomgång av vad ett hyreskontrakt är och vad unga vuxna bör kontrollera innan de skriver på.",
  },
  blocks: [
    {
      id: "block_hyra_heading_001",
      lessonId: "lesson_hyreskontrakt_001",
      type: "heading",
      order: 1,
      content: {
        text: "Vad är ett hyreskontrakt?",
      },
      quizEligible: false,
    },
    {
      id: "block_hyra_text_001",
      lessonId: "lesson_hyreskontrakt_001",
      type: "text",
      order: 2,
      content: {
        text:
          "Ett hyreskontrakt är ett avtal mellan dig och hyresvärden. " +
          "I kontraktet står det bland annat vilken bostad du hyr, vad hyran kostar, när hyran ska betalas och vilka regler som gäller.",
      },
      quizEligible: true,
    },
    {
      id: "block_hyra_text_002",
      lessonId: "lesson_hyreskontrakt_001",
      type: "text",
      order: 3,
      content: {
        text:
          "Innan du skriver på bör du kontrollera att hyresvärdens namn, adress, hyra, uppsägningstid och inflyttningsdatum stämmer. " +
          "Du bör också kontrollera vad som ingår i hyran, till exempel el, internet eller vatten.",
      },
      quizEligible: true,
    },
    {
      id: "block_hyra_text_003",
      lessonId: "lesson_hyreskontrakt_001",
      type: "text",
      order: 4,
      content: {
        text:
          "Deposition är pengar som hyresvärden ibland vill att du betalar innan du flyttar in. " +
          "Pengarna kan användas om något går sönder eller om hyran inte betalas. Det är viktigt att få skriftligt kvitto på depositionen.",
      },
      quizEligible: true,
    },
    {
      id: "block_hyra_quote_001",
      lessonId: "lesson_hyreskontrakt_001",
      type: "quote",
      order: 5,
      content: {
        text: "Skriv aldrig på ett avtal du inte förstår. Be om hjälp om något känns oklart.",
      },
      quizEligible: true,
    },
  ],
};

/**
 * Samlad mock-datakälla.
 *
 * MCP/AI-lagret kan använda dessa IDs direkt under utveckling:
 *
 * - lesson_bolan_001
 * - lesson_hyreskontrakt_001
 *
 * TODO när lessonbuilder-teamet är ikapp:
 * Den här mapen ska inte användas i produktion.
 * Byt till DatabaseLessonProvider som hämtar från riktiga tabeller.
 */
export const mockLessonsById: Record<string, LessonWithBlocks> = {
  [mockBolaneLesson.lesson.id]: mockBolaneLesson,
  [mockHyreskontraktLesson.lesson.id]: mockHyreskontraktLesson,
};

/**
 * Hämtar en mockad lektion.
 *
 * Vi returnerar en kopia med sorterade blocks för att:
 * - undvika mutationer av mock-datan
 * - säkerställa stabil ordning
 *
 * TODO när riktig databas används:
 * Motsvarande funktion ska hämta lesson och blocks via Drizzle/Postgres.
 */
export function getMockLessonWithBlocks(
  lessonId: string,
): LessonWithBlocks | null {
  const lessonWithBlocks = mockLessonsById[lessonId];

  if (!lessonWithBlocks) {
    return null;
  }

  return {
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
}

/**
 * Returnerar alla mockade lektioner.
 *
 * Bra för:
 * - lokal testning
 * - MCP Inspector
 * - enklare debug routes
 * - demo innan DB är redo
 */
export function listMockLessons(): LessonWithBlocks[] {
  return Object.keys(mockLessonsById)
    .map((lessonId) => getMockLessonWithBlocks(lessonId))
    .filter((lesson): lesson is LessonWithBlocks => lesson !== null);
}