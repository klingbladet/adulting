import StepCard from "@/components/ui/lessons/course/course-layout";
import { House, HandCoins, Landmark } from 'lucide-react';
import Link from "next/link";

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Hej Benjamin!</h1>
      <p className="mt-2 mb-10 text-muted-foreground">
        Välkommen - vad vill du lära dig idag?
      </p>
      <div className="flex flex-col gap-4">
        <Link href="/courses/hitta-bostad">
          <StepCard
              icon={<House />}
              title="Hitta bostad"
              description="Guide 25min"
          />
        </Link>
        <Link href="">
          <StepCard
              icon={<HandCoins />}
              title="Ansök om CSN"
              description="Steg för steg - 5 min"
          />
        </Link>
        <Link href="">
          <StepCard
              icon={<Landmark />}
              title="Öppna ett bankkonto"
              description="Checklista - 3 min"
          />
        </Link>
      </div>

    </div>
  );
}