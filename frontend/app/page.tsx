export default function Home() {
  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Välkommen till Adulting</h1>
        <p className="mt-3 max-w-2xl text-lg text-gray-600">
          
        </p>
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
  );
}