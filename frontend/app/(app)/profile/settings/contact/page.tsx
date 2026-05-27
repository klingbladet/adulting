import { Mail, MessageCircle } from "lucide-react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function ContactPage() {
  return (
    <SettingsPageShell title="Kontakta oss">
      <div className="space-y-4 text-foreground">
        <div className="rounded-[28px] bg-muted p-5">
          <div className="flex items-center gap-3">
            <Mail className="text-primary" />

            <div>
              <h2 className="font-semibold">
                Kontakt via e-post
              </h2>

              <p className="text-sm leading-6 text-muted-foreground">
                Här kommer teamets kontaktinformation
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-muted p-5">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-primary" />

            <div>
              <h2 className="font-semibold">
                Support & feedback
              </h2>

              <p className="text-sm leading-6 text-muted-foreground">
                Här kommer användare kunna
                skicka frågor eller feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-secondary p-5">
          <p className="text-sm leading-6 text-secondary-foreground">
            Kontaktformulär och support-system
          </p>
        </div>
      </div>
    </SettingsPageShell>
  );
}