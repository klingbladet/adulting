import Link from "next/link";
import { ArrowRight, Globe2, Hand } from "lucide-react";
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

            <p className="mt-3 text-base leading-7 text-gray-600">
              Lär dig vuxenlivet steg för steg
            </p>

            <Link
              href="/auth"
              className="mt-16 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#2563EB] text-base font-bold text-white shadow-sm transition hover:bg-[#1D4ED8]"
            >
              Skapa konto / Sign in
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/chat"
              className="mt-7 block text-center text-sm font-bold text-gray-900"
            >
              Eller utforska som gäst
            </Link>
          </div>  
        </section>
</main>
    
      );
}



