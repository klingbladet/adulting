import { Block, Course as BaseCourse } from "@/types/types";

export interface Course extends Omit<BaseCourse, 'id'> {
  id: string; // Keep as string for mock slug-based routing
  totalBlocks: number;
  blocks: Block[];
}

export const mockCourses: Record<string, Course> = {
  "hitta-bostad": {
    id: "hitta-bostad",
    title: "Hitta din första bostad",
    userId: "mock-user",
    categoryId: "1",
    textContent: "Vi hjälper dig genom hela processen, från sökande till kontrakt.",
    imageUrl: null,
    videoUrl: null,
    time: 25,
    status: "published",
    isPublished: true,
    totalBlocks: 6,
    blocksList: [], // We use 'blocks' for the array in mock
    blocks: [
      { id: 1, courseId: 1, title: "Förstå marknaden", content: "Att förstå bostadsmarknaden är det första steget till din nya bostad. Här går vi igenom skillnaden mellan förstahand, andrahand och hur kösystem fungerar i Sverige.", orderIndex: 1},
      { id: 2, courseId: 1, title: "Sök bostad", content: "Nu är det dags att börja leta! Vi tittar på de största plattformarna och hur du skapar en profil som sticker ut.", orderIndex: 2},
      { id: 3, courseId: 1, title: "Läs kontraktet", content: "Vad ska egentligen stå i ett hyreskontrakt? Vi går igenom besittningsskydd, uppsägningstid och vad som är skälig hyra.", orderIndex: 3},
      { id: 4, courseId: 1, title: "Förstå kostnaderna", content: "Hyran är bara en del av kostnaden. Vi pratar om deposition, hemförsäkring, el och internet.", orderIndex: 4},
      { id: 5, courseId: 1, title: "Flytta in", content: "Dags för inflytt! Vi går igenom besiktning, adressändring och hur du skapar en bra relation med din hyresvärd.", orderIndex: 5},
      { id: 6, courseId: 1, title: "Sammanfattning", content: "Grattis! Du har nu gått igenom alla steg för att hitta och hyra din första bostad. Lycka till!", orderIndex: 6 }
    ]
  }
};

export function getCourse(courseId: string) {
  return mockCourses[courseId];
}

export function getBlock(courseId: string, stepId: string) {
  const course = mockCourses[courseId];
  const blockId = Number(stepId);
  return {
    step: course?.blocks.find(s => s.id === blockId),
    totalSteps: course?.totalBlocks ?? 6
  };
}

