'use client'
import axios from 'axios'
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import RichTextEditor from './rich-text-editor';
import { Block } from '@/types/types';
import { Course } from '@/types/types';
import { JSONContent } from '@tiptap/core';
import CreatorStepper from './creator-stepper';

export default function CreatorToolsClient() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  // Hämtar courseId från antingen sökvägen (/courses/123) eller query-parametern (?courseId=123)
  const courseId = params?.courseId || searchParams.get('courseId');

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(courseId ? Number(courseId) : null);
  const [courseTitle, setCourseTitle] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourseData = async (id: string | number) => {
      setLoading(true);
      setError('');
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

        const coursePromise = axios.get(`${baseUrl}/api/courses/${id}`, { withCredentials: true });
        const blocksPromise = axios.get(`${baseUrl}/api/courses/${id}/blocks`, { withCredentials: true });

        const [courseResponse, blocksResponse] = await Promise.all([coursePromise, blocksPromise]);

        // Lägg till fallbacks ifall backend returnerar datan direkt på .data 
        // istället för inkapslat i .data.course / .data.blocks
        const courseData: Course = courseResponse.data?.course || courseResponse.data;
        const blocksData: Block[] = blocksResponse.data?.blocks || blocksResponse.data || [];

        if (courseData) {
          setCourseTitle(courseData.title);

          let useLocal = false;
          const localDraft = localStorage.getItem(`course-content-draft-${courseData.id}`);
          if (localDraft) {
            try {
              const parsed = JSON.parse(localDraft);
              if (parsed.blocks && parsed.blocks.length > 0) {
                setBlocks(parsed.blocks);
                useLocal = true;
              }
            } catch (e) {
              console.error("Kunde inte läsa från localStorage", e);
            }
          }

          if (!useLocal) {
            setBlocks(blocksData);
            setSaved(true);
          }

          if (blocksData.length > 0 && !selectedBlockId) {
            setSelectedBlockId(blocksData[0].id);
          }
          setActiveCourseId(courseData.id);
        }
      } catch (err) {
        console.error("Failed to fetch course data", err);
        setError("Kunde inte ladda kursdata. Kursen kanske inte finns.");
      } finally {
        setLoading(false);
        setIsLoaded(true);
      }
    };

    if (courseId) {
      const idToFetch = Array.isArray(courseId) ? courseId[0] : courseId;
      fetchCourseData(idToFetch);
    }
  }, [courseId]);

  // Spara till localStorage vid varje ändring
  useEffect(() => {
    if (isLoaded && activeCourseId && !saved) {
      localStorage.setItem(`course-content-draft-${activeCourseId}`, JSON.stringify({
        blocks
      }));
    }
  }, [blocks, activeCourseId, isLoaded, saved]);

  const handleSave = async () => {
    if (!activeCourseId) {
      setError('Ingen kurs vald för att spara innehåll.');
      return null;
    }

    setLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

      // Formatera blocken för att bara uppdatera innehållet
      const blocksToSave = blocks.map((block) => ({
        ...block,
        courseId: Number(activeCourseId),
        type: 'text',
        quizEligible: true
      }));

      const url = `${baseUrl}/api/courses/${activeCourseId}/blocks`
      await axios.put(url, { blocks: blocksToSave }, {
        withCredentials: true
      });
      setSaved(true);

      // Rensa utkastet efter sparande
      localStorage.removeItem(`course-content-draft-${activeCourseId}`);
      return activeCourseId;
    } catch (error) {
      console.error('Det gick ej att spara innehållet pga servern', error)
      setError('Det gick inte att spara innehållet!')
      return null;
    } finally {
      setLoading(false);
    }
  }

  const updateBlockContent = (id: number, newContent: JSONContent) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content: newContent } : block
    ));
    setSaved(false)
  }

  const activeBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  return (
    <div className="space-y-6">
      <CreatorStepper currentStep={2} />
      <h1 className="text-2xl font-bold text-foreground">{courseTitle || 'Laddar kurs...'}</h1>
      <p className="text-muted-foreground">Lägg till innehåll i de steg du skapade.</p>

      {blocks.length > 0 && (
        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
          <label className="block text-sm font-semibold text-foreground mb-3">Välj block att redigera</label>
          <select
            value={selectedBlockId || ''}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="w-full font-medium text-foreground bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
          >
            {blocks.map((block, index) => (
              <option key={block.id} value={block.id}>
                {index + 1}: {block.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {activeBlock ? (
        <div key={activeBlock.id} className="border border-border p-6 rounded-2xl relative bg-card shadow-sm mt-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3 flex-grow max-w-sm">
              <span className="font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">#{blocks.findIndex(b => b.id === activeBlock.id) + 1}</span>
              <h2 className="text-xl font-bold text-foreground">{activeBlock.title}</h2>
            </div>
          </div>

          <RichTextEditor
            key={activeBlock.id}
            content={activeBlock.content}
            onChange={(json) => updateBlockContent(activeBlock.id, json)}
          />
        </div>
      ) : (
        !loading && <p className="text-muted-foreground italic">Inga block hittades för denna kurs.</p>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="border border-border rounded-xl py-3 px-6 text-muted-foreground hover:bg-border hover:text-foreground transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? 'Wait...' : saved ? 'Sparad' : 'Spara innehåll'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}