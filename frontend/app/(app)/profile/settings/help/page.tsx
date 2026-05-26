import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function HelpPage() {
  return (
    <SettingsPageShell title="Hjälpcenter">
      <div className="space-y-3">
        {[
          "Hur börjar jag en kurs?",
          "Hur fungerar badges?",
          "Hur sparas mina framsteg?",
          "Hur kontaktar jag teamet?",
        ].map((question) => (
          <div
            key={question}
            className="rounded-2xl bg-[#F8FAFC] p-4"
          >
            <p className="text-sm font-semibold">
              {question}
            </p>
          </div>
        ))}
      </div>
    </SettingsPageShell>
  );
}