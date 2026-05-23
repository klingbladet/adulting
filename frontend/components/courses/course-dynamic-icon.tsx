import Image from 'next/image';
import { BookOpen } from 'lucide-react'; // Fallback-ikon om ingen bild matchar

export interface CourseIconData {
  title?: string;
  category?: {
    name?: string;
    iconName?: string | null;
  } | null;
}

export default function getCourseIcon(course: CourseIconData) {
  // 1. Leta i databasen ifall du angett ett exakt filnamn där (t.ex. "icon_name": "house.jpg")
  const iconName = course.category?.iconName;
  if (iconName && (iconName.endsWith('.jpg') || iconName.endsWith('.png'))) {
    return (
      <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
        <Image src={`/images/${iconName}`} alt={iconName} width={24} height={24} className="w-full h-full object-contain" />
      </div>
    );
  }

  const categoryName = course.category?.name?.toLowerCase() || "";
  const title = course.title?.toLowerCase() || "";

  // 2. Mappa kategorinamn ELLER titel (kombinerar front- och backendlogik)
  if (categoryName.includes("ekonomi") || title.includes("ekonomi") || title.includes("skatt") || title.includes("csn")) return (
    <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
      <Image src="/images/icons/ekonomi.jpg" alt="Ekonomi" width={24} height={24} className="w-full h-full object-contain" />
    </div>
  );
  if (categoryName.includes("bostad") || title.includes("bostad") || title.includes("boende")) return (
    <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
      <Image src="/images/icons/bostad.jpg" alt="Bostad" width={24} height={24} className="w-full h-full object-contain" />
    </div>
  );
  if (categoryName.includes("jobb") || title.includes("jobb")) return (
    <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
      <Image src="/images/icons/jobb.jpg" alt="Jobb" width={24} height={24} className="w-full h-full object-contain" />
    </div>
  );
  if (categoryName.includes("körkort") || title.includes("körkort")) return (
    <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
      <Image src="/images/icons/korkort.jpg" alt="Körkort" width={24} height={24} className="w-full h-full object-contain" />
    </div>
  );
  if (title.includes("utbild")) return (
    <div className="w-full h-full rounded-full border-[0.5px] border-black/70 bg-white flex items-center justify-center p-[20%]">
      <Image src="/images/icons/utbildning.jpg" alt="Utbildning" width={24} height={24} className="w-full h-full object-contain" />
    </div>
  );

  // Fallback: Sätt padding på fallback-boken så den passar designen
  return <BookOpen className="w-full h-full text-gray-400 p-[15%]" />;
}
