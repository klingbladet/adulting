import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function SettingsPageShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-dvh bg-[#F8FAFC] text-gray-950">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] bg-white px-5 py-5">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/profile/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F9] text-gray-700"
          >
            <ChevronLeft size={22} />
          </Link>

          <h1 className="text-lg font-bold">{title}</h1>

          <div className="h-9 w-9" />
        </header>

        {children}
      </section>
    </main>
  );
}