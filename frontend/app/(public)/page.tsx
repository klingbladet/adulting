import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getServerOnboarding } from "@/lib/server-onboarding";

export default async function HomePage() {
  const session = await getServerSession();

  if (session) {
    const onboarding = await getServerOnboarding();

    if (onboarding) {
      redirect(onboarding.redirectTo);
    }

    redirect("/onboarding");
  }

  return (
      <main className="relative flex min-h-dvh flex-col overflow-hidden bg-background px-4 text-foreground md:min-h-screen md:bg-background md:py-8">
<div className="absolute inset-0 z-0 bg-[url('/images/frontpage-mobile.gif')] bg-size-cover  bg-[position:30%_center] bg-no-repeat md:hidden" />
  <div className="flex items-center justify-center z-10 py-4 text-center text-sm text-muted-foreground">
        <p className="text-sm font-medium text-muted-foreground">
          Select language
        </p>
      </div>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center z-10">
          <div className="mb-8 space-y-3 text-center">
            <h1 className="text-3xl font-bold font-heading tracking-tight">
              ADULTING            
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
        </section>
</main>
    
      );
}



