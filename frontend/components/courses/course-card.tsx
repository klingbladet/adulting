import Link from "next/link";
import getCourseIcon from "@/components/courses/course-dynamic-icon";

export type ProfileCourse = {
    id: string;
    title: string;
    progress: number;
    category: {
        name: string;
        iconName: string | null;
    } | null;
    totalSteps: number;
    completedSteps: number;
};

function safeProgress(progress: number) {
    return Math.min(Math.max(progress, 0), 100);
}

export default function CourseCard({ course }: { course: ProfileCourse }) {
    const progress = safeProgress(course.progress);

    return (
        <Link
            href={`/courses/${course.id}`}
            className="flex min-h-[76px] items-center gap-3 rounded-3xl bg-secondary px-3 py-2.5 shadow-sm "
        >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full">
                {getCourseIcon(course)}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate text-sm font-bold">{course.title}</h3>
                    <p className="text-xs font-bold">{progress}%</p>
                </div>

                <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-300">
                    {course.completedSteps} av {course.totalSteps} steg
                </p>

                <div className="mt-2 h-1.5 rounded-full bg-primary-foreground">
                    <div
                        className="h-1.5 rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </Link>
    );
}