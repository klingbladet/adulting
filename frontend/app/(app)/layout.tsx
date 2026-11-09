import MobileFooter from "@/components/navigation/mobile-footer";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <MobileFooter />
    </>
  );
}