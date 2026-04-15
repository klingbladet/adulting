export default function LessonsPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">Lessons</h1>
        <p className="mt-3 text-gray-600">
          Här kommer vi senare visa lektioner med text, video och annat innehåll.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Budget basics</h2>
          <p className="mt-3 text-gray-600">
            En enkel lektion om budget, sparande och vardagsekonomi.
          </p>
          <button className="mt-5 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            Öppna lesson
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Första jobbet</h2>
          <p className="mt-3 text-gray-600">
            Lär dig mer om CV, intervjuer och jobbsökande.
          </p>
          <button className="mt-5 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            Öppna lesson
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-blue-600">Flytta hemifrån</h2>
          <p className="mt-3 text-gray-600">
            Tips om boende, hyra, kontrakt och viktiga saker att tänka på.
          </p>
          <button className="mt-5 rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50">
            Öppna lesson
          </button>
        </div>
      </div>
    </div>
  );
}
