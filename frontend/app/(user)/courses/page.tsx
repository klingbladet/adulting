import StepCard from "@/components/ui/lessons/course/course-layout";
import { House, BookOpen } from 'lucide-react';
import Link from "next/link";
import { getCourses } from "@/lib/api";

export default async function UserDashboardPage() {
  const courses = await getCourses();

  return (
    <div>
      <h1 className="text-2xl font-bold">Hej Benjamin!</h1>
      <p className="mt-2 mb-10 text-muted-foreground">
        Välkommen - vad vill du lära dig idag?
      </p>
      
      <div className="flex flex-col gap-4">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <StepCard
                  icon={<BookOpen />}
                  title={course.title}
                  description={course.status || "Tillgänglig nu"}
              />
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground italic">Inga kurser hittades ännu.</p>
        )}

        {/* Behåller de andra som exempel/platshållare tills de finns i databasen */}
        <Link href="">
          <StepCard
              icon={<House />}
              title="Hitta bostad (Mock)"
              description="Guide 25min"
          />
        </Link>
      </div>
    </div>
  );
}