import Link from "next/link";

export default function Header() {
  const isLoggedIn = false; // ändra senare när ni har riktig auth

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Logga
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Hem
          </Link>
          <Link href="/menu" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Meny
          </Link>

          {isLoggedIn ? (
            <button className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600">
              Sign out
            </button>
          ) : (
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}