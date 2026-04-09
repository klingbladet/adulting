"use client";

import Link from "next/link";

export default function AiButton() {
  return (
    <Link
      href="/ai-chat"
      className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-110 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9a8.959 8.959 0 01-4.255-1.06l-4.245 1.125 1.125-4.245A8.959 8.959 0 012.25 12z"
        />
      </svg>
    </Link>
  );
}