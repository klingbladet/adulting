import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function GDPRPage() {
  return (
    <SettingsPageShell title="GDPR & rättigheter">
      <div className="rounded-[28px] bg-[#F8FAFC] p-5">
        <h2 className="text-base font-bold">
          Dina rättigheter enligt GDPR
        </h2>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          Du har rätt att förstå hur dina uppgifter används
          och kunna påverka hur de hanteras.
        </p>

        <p className="mt-4 text-sm leading-7 text-gray-600">
          information om:
        </p>

        <ul className="mt-4 space-y-3 text-sm text-gray-700">
          <li>• Rätt att få tillgång till din data</li>
          <li>• Rätt att ändra felaktig information</li>
          <li>• Rätt att exportera din data</li>
          <li>• Rätt att begära konto-radering</li>
          <li>• Hur dina uppgifter används</li>
        </ul>

        <div className="mt-5 rounded-2xl bg-[#EAF7FF] p-4">
          <p className="text-sm leading-6 text-[#2563EB]">
            Fullständig GDPR-information kmr läggs här
          </p>
        </div>
      </div>
    </SettingsPageShell>
  );
}