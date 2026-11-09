import Link from "next/link";
import { ArrowRight, Globe2, Hand } from "lucide-react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import { getServerOnboarding } from "@/lib/server-onboarding";

export default async function HomePage() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    const session = await getServerSession();

    if (session) {
      const onboarding = await getServerOnboarding();

      if (onboarding) {
        redirect(onboarding.redirectTo);
      }

      redirect("/onboarding");
    }
  }

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden px-4 text-foreground md:min-h-screen md:bg-[#E8F5FD]  md:py-8">
      <div className="absolute inset-0 z-0 bg-[url('/images/frontpage-mobile.gif')] bg-cover bg-left bg-no-repeat md:hidden" />
      <div className="flex items-center justify-center z-10 py-4 text-center text-sm text-muted-foreground">
      </div>

      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-around z-10">
        <div className="mb-8 space-y-3 text-center">
          <div className="pb-5">
            <h1 className="text-7xl text-[#0A5C9A] font-bold font-Montserrat font-heading tracking-tight">
              Adulting
            </h1>

            <p className="mt-3 font-semibold text-base leading-7 text-[#0A5C9A]">
              Navigera ditt vuxenliv steg för steg
            </p>
          </div>
          <div className="pt-35 pb-20 md:pt-0 md:pb-0">
            <Link
              href="/auth"
              className="mt-16 flex h-14 w-full items-center justify-center gap-2 rounded-4xl bg-[#4981F2] text-sm font-bold text-[#f6f9ff] shadow-sm transition hover:bg-[#1D4ED8]"
            >
              Skapa konto / Sign in
              <ArrowRight size={20} />
            </Link>

            <Link
              href="/learn"
              className="mt-7 block text-center text-sm font-bold text-[#0A0A0A]"
            >
              Eller fortsätt utan konto
            </Link>
          </div>
        </div>
      </section>
    </main>

  );
}



