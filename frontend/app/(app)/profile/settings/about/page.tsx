import SettingsPageShell from "@/components/profile/settings-page-shell";

export default function AboutPage() {
  return (
    <SettingsPageShell title="Om teamet">
      <div className="rounded-[28px] bg-muted p-5 text-foreground">
        <h2 className="font-bold">Adulting</h2>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Att bli vuxen innebär ofta en brant lärandekurva där man förväntas förstå allt från bostadsköp till jobbansökan över en natt.
        </p>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Adulting’s syfte är att ge unga vuxna de verktyg och den praktiska vägledning som krävs för att navigera tryggt i samhället och snabbare bemästra vardagens komplexa krav.
        </p>
      </div>
    </SettingsPageShell>
  );
}