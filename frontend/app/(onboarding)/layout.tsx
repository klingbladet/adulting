import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}