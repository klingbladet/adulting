import { requireGuest } from "@/lib/guards";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  await requireGuest();

  return (
  <main className="flex min-h-dvh flex-col bg-background px-4 text-foreground md:min-h-screen md:py-8">
      <section className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Sign in</h1>
        <SignInForm />
      </section>
     
    </main>
  );
}