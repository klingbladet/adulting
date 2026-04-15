"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/* Flytande knapp nere till höger */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
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
      </button>

      {/* Chat box */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Chat</h2>
            <button
              onClick={() => setChatOpen(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Stäng
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <div className="max-w-[80%] rounded-2xl bg-blue-600 px-3 py-2 text-sm text-white">
              Hej! Hur kan jag hjälpa dig idag?
            </div>

            <div className="ml-auto max-w-[80%] rounded-2xl bg-gray-100 px-3 py-2 text-sm text-gray-800">
              Hur gör man en budget?
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Skriv här..."
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none"
            />
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Skicka
            </button>
          </div>
        </div>
      )}
    </>
  );
}