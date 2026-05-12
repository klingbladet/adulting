import { House, Wallet, Briefcase, GraduationCap, HeartPulse, BookOpen } from 'lucide-react';
import { Course } from '@/app/types/types';


const ICON_MAP: Record<string, React.ElementType> = {
  House,
  Wallet,
  Briefcase,
  GraduationCap,
  HeartPulse,
  BookOpen,
};

export default function getCourseIcon(course: Course) {
  const iconName = course.category?.iconName;
  const IconComponent = iconName ? ICON_MAP[iconName] : null;
  
  if (IconComponent) return <IconComponent className="w-full h-full"/>;

  const categoryName = course.category?.name.toLowerCase() || "";
  if (categoryName.includes("ekonomi")) return <Wallet />;
  if (categoryName.includes("bostad")) return <House />;
  if (categoryName.includes("jobb")) return <Briefcase />;

  return <BookOpen />;
}
