import Link from "next/link";
import Image from "next/image";
import { getCourses, getBlocksByCourseId } from "@/lib/api";
import { Course } from "@/types/types";
import { Block } from "@/types/types";
import { UserCourse } from "@/types/types";
import { cookies } from "next/headers";

type CourseWithPublishStatus = Course & {
  isPublished?: boolean;
  userCourses?: UserCourse[];
  enrollments?: UserCourse[];
};

// Logik specifikt för de större continue-bilderna
function getContinueImage(course: CourseWithPublishStatus) {
  const categoryName = course.category?.name?.toLowerCase() || "";
  const title = course.title?.toLowerCase() || "";

  if (categoryName.includes("ekonomi") || title.includes("ekonomi") || title.includes("skatt") || title.includes("csn")) return "/images/continue/continue-ekonomi.png";
  if (categoryName.includes("bostad") || title.includes("bostad") || title.includes("boende")) return "/images/continue/continue-bostad.png";
  if (categoryName.includes("jobb") || title.includes("jobb")) return "/images/continue/continue-jobb.png";
  if (categoryName.includes("körkort") || title.includes("körkort")) return "/images/continue/continue-korkort.png";
  if (title.includes("utbild")) return "/images/continue/continue-utbildning.png";

  // Standardbild om ingen kategori matchar. (Se till att du har en bild som heter såhär i mappen, 
  // eller byt ut den till något som alltid finns, typ continue-bostad.png)
  return "/images/continue/continue-default.png";
}

export default async function ContinueCard() {
  const cookieStore = await cookies();
  const allCourses = await getCourses({
    headers: {
      cookie: cookieStore.toString()
    }
  });

  // Hitta alla publicerade kurser som användaren håller på med (in_progress)
  const startedCourses = allCourses.filter((course: CourseWithPublishStatus) => {
    const enrollment = course.enrollments?.[0] || course.userCourses?.[0];
    return course.isPublished && enrollment && enrollment.status !== "completed";
  });

  // Sortera dem så att den senast aktiva hamnar överst
  const mostRecentCourse = startedCourses.sort((a, b) => {
    const aEnrollment = a.enrollments?.[0] || a.userCourses?.[0];
    const bEnrollment = b.enrollments?.[0] || b.userCourses?.[0];
    const aDate = new Date(aEnrollment?.updatedAt || aEnrollment?.enrolledAt || 0).getTime();
    const bDate = new Date(bEnrollment?.updatedAt || bEnrollment?.enrolledAt || 0).getTime();
    return bDate - aDate;
  })[0] as CourseWithPublishStatus | undefined;

  // Om ingen kurs pågår, visa en platshållare (eller returnera null om du vill dölja den helt)
  if (!mostRecentCourse) {
    return (
      <div className="bg-muted md:bg-[#EBF2F9] dark:md:bg-slate-800 rounded-xl p-4 mb-4 md:w-[calc(50%-1rem)]">
        <p className="text-sm text-muted-foreground">Du har inga påbörjade kurser ännu.</p>
      </div>
    );
  }

  // Hämta blocken för kursen och räkna ut vilket block användaren är på just nu
  let currentBlockTitle = mostRecentCourse.textContent || "Fortsätt där du slutade";
  let targetUrl = `/courses/${mostRecentCourse.id}/overview`;
  try {
    const blocks = await getBlocksByCourseId(mostRecentCourse.id.toString(), {
      headers: { cookie: cookieStore.toString() }
    });

    if (blocks && blocks.length > 0) {
      const enrollment = mostRecentCourse.enrollments?.[0] || mostRecentCourse.userCourses?.[0];
      const progress = enrollment?.score || 0; // Score sparar framsteg i procent (0-100)
      const totalSteps = mostRecentCourse.blocks || blocks.length;
      const completedSteps = Math.round((progress / 100) * totalSteps);

      // Säkerställ att vi inte går utanför arrayens längd
      const currentBlockIndex = Math.min(completedSteps, blocks.length - 1);

      const currentBlock = blocks[currentBlockIndex];
      if (currentBlock) {
        if (currentBlock.title) currentBlockTitle = currentBlock.title;
        targetUrl = `/courses/${mostRecentCourse.id}/blocks/${currentBlock.id}`;
      }
    }
  } catch (error) {
    console.error("Kunde inte hämta block för continue card", error);
  }

  return (
    <>
      <Link href={targetUrl} className="block md:w-[calc(50%-1rem)]">
        <div className="bg-muted md:bg-[#EBF2F9] dark:md:bg-slate-800 rounded-xl pl-4 pr-4 mb-4 flex justify-between items-center w-full">
          <div className="flex flex-col gap-1 w-full pr-2">
            <span className="font-bold text-sm md:text-lg text-foreground">{mostRecentCourse.title}</span>
            <p className="text-xs md:text-sm text-muted-foreground md:text-foreground/70 line-clamp-2">
              {currentBlockTitle}
            </p>
          </div>
          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 flex items-center justify-center overflow-hidden rounded-full">
            <Image
              src={getContinueImage(mostRecentCourse)}
              alt={mostRecentCourse.title}
              width={80}
              height={80}
              className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
            />
          </div>
        </div>
      </Link>
    </>
  )
}