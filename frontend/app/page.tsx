export default function Home() {
  return (
<>

    
  

    <section className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Välkommen till Adulting</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          
        </p>
      </div>
    <div className="bg-background text-foreground p-8">
          <div className="max-w-md rounded-lg border bg-card text-card-foreground p-6 shadow-md">
            <h1 className="font-heading text-2xl">Hej Next + Tailwind v4</h1>
            <p className="mt-2 text-muted-foreground">
              Det här använder CSS variables via @theme.
            </p>

            <button className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Klicka här
            </button>
          </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Guider</h2>
          <p className="mt-2 text-gray-600">
            Här kan användaren läsa guider och få stöd i olika områden.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Lektioner</h2>
          <p className="mt-2 text-gray-600">
            Här kan vi senare visa lektioner med text, video och quiz.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Progress</h2>
          <p className="mt-2 text-gray-600">
            Här kan användaren följa sin utveckling i plattformen.
          </p>
        </div>
      </div>
    </section>
    </>
  );
}