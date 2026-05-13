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
    <main className="flex min-h-screen items-center justify-center bg-[#F5FBFF] px-4 py-6">
      <section className="flex min-h-[760px] w-full max-w-[430px] flex-col rounded-[36px] bg-[#EAF8FF] px-6 py-10 shadow-sm">
        
        <div className="flex justify-center">
          <button className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Globe2 size={18} />
            Välj ditt språk
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm">
               <Hand size={48} strokeWidth={2.4} />
            </div>

            <p className="mt-4 text-lg font-semibold text-[#2563EB]">
              Hej!
            </p>
          </div>

          <div className="mt-20">
            <h1 className="text-4xl font-bold tracking-tight text-gray-950">
              Välkommen!
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
        </div>
      </section>
    </main>
  );
}