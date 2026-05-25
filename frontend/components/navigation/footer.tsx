import Link from "next/link";
import { BookOpen, Heart, ShieldPlus } from "lucide-react";

import ThemeToggle from "@/components/theme/theme-toggle";

const footerLinks = [
  {
    href: "/courses",
    label: "Kurser",
  },
  {
    href: "/learn",
    label: "Lärande",
  },
  {
    href: "/profile",
    label: "Profil",
  },
  {
    href: "/profile/settings",
    label: "Inställningar",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-heading text-lg font-bold text-primary"
          >
            Adulting
          </Link>

          <p className="max-w-sm text-sm leading-6 text-muted-foreground">
            En lärplattform för praktiska livskunskaper, kurser och personlig
            guidning.
          </p>

        </div>

        <div>
          <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">
            Navigation
          </h2>

          <nav className="grid gap-2">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="mb-3 font-heading text-sm font-semibold text-foreground">
            Anpassa
          </h2>

          <div className="space-y-3">
            <ThemeToggle />
          <div className="h-0.5 w-full bg-border" />
            <Link
              href="/create"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-primary"
            >
              <ShieldPlus className="h-4 w-4" />
              Creator
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Adulting. Alla rättigheter förbehållna.</p>

          <div className="flex items-center gap-4">
            <Link href="/privacy" className="transition hover:text-primary">
              Integritet
            </Link>

            <Link href="/terms" className="transition hover:text-primary">
              Villkor
            </Link>

            <span className="inline-flex items-center gap-1">
              Chas Challenge
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}