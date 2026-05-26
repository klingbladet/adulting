# Lessonbuilder Contract for AI/MCP Quiz Flow

## Syfte

Det här dokumentet beskriver vad lessonbuilder-teamet behöver leverera för att AI/MCP-lagret ska kunna kopplas på.

Målet är att vi ska kunna:

1. Skapa lektioner i block.
2. Generera quizfrågor med AI från varje quizbart block.
3. Koppla varje quizfråga tillbaka till rätt `blockId`.
4. Använda elevens quizsvar för att prioritera vilka block eleven bör läsa extra noga.
5. Göra AI-assistenten smartare genom att ge den lesson context.

---

## Övergripande flöde

```txt
Expert skapar lesson blocks
  ↓
AI genererar quizfrågor per block
  ↓
Quizfrågor sparas som draft/preview
  ↓
Elev gör förkunskapsquiz
  ↓
Svar kopplas till blockId
  ↓
Systemet räknar block priority
  ↓
Lektionen markeras/personifieras
```

---

## Viktigaste kravet

Varje lesson block måste ha ett stabilt `id`.

Det betyder:

- Ett block får inte få nytt id varje gång lektionen sparas.
- Om experten ändrar texten i blocket ska `block.id` vara samma.
- Quizfrågor, elevsvar och prioritering bygger på kopplingen till `blockId`.

Utan stabila blockId fungerar inte personaliseringen.

---

## Format som AI/MCP-lagret förväntar sig

Backend ska kunna returnera en lektion i detta format:

```ts
type LessonWithBlocks = {
  lesson: {
    id: string;
    courseId: string;
    title: string;
    description?: string;
  };
  blocks: LessonBlock[];
};

type LessonBlock = {
  id: string;
  lessonId: string;
  type: "heading" | "text" | "image" | "video" | "code" | "quote";
  order: number;
  content: {
    text?: string;
    url?: string;
    alt?: string;
    caption?: string;
    transcript?: string;
    code?: string;
    language?: string;
  };
  quizEligible?: boolean;
};
```

---

## Rekommenderade blocktyper

### heading

Används som kontext, men genererar normalt inte frågor.

```ts
{
  id: "block_1",
  lessonId: "lesson_1",
  type: "heading",
  order: 1,
  content: { text: "Vad är ett bolån?" },
  quizEligible: false
}
```

### text

Primär blocktyp för quizgenerering.

```ts
{
  id: "block_2",
  lessonId: "lesson_1",
  type: "text",
  order: 2,
  content: { text: "Ett bolån är ett lån som används för att köpa en bostad..." },
  quizEligible: true
}
```

### video

Kan generera quiz om det finns `transcript`.

```ts
{
  id: "block_3",
  lessonId: "lesson_1",
  type: "video",
  order: 3,
  content: {
    url: "https://example.com/video",
    transcript: "Ett lånelöfte är ett besked från banken..."
  },
  quizEligible: true
}
```

### image

Bör normalt inte generera frågor i MVP, men kan användas som kontext om det finns `alt` eller `caption`.

```ts
{
  id: "block_4",
  lessonId: "lesson_1",
  type: "image",
  order: 4,
  content: {
    url: "https://example.com/image.png",
    alt: "Illustration över kontantinsats och bolån",
    caption: "Exempel på hur en bostad finansieras."
  },
  quizEligible: false
}
```

---

## Quizbara block

AI/MCP-lagret skapar i MVP frågor från:

- `text`
- `quote`
- `video` med `transcript`
- eventuellt `code`

AI/MCP-lagret skapar normalt inte frågor från:

- `heading`
- `image`
- tomma/korta block
- video utan transcript
- layout/divider/button-blocks

---

## Backend endpoints som behövs

Minsta endpoints lessonteamet/backendteamet bör kunna leverera:

```txt
POST   /api/courses/:courseId/lessons
GET    /api/lessons/:lessonId
PATCH  /api/lessons/:lessonId
POST   /api/lessons/:lessonId/blocks
PATCH  /api/lesson-blocks/:blockId
DELETE /api/lesson-blocks/:blockId
PATCH  /api/lessons/:lessonId/blocks/reorder
```

Det viktigaste för AI/MCP-lagret är:

```txt
GET /api/lessons/:lessonId
```

Den måste kunna returnera:

```ts
LessonWithBlocks
```

---

## Databaskrav

Föreslagen minsta modell:

```txt
lessons
lesson_blocks
quizzes
quiz_questions
quiz_attempts
quiz_answers
```

### lessons

Behöver minst:

```txt
id
courseId
title
description
order
status
createdAt
updatedAt
```

### lesson_blocks

Behöver minst:

