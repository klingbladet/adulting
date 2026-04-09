export default function Home() {
  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">
          Välkommen till Adulting
        </h1>
        <p className="mt-4 text-gray-600 text-lg max-w-2xl">
          Här kan du lära dig om vuxenlivet, ekonomi, jobb, boende och andra
          viktiga saker på ett enklare sätt.
        </p>

        <div className="mt-6 flex gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700">
            Kom igång
          </button>

          <button className="border border-gray-300 px-6 py-3 rounded-xl text-gray-700 hover:bg-gray-50">
            Utforska guider
          </button>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900">Utforska kategorier</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">Ekonomi</h3>
            <p className="mt-3 text-gray-600">
              Lär dig hantera pengar, budget och sparande.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">Jobb</h3>
            <p className="mt-3 text-gray-600">
              Få hjälp med CV, jobbansökan och intervjuer.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">Boende</h3>
            <p className="mt-3 text-gray-600">
              Tips om att flytta hemifrån, hyra och bo själv.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">Hälsa</h3>
            <p className="mt-3 text-gray-600">
              Enkla råd om att må bra, vila och bygga bra vanor.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900">Senaste guider</h2>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">
              Gör en enkel budget
            </h3>
            <p className="mt-3 text-gray-600">
              Lär dig grunderna i hur du planerar din ekonomi.
            </p>
            <button className="mt-5 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              Läs mer
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">
              Första jobbet
            </h3>
            <p className="mt-3 text-gray-600">
              Tips om hur du förbereder dig för att söka jobb.
            </p>
            <button className="mt-5 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              Läs mer
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-blue-600">
              Flytta hemifrån
            </h3>
            <p className="mt-3 text-gray-600">
              Viktiga saker att tänka på när du ska bo själv.
            </p>
            <button className="mt-5 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
              Läs mer
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-900">Din progress</h2>

        <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
          <p className="text-lg text-gray-700">Du har klarat 2 av 5 guider.</p>

          <div className="w-full h-3 bg-gray-200 rounded-full mt-4">
            <div className="w-2/5 h-3 bg-blue-600 rounded-full"></div>
          </div>

          <button className="mt-5 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
            Se din progress
          </button>
        </div>
      </div>
    </div>
  );
}