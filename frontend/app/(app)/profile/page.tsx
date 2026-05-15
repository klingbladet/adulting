/*export default function UserDashboardPage() {
  return (
     <main className="flex min-h-dvh flex-col bg-background px-4 text-foreground md:min-h-screen md:py-8">
          <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
            <h1 className="text-2xl font-bold">Profilsida</h1>
            <p className="mt-2 text-muted-foreground">
              Här är den vanliga appen som användare ser.
            </p>
          </section>
         
        </main>
  );
} */

import Link from "next/link";
import {
  BookOpen,
  Briefcase,
  Car,
  ChevronLeft,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  MessageCircle,
  Settings,
  Trophy,
  User,
  Wallet,
} from "lucide-react";

type CourseIconKey =
  | "housing"
  | "driving"
  | "economy"
  | "csn"
  | "work"
  | "study"
  | "health";

type UserCourse = {
  id: string;
  title: string;
  description: string;
  iconKey: CourseIconKey;
  progress: number;
  totalSteps: number;
  completedSteps: number;
};

const iconMap = {
  housing: Home,
  driving: Car,
  economy: Wallet,
  csn: Landmark,
  work: Briefcase,
  study: GraduationCap,
  health: HeartPulse,
};

const userCourses: UserCourse[] = [
  {
    id: "housing",
    title: "Bostadskurs",
    description: "Hyra, bostadskö och flytta hemifrån",
    iconKey: "housing",
    progress: 60,
    totalSteps: 5,
    completedSteps: 3,
  },
  {
    id: "driving",
    title: "Körkort",
    description: "Planera vägen till körkort",
    iconKey: "driving",
    progress: 25,
    totalSteps: 4,
    completedSteps: 1,
  },
  {
    id: "economy",
    title: "Ekonomi & skatt",
    description: "Budget, bank och skatt",
    iconKey: "economy",
    progress: 0,
    totalSteps: 6,
    completedSteps: 0,
  },
  {
    id: "work",
    title: "Jobb & CV",
    description: "Sök jobb och skriv CV",
    iconKey: "work",
    progress: 0,
    totalSteps: 4,
    completedSteps: 0,
  },
];

const badges = [
  { id: "first-course", label: "Första kurs", icon: BookOpen },
  { id: "housing", label: "Boende", icon: Home },
  { id: "budget", label: "Budget", icon: Wallet },
];

const visibleCourses = userCourses.slice(0, 3);

export default function UserProfilePage() {
  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-gray-950">
      <section className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-white md:max-w-4xl md:border-x">
        <header className="bg-[#EAF7FF] px-5 pb-8 pt-5 md:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700"
            >
              <ChevronLeft size={22} />
            </Link>

            <Link
              href="/profile/settings"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700"
            >
              <Settings size={22} />
            </Link>
          </div>

          <div className="mt-6 flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2563EB] text-3xl font-bold text-white">
              O
            </div>

            <h1 className="mt-3 text-xl font-bold">
              Ozz
            </h1>

            <p className="text-sm text-gray-500">
              o.jemal94@gmail.com
            </p>

            <Link
              href="/profile/settings"
              className="mt-2 text-sm font-semibold text-[#2563EB]"
            >
              Ändra profil →
            </Link>
          </div>
        </header>

        <div className="-mt-5 px-5 md:px-8">
          <div className="grid grid-cols-2 rounded-3xl bg-white p-4 text-center shadow-sm">
            <div>
              <p className="text-2xl font-bold text-[#2563EB]">
                {userCourses.filter((course) => course.progress > 0).length}
              </p>

              <p className="text-xs text-gray-500">
                Påbörjade
              </p>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {userCourses.filter((course) => course.progress === 100).length}
              </p>

              <p className="text-xs text-gray-500">
                Klara
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-5 pb-24 pt-6 md:px-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">
              Mina kurser
            </h2>

            <Link
              href="/courses"
              className="text-sm font-semibold text-[#2563EB]"
            >
              Se alla →
            </Link>
          </div>

          <div className="space-y-3">
            {visibleCourses.map((course) => {
              const Icon = iconMap[course.iconKey];

              return (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="block rounded-2xl bg-[#EAF7FF] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2563EB]">
                      <Icon size={24} />
                    </div>

                    <div className="flex-1">
                      <p className="font-bold">
                        {course.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        {course.description}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {course.completedSteps} av {course.totalSteps} steg
                      </p>
                    </div>

                    <p className="text-sm font-bold">
                      {course.progress}%
                    </p>
                  </div>

                  <div className="mt-3 h-2 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-[#2563EB]"
                      style={{
                        width: `${course.progress}%`,
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Mina badges
              </h2>

              <Link
                href="/profile/badges"
                className="text-sm font-semibold text-[#2563EB]"
              >
                Se alla →
              </Link>
            </div>

            <div className="flex gap-4">
              {badges.map((badge) => {
                const Icon = badge.icon;

                return (
                  <div
                    key={badge.id}
                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF7FF] text-[#2563EB]"
                  >
                    <Icon size={28} />
                  </div>
                );
              })}

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-400">
                <Trophy size={28} />
              </div>
            </div>
          </div>
        </div>

        <nav className="fixed bottom-0 left-0 right-0 mx-auto grid h-20 max-w-md grid-cols-4 border-t bg-white px-4 text-xs text-gray-500 md:max-w-4xl">
          <Link
            href="/dashboard"
            className="flex flex-col items-center justify-center gap-1"
          >
            <Home size={22} />
            Hem
          </Link>

          <Link
            href="/courses"
            className="flex flex-col items-center justify-center gap-1"
          >
            <BookOpen size={22} />
            Utforska
          </Link>

          <Link
            href="/chat"
            className="flex flex-col items-center justify-center gap-1"
          >
            <MessageCircle size={22} />
            Chatt
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center gap-1 font-bold text-[#2563EB]"
          >
            <User size={22} />
            Profil
          </Link>
        </nav>
      </section>
    </main>
  );
}