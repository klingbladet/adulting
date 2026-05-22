"use client";

import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/lib/backend-url";

type ProgressLinkProps = {
  href: string;
  courseId: string;
  progress: number;
  children: React.ReactNode;
  className?: string;
};

export default function ProgressLink({
  href,
  courseId,
  progress,
  children,
  className,
}: ProgressLinkProps) {
  const router = useRouter();

  async function handleClick() {
    try {
      await fetch(`${BACKEND_URL}/api/courses/${courseId}/progress`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: Math.min(Math.max(Math.round(progress), 0), 100),
        }),
      });
    } catch (error) {
      console.error("SAVE COURSE PROGRESS ERROR:", error);
    } finally {
      router.push(href);
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}