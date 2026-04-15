const menuItems = [
  {
    title: "Guider",
    description: "Läs guider om ekonomi, jobb, boende och vardag.",
  },
  {
    title: "Lektioner",
    description: "Utforska lektioner med text, video och quiz senare.",
  },
  {
    title: "Progress",
    description: "Följ din utveckling och se vad du har klarat.",
  },
  {
    title: "Profil",
    description: "Se dina mål, inställningar och sparad information senare.",
  },
];

export default function MenuPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-gray-900">Meny</h1>
        <p className="mt-3 text-lg text-gray-600">
          Här kommer användaren kunna navigera mellan olika delar av plattformen.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-2">
        {menuItems.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-2xl font-semibold text-blue-600">{item.title}</h2>
            <p className="mt-3 text-gray-600">{item.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}