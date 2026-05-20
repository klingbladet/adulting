import Image from 'next/image';
import { Course } from '@/types/types';
import { BookOpen } from 'lucide-react'; // Fallback-ikon om ingen bild matchar


export default function getCourseIcon(course: Course) {
  // 1. Leta i databasen ifall du angett ett exakt filnamn där (t.ex. "icon_name": "house.jpg")
  const iconName = course.category?.iconName;
  if (iconName && (iconName.endsWith('.jpg') || iconName.endsWith('.png'))) {
    return <Image src={`/images/${iconName}`} alt={iconName} width={24} height={24} className="w-full h-full object-contain" />;
  }

  const categoryName = course.category?.name.toLowerCase() || "";
  
  // 2. Mappa kategorinamn till dina lokala JPG-filer (byt ut namnen så de matchar filerna i din images-mapp)
  if (categoryName.includes("ekonomi")) return <Image src="/images/icons/ekonomi.jpg" alt="Ekonomi" width={24} height={24} className="w-full h-full object-contain" />;
  if (categoryName.includes("bostad")) return <Image src="/images/icons/bostad.jpg" alt="Bostad" width={24} height={24} className="w-full h-full object-contain" />;
  if (categoryName.includes("jobb")) return <Image src="/images/icons/jobb.jpg" alt="Jobb" width={24} height={24} className="w-full h-full object-contain" />;
  if (categoryName.includes("körkort")) return <Image src="/images/icons/korkort.jpg" alt="Körkort" width={24} height={24} className="w-full h-full object-contain" />;

  return <BookOpen className="w-full h-full text-gray-400" />;
}
