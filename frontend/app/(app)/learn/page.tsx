import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { getCourses } from '@/lib/api';
import SearchComponent from '@/components/navigation/searchComponent';
import CategoryCard from '@/components/courses/category-cards';
import ContinueCard from '@/components/courses/continue-card';
import { cookies } from 'next/headers';

function getFirstLetter(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || "O";
}

const UserDashboardPage = async () => {
  const session = await getServerSession()
  const cookieStore = await cookies();
  const courses = await getCourses({
    headers: {
      cookie: cookieStore.toString()
    }
  });
  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-background">
      <div className="md:hidden">
        {/* Light mode figures in bottom corners */}
        <div
          className="absolute left-0 bottom-0 w-32 h-32 dark:hidden bg-contain bg-left-bottom bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/home-screen-figure-left.png)' }}
        />
        <div
          className="absolute right-0 bottom-0 w-32 h-32 dark:hidden bg-contain bg-right-bottom bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/home-screen-figure-right.png)' }}
        />
        {/* Dark mode figures in bottom corners */}
        <div
          className="absolute left-0 bottom-0 w-32 h-32 hidden dark:block bg-contain bg-left-bottom bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/dark-home-screen-figure-left.png)' }}
        />
        <div
          className="absolute right-0 bottom-0 w-32 h-32 hidden dark:block bg-contain bg-right-bottom bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/images/backgrounds/dark-home-screen-figure-right.png)' }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-auto min-h-full font-sans text-foreground pb-24">

        {/* Header Section */}
        <header className="h-auto min-h-[180px] md:min-h-[240px] bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-8 pb-6 px-6 relative md:pb-8 flex flex-col items-center md:justify-center text-center">

          {/* Profile Picture in Top Right */}
          <div className="mb-4 mt-2 flex justify-center w-full">
            <img
              src="/images/logotype/astronaut-logo-2.png"
              alt="Adulting Logotyp"
              className="h-40 md:h-14 object-contain"
            />
          </div>
          <div className='flex flex-row items-center gap-3'>
            <Link href="/profile" className="flex flex-col items-center hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-lg md:text-xl overflow-hidden shadow-md border-2 border-white/50 dark:border-white/10">
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
            </Link>
            <div className="flex flex-col gap-2 w-full items-start">
              <h1 className="text-xl md:text-4xl font-extrabold text-foreground">Hej {session?.user?.name}!</h1>
              <p className="text-sm md:text-lg text-muted-foreground leading-tight max-w-[250px] md:max-w-md">
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
                  name="Jobb"
                  description="Söka jobb, rekrytering, CV"
                  logoImage="/images/backgrounds/jobb-bakgrund.png"
                  colorClass="bg-[#F2F2F2] dark:bg-[#1A1A1A]"
                />
              </Link>
            </div>
          </section>

          {/* Continue Section */}
          <section className="md:mt-30 flex flex-col md:max-w-5xl md:mx-auto md:px-8 md:pb-16 w-full">
            <h2 className="text-base md:text-2xl font-extrabold text-foreground mb-3 md:mb-8">Fortsätt där du slutade</h2>
            <ContinueCard />
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
