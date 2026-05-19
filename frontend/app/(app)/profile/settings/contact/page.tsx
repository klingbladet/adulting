import { Mail, MessageCircle } from "lucide-react";
import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function ContactPage() {
  return (
    <SettingsPageShell title="Kontakta oss">
      <div className="space-y-4">
        <div className="rounded-[28px] bg-[#F8FAFC] p-5">
          <div className="flex items-center gap-3">
            <Mail className="text-[#2563EB]" />

            <div>
              <h2 className="font-semibold">
                Kontakt via e-post
              </h2>

              <p className="text-sm leading-6 text-gray-500">
                Här kommer teamets kontaktinformation
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#F8FAFC] p-5">
          <div className="flex items-center gap-3">
            <MessageCircle className="text-[#2563EB]" />

            <div>
              <h2 className="font-semibold">
                Support & feedback
              </h2>

              <p className="text-sm leading-6 text-gray-500">
                Här kommer användare kunna
                skicka frågor eller feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] bg-[#EAF7FF] p-5">
          <p className="text-sm leading-6 text-[#2563EB]">
            Kontaktformulär och support-system
            
          </p>
        </div>
      </div>
    </SettingsPageShell>
  );
}