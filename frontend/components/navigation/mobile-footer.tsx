"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, LifeBuoy, User } from "lucide-react";
import AiChatModal from "@/components/chat/ai-chat-modal";
import type { AiLearningContext } from "@/lib/learning-context";

const links = [
  { href: "/learn", label: "Home", icon: Home },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/profile", label: "You", icon: User },
];

function getLearningContextFromPathname(
  pathname: string,
): AiLearningContext | undefined {
  const parts = pathname.split("/").filter(Boolean);

  const coursesIndex = parts.indexOf("courses");
  const courseId = coursesIndex >= 0 ? parts[coursesIndex + 1] : undefined;

  if (!courseId) {
    return undefined;
  }

  return {
    courseId,
    mode: "course_recommendation",
  };
}

export default function MobileFooter() {
  const pathname = usePathname();
  const learningContext = getLearningContextFromPathname(pathname);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-4 lg:hidden">
      <div className="w-full max-w-sm rounded-3xl bg-white px-4 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <ul className="flex items-center justify-around">
          {links.slice(0, 2).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 px-3 py-1"
                >
                  <Icon
                    size={24}
                    className={isActive ? "text-gray-900" : "text-gray-400"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span
                    className={`text-xs ${
                      isActive
                        ? "font-semibold text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}

          <li>
            <AiChatModal
              learningContext={learningContext}
              trigger={(open) => (
                <button
                  type="button"
                  onClick={open}
                  className="flex flex-col items-center gap-1 px-3 py-1"
                >
                  <LifeBuoy
                    size={24}
                    className="text-gray-400"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs text-gray-400">Assistance</span>
                </button>
              )}
            />
          </li>

          {links.slice(2).map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 px-3 py-1"
                >
                  <Icon
                    size={24}
                    className={isActive ? "text-gray-900" : "text-gray-400"}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span
                    className={`text-xs ${
                      isActive
                        ? "font-semibold text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}