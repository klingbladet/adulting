import Link from 'next/link';
import { getServerSession } from '@/lib/session';
import { getCourses } from '@/lib/api';
import SearchComponent from '@/components/navigation/searchComponent';
import { Bell} from 'lucide-react';
import CategoryCard from '@/components/courses/catagory-cards';

const UserDashboardPage = async () => {
  const session = await getServerSession()
  const courses = await getCourses();
  return (
    <div className="relative mx-auto max-w-5xl h-screen bg-background overflow-y-auto font-sans text-foreground pb-24">
      
      {/* Header Section */}
      <header className="bg-secondary pt-12 pb-6 px-6 relative rounded-b-xl">
        <button className="absolute top-12 right-6">
          <Bell className="w-6 h-6 text-foreground fill-current" />
        </button>
        
        <div className="flex items-center gap-4 mt-6">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
              S
            </div>
            <span className="text-[10px] font-bold mt-1">profil</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">Hi {session?.user?.name}!</h1>
            <p className="text-sm text-muted-foreground leading-tight mt-1 max-w-[200px]">
              Welcome — what would you like to learn today?
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 space-y-8">
        
        {/* Search Bar */}
        <div className="relative">
          <SearchComponent courses={courses} placeholder="Search guides, topics..." />
        </div>

        {/* Start Here Section */}
        <section className='flex flex-col items-center text-center'>
          <h2 className="text-base font-extrabold text-foreground">Start here</h2>
          <p className="text-xs text-muted-foreground mb-4">Choose an area to get started</p>
          
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/courses/category/finance`} className="cursor-pointer">
              <CategoryCard name="Finance" description="Taxes, budget, CSN" />
            </Link>
            <Link href={`/courses/category/housing`} className="cursor-pointer">
              <CategoryCard name="Housing" description="Find and rent housing" />
            </Link>
            <Link href={`/courses/category/driver`} className="cursor-pointer">
              <CategoryCard name="Driver's license" description="Get your license step by step" />
            </Link>
            <Link href={`/courses/category/jobs`} className="cursor-pointer">
              <CategoryCard name="Jobs" description="Find jobs and contracts" />
            </Link>
          </div>
        </section>

        {/* Continue Section */}
        <section>
          <h2 className="text-base font-extrabold text-foreground mb-3">Continue where you left off</h2>
          
          <div className="bg-secondary rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">🏠</span>
                <span className="font-bold text-sm text-foreground">Housing course</span>
              </div>
              <span className="text-xs font-bold text-foreground">0%</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-muted rounded-full h-1">
              <div className="bg-muted-foreground h-1 rounded-full w-[0%]"></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-sm text-foreground">My courses</span>
            <Link href={`/courses/`}>
              <button className="text-sm text-primary hover:underline flex items-center font-medium">
                See all <span className="ml-1">→</span>
              </button>
            </Link>
          </div>
        </section>

        {/* Quick Help Section */}
      </main>
    </div>
  );
};

export default UserDashboardPage;
