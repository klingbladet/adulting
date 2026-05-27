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
    <main className="min-h-dvh bg-background text-foreground md:py-8 md:px-4 flex items-start justify-center">
      <section className="mx-auto min-h-dvh w-full max-w-[430px] bg-card px-5 py-5 border-x border-border/20 md:max-w-2xl md:rounded-[32px] md:shadow-md md:border md:my-8 md:min-h-fit">
        <header className="mb-6 flex items-center justify-between">
          <Link
            href="/profile/settings"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={22} />
          </Link>

          <h1 className="text-lg font-bold text-foreground">{title}</h1>

          <div className="h-9 w-9" />
        </header>

        {children}
      </section>
    </main>
  );
}