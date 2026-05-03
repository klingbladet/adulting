import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-4 text-foreground md:py-8">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center md:min-h-[calc(100vh-4rem)]">
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
              href="/sign-in"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Logga in
            </Link>

            <Link
              href="/sign-up"
              className="flex h-12 w-full items-center justify-center rounded-xl border bg-background px-4 text-sm font-semibold transition hover:bg-muted"
            >
              Skapa konto
            </Link>
          </div>

          <div className="mt-8 rounded-2xl bg-muted p-4">
            <p className="text-center text-sm text-muted-foreground">
              Info om tjänsten
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}