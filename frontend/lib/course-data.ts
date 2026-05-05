export interface Blocks {
  id: string;
  title: string;
  content: string;
  orderIndex: number;
  
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  skillLevel: string;
  summary: string;
  time: string;
  totalBlocks: number;
  blocks: Blocks[];
}

export const mockCourses: Record<string, Course> = {
  "hitta-bostad": {
    id: "hitta-bostad",
    title: "Hitta din första bostad",
    subtitle: "Vi hjälper dig genom hela processen, från sökande till kontrakt.",
    totalBlocks: 6,
    skillLevel: "Nybörjare",
    time: `${25} min`,
    summary: "Detta är en intensivkurs som lär dig att köpa bostad med kontroll och trygghet. Kursen går igenom hur du analyserar en bostadsrättsförenings ekonomi, räknar på boendekostnader och navigerar genom juridik, besiktning och budgivningsstrategier. Målet är att ge dig de verktyg som krävs för att fatta smarta beslut och undvika dolda ekonomiska risker vid ditt nästa bostadsköp.",
    blocks: [
      { id: "1", title: "Förstå marknaden", content: "Att förstå bostadsmarknaden är det första steget till din nya bostad. Här går vi igenom skillnaden mellan förstahand, andrahand och hur kösystem fungerar i Sverige.", orderIndex: 1},
      { id: "2", title: "Sök bostad", content: "Nu är det dags att börja leta! Vi tittar på de största plattformarna och hur du skapar en profil som sticker ut.", orderIndex: 2},
      { id: "3", title: "Läs kontraktet", content: "Vad ska egentligen stå i ett hyreskontrakt? Vi går igenom besittningsskydd, uppsägningstid och vad som är skälig hyra.", orderIndex: 3},
      { id: "4", title: "Förstå kostnaderna", content: "Hyran är bara en del av kostnaden. Vi pratar om deposition, hemförsäkring, el och internet.", orderIndex: 4},
      { id: "5", title: "Flytta in", content: "Dags för inflytt! Vi går igenom besiktning, adressändring och hur du skapar en bra relation med din hyresvärd.", orderIndex: 5},
      { id: "6", title: "Sammanfattning", content: "Grattis! Du har nu gått igenom alla steg för att hitta och hyra din första bostad. Lycka till!", orderIndex: 5 }
    ]
  }
};

export function getCourse(courseId: string) {
  return mockCourses[courseId];
}

export function getBlock(courseId: string, stepId: string) {
  const course = mockCourses[courseId];
  return {
    step: course?.blocks.find(s => s.id === stepId),
    totalSteps: course?.totalBlocks ?? 6
  };
}

