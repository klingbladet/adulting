import MobileFooter from "@/components/navigation/mobile-footer";

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