import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-primary bg-background">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-sm text-gray-600 md:flex-row md:justify-center md:gap-10">
          <Link href="/" className="hover:text-blue-600">
            Om oss
          </Link>
          <Link href="/" className="hover:text-blue-600">
            Kontakt
          </Link>
          <Link href="/" className="hover:text-blue-600">
            Villkor
          </Link>
          <Link href="/" className="hover:text-blue-600">
            Sekretesspolicy
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          © 2026 Adulting. All rights reserved.
        </p>
      </div>
    </footer>
  );
}