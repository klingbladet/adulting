export interface Step {
  id: string;
  title: string;
  text: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  totalSteps: number;
  skillLevel: string;
  summary: string;
  time: string;
  steps: Step[];
}

export const mockCourses: Record<string, Course> = {
  "hitta-bostad": {
    id: "hitta-bostad",
    title: "Hitta din första bostad",
    subtitle: "Vi hjälper dig genom hela processen, från sökande till kontrakt.",
    totalSteps: 6,
    skillLevel: "Nybörjare",
    time: `${25} min`,
    summary: "Detta är en intensivkurs som lär dig att köpa bostad med kontroll och trygghet. Kursen går igenom hur du analyserar en bostadsrättsförenings ekonomi, räknar på boendekostnader och navigerar genom juridik, besiktning och budgivningsstrategier. Målet är att ge dig de verktyg som krävs för att fatta smarta beslut och undvika dolda ekonomiska risker vid ditt nästa bostadsköp.",
    steps: [
      { id: "1", title: "Förstå marknaden", text: "Att förstå bostadsmarknaden är det första steget till din nya bostad. Här går vi igenom skillnaden mellan förstahand, andrahand och hur kösystem fungerar i Sverige." },
      { id: "2", title: "Sök bostad", text: "Nu är det dags att börja leta! Vi tittar på de största plattformarna och hur du skapar en profil som sticker ut." },
      { id: "3", title: "Läs kontraktet", text: "Vad ska egentligen stå i ett hyreskontrakt? Vi går igenom besittningsskydd, uppsägningstid och vad som är skälig hyra." },
      { id: "4", title: "Förstå kostnaderna", text: "Hyran är bara en del av kostnaden. Vi pratar om deposition, hemförsäkring, el och internet." },
      { id: "5", title: "Flytta in", text: "Dags för inflytt! Vi går igenom besiktning, adressändring och hur du skapar en bra relation med din hyresvärd." },
      { id: "6", title: "Sammanfattning", text: "Grattis! Du har nu gått igenom alla steg för att hitta och hyra din första bostad. Lycka till!" }
    ]
  }
};

export function getCourse(courseId: string) {
  return mockCourses[courseId];
}

export function getStep(courseId: string, stepId: string) {
  const course = mockCourses[courseId];
  return {
    step: course?.steps.find(s => s.id === stepId),
    totalSteps: course?.totalSteps ?? 6
  };
}

