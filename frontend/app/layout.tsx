import type { Metadata } from "next";
import { Hind, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "../components/navigation/header";
import Footer from "../components/navigation/footer";


const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

const hind = Hind({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Adulting",
  description: "Adulting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sv"
      className={`${montserrat.variable} ${hind.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground">
        <div className="hidden md:block">
          <Header />
        </div>


        {children}


        <div className="hidden md:block">
          <Footer />
        </div>

      </body>
    </html>
  );
}