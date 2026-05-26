import { requireGuest } from "@/lib/guards";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  await requireGuest();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F8FAFC] px-4 text-gray-950 md:min-h-screen md:py-8">
      <section className="relative min-h-dvh w-full max-w-[430px] overflow-hidden bg-white px-6 py-8 md:min-h-[760px] md:rounded-[36px] md:shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-[#FFF59D] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#DFF3D8] blur-2xl" />

        <div className="relative z-10 flex min-h-[calc(100dvh-64px)] flex-col justify-center md:min-h-[690px]">
          <h1 className="mb-6 text-[32px] font-bold tracking-tight text-gray-950">
            Logga in
          </h1>

          <SignInForm />
        </div>
      </section>
    </main>
  );
}