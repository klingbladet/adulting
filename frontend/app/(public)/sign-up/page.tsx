import { requireGuest } from "@/lib/guards";
import SignUpForm from "./sign-up-form";

export default async function SignUpPage() {
  await requireGuest();

  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-bold text-foreground">Sign up</h1>
      <SignUpForm />
    </main>
  );
}