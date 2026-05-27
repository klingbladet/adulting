import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function PrivacyPage() {
  return (
    <SettingsPageShell title="Integritetspolicy">
      <div className="rounded-[28px] bg-muted p-5 text-foreground">
        <h2 className="text-base font-bold text-foreground">
          Hur vi hanterar din data
        </h2>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Vi värnar om din integritet och arbetar för att
          hantera personuppgifter på ett tryggt och säkert sätt.
        </p>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
         information om:
        </p>

        <ul className="mt-4 space-y-3 text-sm text-foreground">
          <li>• Vilken information som sparas</li>
          <li>• Varför informationen används</li>
          <li>• Hur länge data sparas</li>
          <li>• Hur du kan hantera dina uppgifter</li>
        </ul>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="text-sm leading-6 text-secondary-foreground">
            Fullständig integritetspolicy kommer läggas
            till senare när juridisk text är klar.
          </p>
        </div>
      </div>
    </SettingsPageShell>
  );
}