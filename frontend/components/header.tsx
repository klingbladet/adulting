"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { LogoutButton } from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="text-blue-600 font-bold text-xl">
          Adult
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-black">
            Hem
          </Link>
          <Link href="/menu" className="text-gray-700 hover:text-black">
            Meny
          </Link>
          <Link href="/lessons" className="text-gray-700 hover:text-black">
            Lessons
          </Link>

          <button className="border px-4 py-2 rounded-lg text-sm">
            Sign in
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Sign up
          </button>
          <ThemeToggle />
        </nav>

        {/* Mobile button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden border px-3 py-2 rounded-lg text-sm"
        >
          ☰
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 flex flex-col gap-4">
          <Link href="/">Hem</Link>
          <Link href="/menu">Meny</Link>
          <Link href="/lessons">Lessons</Link>

          <button className="border px-4 py-2 rounded-lg text-sm">
            Sign in
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Sign up
          </button>
        </div>
      )}
    </header>
  );
}