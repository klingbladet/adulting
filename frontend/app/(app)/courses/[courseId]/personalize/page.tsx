'use client';
import CourseButton from '@/components/courses/course-buttons';
import Link from 'next/link'
import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { enrollInCourse } from '@/lib/api';
import { CheckCircle2 } from 'lucide-react';

type KnowledgeLevel = "beginner" | "intermediate";

const levelOptions: { label: string; value: KnowledgeLevel }[] = [
  { label: 'Helt ny - vet inte var jag ska börja', value: 'beginner' },
  { label: 'Lite grann - har kollat men osäker', value: 'intermediate' }
];

export default function Personalize({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.courseId;
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState<KnowledgeLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setIsLoading(true);
    setError(null);
    try {
      await enrollInCourse(courseId, selectedLevel ?? undefined);
      router.push(`/courses/${courseId}/overview`);
    } catch (err) {
      console.error(err);
      setError('Något gick fel. Försök igen.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 relative mx-auto max-w-5xl">
      <h1 className="text-3xl">Anpassa kursen till dig</h1>
      <p className="text-sm">Svara på några korta frågor så anpassar vi innehållet. Du kan hoppa över ifall du vill</p>
      <h3 className="text-sm"><strong>Hur mycket vet du om att hyra bostad?</strong></h3>
      <div className="flex flex-col gap-3 text-sm">
        {levelOptions.map((option) => (
          <label key={option.value} className="cursor-pointer group">
            <input
              type="radio"
              name="knowledge-level"
              className="peer sr-only"
              value={option.value}
              checked={selectedLevel === option.value}
              onChange={() => setSelectedLevel(option.value)}
            />
            <div className="flex items-center justify-between p-3 border-2 border-border rounded-xl transition-all
                          peer-checked:border-primary peer-checked:bg-secondary
                          group-hover:border-ring">
              <p className="font-medium text-foreground">
                {option.label}
              </p>
              <CheckCircle2
                className={`w-5 h-5 text-primary transition-opacity ${selectedLevel === option.value ? 'opacity-100' : 'opacity-0'}`}
              />
            </div>
          </label>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <CourseButton onClick={handleSave} disabled={isLoading}>
        {isLoading ? 'Sparar...' : 'Spara och fortsätt till kurs'}
      </CourseButton>

      <Link href={`/courses/${courseId}/overview`} className="text-center text-sm text-muted-foreground underline">
        Hoppa över
      </Link>
    </div>
  );
}
