import { Course, Block, Category } from "@/types/types";
import { CourseQuiz, CourseQuizQuestion } from "@/lib/api";

export const demoCategories: Category[] = [
  { id: "1", name: "Boende", iconName: "Home" },
  { id: "2", name: "Ekonomi", iconName: "Wallet" },
  { id: "3", name: "Jobb & Karriär", iconName: "Briefcase" },
  { id: "4", name: "Vardagsjuridik", iconName: "Scale" },
];

export const demoCourses: Course[] = [
  {
    id: 1,
    title: "Hitta din första bostad",
    author: "Adulting Team",
    categoryId: "1",
    category: { id: "1", name: "Boende", iconName: "Home" },
    time: 25,
    blocks: 6,
    status: "published",
    isPublished: true,
    textContent:
      "Vi hjälper dig genom hela processen, från bostadsköer och andrahandskontrakt till besiktning och hemförsäkring.",
    imageUrl: null,
    videoUrl: null,
    userId: "demo-user-1",
    enrollments: [
      {
        id: "enrollment-1",
        userId: "demo-user-1",
        courseId: 1,
        status: "in_progress",
        knowledgeLevel: "beginner",
        enrolledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        completedAt: null,
        score: 80,
      },
    ],
  },
  {
    id: 2,
    title: "Privatekonomi & Budget",
    author: "Adulting Team",
    categoryId: "2",
    category: { id: "2", name: "Ekonomi", iconName: "Wallet" },
    time: 30,
    blocks: 5,
    status: "published",
    isPublished: true,
    textContent:
      "Lär dig lägga en hållbar budget, förstå räntor, bygga en buffert och undvika dyra konsumtionslån.",
    imageUrl: null,
    videoUrl: null,
    userId: "demo-user-1",
    enrollments: [
      {
        id: "enrollment-2",
        userId: "demo-user-1",
        courseId: 2,
        status: "completed",
        knowledgeLevel: "intermediate",
        enrolledAt: new Date(Date.now() - 86400000 * 14).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        score: 100,
      },
    ],
  },
  {
    id: 3,
    title: "Första jobbet & Anställningsavtal",
    author: "Adulting Team",
    categoryId: "3",
    category: { id: "3", name: "Jobb & Karriär", iconName: "Briefcase" },
    time: 20,
    blocks: 4,
    status: "published",
    isPublished: true,
    textContent:
      "Förstå dina rättigheter, kollektivavtal, provanställning, semesterersättning och vad som faktiskt står i ditt lönebesked.",
    imageUrl: null,
    videoUrl: null,
    userId: "demo-user-1",
    enrollments: [],
  },
  {
    id: 4,
    title: "Deklaration & Skatter utan panik",
    author: "Adulting Team",
    categoryId: "2",
    category: { id: "2", name: "Ekonomi", iconName: "Wallet" },
    time: 15,
    blocks: 4,
    status: "published",
    isPublished: true,
    textContent:
      "Så fungerar skatt i Sverige: skillnaden på brutto och netto, jämkning, reseavdrag och hur du godkänner deklarationen i mobilen.",
    imageUrl: null,
    videoUrl: null,
    userId: "demo-user-1",
    enrollments: [],
  },
];

export const demoBlocks: Record<number, Block[]> = {
  1: [
    {
      id: 101,
      courseId: 1,
      orderIndex: 1,
      title: "Förstå bostadsmarknaden",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Att hitta sin första bostad kan kännas överväldigande. I Sverige skiljer vi främst på tre boendeformer: hyresrätt, bostadsrätt och andrahandskontrakt. Förstahandskontrakt har ofta långa kötider i större städer, vilket gör att många unga vuxna börjar med att hyra i andra hand eller dela boende med andra.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 102,
      courseId: 1,
      orderIndex: 2,
      title: "Sök bostad & Kösystem",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Ställ dig i kommunala och privata bostadsköer så tidigt som möjligt — gärna så fort du fyller 18! När du söker andrahand är det viktigt att vara snabb, ha referenser redo och aldrig betala deposition i förskott innan du sett lägenheten och verifierat att uthyraren har tillstånd från hyresvärden.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 103,
      courseId: 1,
      orderIndex: 3,
      title: "Läs kontraktet & Besittningsskydd",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Vad ska egentligen stå i ett hyreskontrakt? Kontrollera alltid uppsägningstid (oftast 3 månader för förstahand), vad som ingår i hyran (el, värme, internet) och om det finns besittningsskydd. Vid andrahandshyra är det vanligt att avtala bort besittningsskyddet om uthyrningen varar längre än två år.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 104,
      courseId: 1,
      orderIndex: 4,
      title: "Dolda kostnader & Hemförsäkring",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Hyran är bara en del av månadskostnaden. Du behöver även budgetera för elnäts- och elhandelsavtal, bredband samt hemförsäkring. Hemförsäkringen är avgörande — den skyddar inte bara dina prylar utan innehåller även ansvarsskydd, rättsskydd och reseskydd.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 105,
      courseId: 1,
      orderIndex: 5,
      title: "Inflytt & Besiktning",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "På inflyttningsdagen ska du noggrant gå igenom lägenheten och fotografera eventuella repor, hål eller fläckar som fanns innan du flyttade in. Se till att hyresvärden noterar detta i besiktningsprotokollet så att du inte blir ersättningsskyldig när du en dag flyttar ut.",
              },
            ],
          },
        ],
      },
    },
    {
      id: 106,
      courseId: 1,
      orderIndex: 6,
      title: "Sammanfattning & Grattis",
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Grattis! Du har nu gått igenom de viktigaste stegen för att hitta och hyra din första egna bostad på ett tryggt och ekonomiskt smart sätt. Gör quizet för att testa dina kunskaper och få personifierade rekommendationer från vår AI-guide!",
              },
            ],
          },
        ],
      },
    },
  ],
};

export const demoQuiz: Record<number, CourseQuiz> = {
  1: {
    id: 1,
    courseId: 1,
    title: "Kunskapsquiz: Hitta din första bostad",
    questions: [
      {
        id: 1,
        quizId: 1,
        courseId: 1,
        blockId: 103,
        question: "Vad innebär besittningsskydd i ett vanligt förstahandskontrakt?",
        options: [
          { id: "opt-1", text: "Att hyresvärden har rätt att säga upp dig med en veckas varsel" },
          { id: "opt-2", text: "Att du som hyresgäst har en laglig rätt att bo kvar och få avtalet förlängt" },
          { id: "opt-3", text: "Att hyran aldrig får höjas så länge du bor där" },
        ],
      },
      {
        id: 2,
        quizId: 1,
        courseId: 1,
        blockId: 104,
        question: "Vilken försäkring är absolut viktigast att teckna så fort du flyttar in?",
        options: [
          { id: "opt-4", text: "Hemförsäkring (med ansvars- och rättsskydd)" },
          { id: "opt-5", text: "A-kassa och inkomstförsäkring" },
          { id: "opt-6", text: "Produktförsäkring för mikrovågsugnen" },
        ],
      },
      {
        id: 3,
        quizId: 1,
        courseId: 1,
        blockId: 105,
        question: "Vad bör du alltid göra på inflyttningsdagen innan du packar upp dina möbler?",
        options: [
          { id: "opt-7", text: "Måla om alla dörrar och lister" },
          { id: "opt-8", text: "Dokumentera och fotografera befintliga skador för besiktningsprotokollet" },
          { id: "opt-9", text: "Byta ut låskolven på ytterdörren själv" },
        ],
      },
    ],
  },
};
