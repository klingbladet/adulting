import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { getCourses } from '@/lib/api';
import SearchComponent from '@/components/navigation/searchComponent';
import CategoryCard from '@/components/courses/category-cards';

function getFirstLetter(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "O";
}

const UserDashboardPage = async () => {
  const session = await getServerSession()
  const courses = await getCourses();
  return (
    <div className="relative w-full min-h-screen bg-background">
      <div className="md:hidden">
        {/* Light mode background */}
        <div
          className="absolute inset-0 dark:hidden bg-cover bg-bottom pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/home-screen-background.png)' }}
        />
        {/* Dark mode background */}
        <div
          className="absolute inset-0 hidden dark:block bg-cover bg-bottom pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/dark-home-screen-background.png)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-auto min-h-full font-sans text-foreground pb-24">

        {/* Header Section */}
        <header className="h-auto min-h-[180px] md:min-h-[240px] bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-12 pb-2 px-6 relative md:pb-6">
          <div className="flex items-center gap-4 mt-6 md:flex-col md:justify-center md:text-center">
            <Link href="/profile" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl overflow-hidden shadow-sm">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "Profil"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getFirstLetter(session?.user?.name || undefined)
                )}
              </div>
              <span className="text-[10px] font-bold mt-1">profil</span>
            </Link>
            <div className="md:mt-4">
              <h1 className="text-xl md:text-4xl font-extrabold text-foreground">Hi {session?.user?.name}!</h1>
              <p className="text-sm md:text-lg text-muted-foreground leading-tight mt-1 max-w-[200px] md:max-w-md mx-auto">
                Välkommen, vad vill du lära dig idag?
              </p>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 pt-4 pb-6 space-y-8 md:px-0 md:py-0 md:space-y-0">

          <div className="flex flex-row justify-center relative md:bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:md:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] md:pb-20 md:pt-10">
            <div className="w-full md:max-w-2xl flex justify-center">
              <SearchComponent courses={courses} placeholder={``} />
            </div>
          </div>

          {/* Start Here Section */}
          <section className='flex flex-col items-left text-left md:max-w-5xl md:mx-auto md:px-8 md:py-16'>
            <h2 className="text-base md:text-2xl font-extrabold text-foreground">Börja här</h2>
            <p className="text-xs md:text-base text-muted-foreground mb-7 md:mb-8">Välj vilket område du vill börja med</p>

            <div className="grid grid-cols-2 gap-4 md:gap-8 w-full max-w-auto h-80">
              <Link href={`/courses/category/finance`} className="block cursor-pointer h-full">
                <CategoryCard
                  name="Ekonomi"
                  description="Skatt, budget, CSN"
                  logoImage="/images/backgrounds/ekonomi-bakgrund.png"
                  colorClass="bg-[#E3F3FB] dark:bg-[#154B65]"
                />
              </Link>
              <Link href={`/courses/category/housing`} className="block cursor-pointer h-full">
                <CategoryCard
                  name="Bostad"
                  description="Bostadslån, ränta, köpa hus"
                  logoImage="/images/backgrounds/bostad-bakgrund.png"
                  colorClass="bg-[#EFF9E8] dark:bg-[#152112]"
                />
              </Link>
              <Link href={`/courses/category/driver`} className="block cursor-pointer h-full">
                <CategoryCard
                  name="Körkort"
                  description="Hur tar jag körkort - steg för steg"
                  logoImage="/images/backgrounds/korkort-bakgrund.png"
                  colorClass="bg-[#DEEDEA] dark:bg-[#1D3537]"
                />
              </Link>
              <Link href={`/courses/category/jobs`} className="block cursor-pointer h-full">
                <CategoryCard
                  name="Jobs"
                  description="Find jobs and contracts"
                  logoImage="/images/backgrounds/jobb-bakgrund.png"
                  colorClass="bg-[#F2F2F2] dark:bg-[#1A1A1A]"
                />
              </Link>
            </div>
          </section>

          {/* Continue Section */}
          <section className="md:mt-30 flex flex-col md:max-w-5xl md:mx-auto md:px-8 md:pb-16 w-full">
            <h2 className="text-base md:text-2xl font-extrabold text-foreground mb-3 md:mb-8">Fortsätt där du slutade</h2>

            <div className="bg-muted md:bg-[#EBF2F9] dark:md:bg-slate-800 rounded-xl pl-4 pr-4 mb-4 flex justify-between items-center md:w-[calc(50%-1rem)]">
              <div className="flex flex-col gap-1 w-full pr-2">
                <span className="font-bold text-sm md:text-lg text-foreground">Bostadskurs</span>
                <p className="text-xs md:text-sm text-muted-foreground md:text-foreground/70">Innan du skriver på ett bostadskontrakt</p>
              </div>
              <img
                src="/images/continue/continue-bostad.png"
                alt="Bostadskurs"
                className="w-16 h-16 md:w-20 md:h-20 object-contain flex-shrink-0"
              />
            </div>
            <div className="flex justify-between items-center md:w-[calc(50%-1rem)]">
              <span className="font-extrabold text-sm md:text-lg text-foreground">My courses</span>
              <Link href={`/courses/`}>
                <button className="text-sm text-muted-foreground hover:underline flex items-center font-medium">
                  See all <span className="ml-1">→</span>
                </button>
              </Link>
            </div>
          </section>

          {/* Quick Help Section */}
        </main>
      </div>
    </div>
  );
};

export default UserDashboardPage;
