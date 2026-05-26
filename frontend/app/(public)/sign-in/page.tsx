import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireGuest } from "@/lib/guards";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  await requireGuest();

  return (
    <main className="relative flex min-h-dvh items-center justify-center bg-background text-gray-950 overflow-hidden md:p-8">
      <img src="/images/sign-in/form-över-höger.png" alt="" className="pointer-events-none absolute right-0 top-0 w-80 md:w-96 z-0" />
      <img src="/images/sign-in/form-neder-vänster.png" alt="" className="pointer-events-none absolute bottom-0 left-0 w-80 md:w-96 z-0" />

      <section className="relative z-10 flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6 py-8 md:min-h-fit md:max-w-[480px] md:rounded-[36px] bg-background md:px-10 md:py-12">
        <div className="relative z-10 flex w-full flex-col justify-center">
          <Link
            href="/auth"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2563EB] transition hover:bg-blue-50 -ml-2 mb-4"
            aria-label="Tillbaka"
          >
            <ArrowLeft size={22} />
          </Link>
          <h1 className="mb-6 text-[32px] font-bold tracking-tight text-gray-950">
            Logga in
          </h1>

          <SignInForm />
        </div>
      </section>
    </main>
  );
}