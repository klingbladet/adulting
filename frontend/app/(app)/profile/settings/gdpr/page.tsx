import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function GDPRPage() {
  return (
    <SettingsPageShell title="GDPR & rättigheter">
      <div className="rounded-[28px] bg-muted p-5 text-foreground">
        <h2 className="text-base font-bold text-foreground">
          Dina rättigheter enligt GDPR
        </h2>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Du har rätt att förstå hur dina uppgifter används
          och kunna påverka hur de hanteras.
        </p>

        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          information om:
        </p>

        <ul className="mt-4 space-y-3 text-sm text-foreground">
          <li>• Rätt att få tillgång till din data</li>
          <li>• Rätt att ändra felaktig information</li>
          <li>• Rätt att exportera din data</li>
          <li>• Rätt att begära konto-radering</li>
          <li>• Hur dina uppgifter används</li>
        </ul>

        <div className="mt-5 rounded-2xl bg-secondary p-4">
          <p className="text-sm leading-6 text-secondary-foreground">
            Fullständig GDPR-information kmr läggs här
          </p>
        </div>
      </div>
    </SettingsPageShell>
  );
}