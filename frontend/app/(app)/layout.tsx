import MobileFooter from "@/components/navigation/mobile-footer";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-dvh pb-24">
        {children}
      </main>

      <MobileFooter />
    </>
  );
}