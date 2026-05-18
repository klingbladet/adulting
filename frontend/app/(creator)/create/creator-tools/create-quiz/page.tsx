import { requireRole } from "@/lib/guards";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";


export default async function CreatorToolsPage() {
  
  await requireRole(["creator", "admin"]);

  return (
    <div>
        <Link href={`/create/creator-tools/create-content`}>
          <CourseButton variant="secondary">Tillbaka</CourseButton>
        </Link>
        <Link href={``}>
          <CourseButton>Skapa kurs</CourseButton>
        </Link>
    </div>
  );
}