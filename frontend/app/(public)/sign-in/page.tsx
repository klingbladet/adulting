import { requireGuest } from "@/lib/guards";
import SignInForm from "./sign-in-form";

export default async function SignInPage() {
  await requireGuest();

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-foreground">Sign in</h1>
      <SignInForm />
    </main>
  );
}