import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background px-4 text-foreground md:min-h-screen md:py-8">
      <div className="flex items-center justify-center py-4 text-center text-sm text-muted-foreground">
        <p className="text-sm font-medium text-muted-foreground">
          Select language
        </p>
      </div>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Välkommen till Adulting
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Ta kontroll över vuxenlivet
            </h1>

            <p className="text-base text-muted-foreground">
              Logga in eller skapa ett konto för att komma igång med ditt
              personliga flöde.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/sign-up"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
            >
              Kom igång
              <ArrowRight className="h-4 w-4" />
            </Link>

            <p className="text-center text-sm text-muted-foreground">
              Har du redan ett konto?
            </p>

            <Link
              href="/sign-in"
              className="flex w-full items-center justify-center text-sm font-semibold text-primary transition hover:opacity-90"
            >
              Logga in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}