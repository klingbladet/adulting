export default function Home() {
  return (
    
    
      <div className="bg-background text-foreground p-8 min-h-screen">
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
      );
}