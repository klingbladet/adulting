import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function AboutPage() {
  return (
    <SettingsPageShell title="Om teamet">
      <div className="rounded-[28px] bg-[#F8FAFC] p-5">
        <h2 className="font-bold">Adulting</h2>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          Adulting hjälper unga vuxna att förstå viktiga delar av vuxenlivet,
          som ekonomi, boende, jobb och studier.
        </p>

        <p className="mt-3 text-sm leading-6 text-gray-600">
          vi lägga in mer information om projektet,
          utvecklarna och appens syfte.
        </p>
      </div>
    </SettingsPageShell>
  );
}