```txt
id
lessonId
type
order
content
quizEligible
createdAt
updatedAt
```

`content` kan vara JSON/JSONB.

### quiz_questions

Måste innehålla:

```txt
id
quizId
lessonId
blockId
type
question
options
correctOptionId
explanation
```

Viktigast:

```txt
quiz_questions.blockId
```

### quiz_answers

Måste innehålla:

```txt
attemptId
questionId
blockId
selectedOptionId
isCorrect
```

Viktigast:

```txt
quiz_answers.blockId
```

---

## Hur AI/MCP-lagret fungerar just nu

Det finns redan mockad lesson-data i backend:

```txt
lesson_bolan_001
lesson_hyreskontrakt_001
```

AI/MCP-lagret förväntar sig att riktig databasdata senare kan returneras i samma format.

Just nu finns:

```txt
backend/src/services/learning/types.ts
backend/src/services/learning/mock-lessons.ts
backend/src/services/learning/lesson-provider.ts
backend/src/services/learning/block-utils.ts
backend/src/services/learning/priority-service.ts
backend/src/services/ai/ai-client.ts
backend/src/services/learning/quiz-generation-service.ts
backend/src/services/learning/assistant-context-service.ts
backend/src/mcp/create-mcp-server.ts
backend/src/mcp/http-server.ts
backend/src/api/routes/learning-routes.ts
```

När lessonbuildern är redo ska vi byta från:

```txt
MockLessonProvider
```

till:

```txt
DatabaseLessonProvider
```

Målet är att resten av AI/MCP-koden inte ska behöva ändras.

---

## Environment switch

Just nu används mock provider som default:

```txt
LEARNING_LESSON_PROVIDER=mock
```

När lessonbuilder och databastabeller är klara kan vi byta till:

```txt
LEARNING_LESSON_PROVIDER=database
```

Då behöver `DatabaseLessonProvider` implementeras i:

```txt
backend/src/services/learning/lesson-provider.ts
```

---

## AI-genererat quiz

AI:n genererar quiz i detta format:

```ts
type GeneratedQuiz = {
  lessonId: string;
  title: string;
  questions: {
    blockId: string;
    type: "multiple_choice";
    question: string;
    options: {
      id: "A" | "B" | "C" | "D";
      text: string;
    }[];
    correctOptionId: "A" | "B" | "C" | "D";
    explanation: string;
  }[];
};
```

Regel:

```txt
Varje fråga måste ha blockId.
```

---

## Prioritering efter quiz

Första MVP-regeln:

```txt
0/2 rätt på ett block → high priority
1/2 rätt på ett block → medium priority
2/2 rätt på ett block → low priority
```

Detta används för att visa:

```txt
Läs extra noga
Repetera gärna
Det här verkar du kunna
```

---

## Frontend demo just nu

Det finns demo-komponenter:

```txt
frontend/components/learning/generate-quiz-panel.tsx
frontend/components/learning/block-priority-demo-panel.tsx
frontend/components/learning/learning-demo-panel.tsx
```

De kan användas med mock lesson ids:

```tsx
<LearningDemoPanel />
```

eller:

```tsx
<GenerateQuizPanel lessonId="lesson_bolan_001" />
<BlockPriorityDemoPanel lessonId="lesson_bolan_001" />
```

---

## Vad lessonteamet behöver tänka på

### Måste

- Spara lessons som block.
- Varje block måste ha stabilt id.
- Varje block måste ha `order`.
- Varje block måste ha `type`.
- Varje block måste ha `content`.
- Text/video/caption-data måste vara läsbar av AI.
- Video behöver transcript/summary om den ska quizas.
- Backend måste kunna returnera `LessonWithBlocks`.

### Bör

- Låta experten sätta `quizEligible`.
- Låta experten reordna blocks.
- Låta experten redigera blocks utan att id byts.
- Stödja draft/published för lessons.
- Stödja draft/published för quiz.

### Kan vänta

- Avancerad omordning av lektioner.
- Flera frågetyper.
- Automatisk publicering.
- Avancerad scoring.
- Full kursrekommendation från onboarding.

---

## Viktig produktregel

AI ska skapa quiz som draft/preview.

En expert ska godkänna innan quizet publiceras.

Det är extra viktigt eftersom tjänsten handlar om life skills som ekonomi, boende och lån.

---

## Sammanfattning

För att AI/MCP-lagret ska kunna kopplas på behöver lessonteamet främst leverera:

```txt
LessonWithBlocks
stabila blockId
quizbara textblock
video transcript om video ska quizas
API/DB som kan hämta lesson + blocks
```

När detta finns kan vi byta från mockad data till riktig data utan att bygga om MCP/AI-lagret.