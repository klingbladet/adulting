import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/session";
import MobileFooter from "@/components/navigation/mobile-footer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <main className="min-h-dvh pb-24">{children}</main>
      <MobileFooter />
    </>
  );
}