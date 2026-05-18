'use client'
import axios from 'axios'
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import RichTextEditor from './rich-text-editor';
import { Block } from '@/types/types';
import { Course } from '@/types/types';
import { JSONContent } from '@tiptap/core';
import Link from 'next/link';
import CourseButton from './course-buttons';

export default function CreatorToolsClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Hämtar courseId från antingen sökvägen (/courses/123) eller query-parametern (?courseId=123)
  const courseId = params?.courseId || searchParams.get('courseId');
  
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ activeCourseId, setActiveCourseId ] = useState<number | null>(courseId ? Number(courseId) : null);
  const [ courseTitle, setCourseTitle ] = useState('');
  const [ blocks, setBlocks ] = useState<Block[]>([]);
  const [ selectedBlockId, setSelectedBlockId ] = useState<number | null>(null);

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
                setBlocks(blocksData); 
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
        }
    };

    if (courseId) {
        const idToFetch = Array.isArray(courseId) ? courseId[0] : courseId;
        fetchCourseData(idToFetch);
    }
  }, [courseId]);

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      
      if (!activeCourseId) {
        setError('Ingen kurs vald för att spara innehåll.');
        return;
      }

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
    } catch (error) {
      console.error('Det gick ej att spara innehållet pga servern', error)
      setError('Det gick inte att spara innehållet!')
    } finally {
      setLoading (false);
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
      <h1 className="text-2xl font-bold">{courseTitle || 'Laddar kurs...'}</h1>
      <p className="text-gray-500">Lägg till innehåll i de block du skapade.</p>

      {blocks.length > 0 && (
        <div>
          <select
            value={selectedBlockId || ''}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="w-full font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
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
        <div key={activeBlock.id} className="border p-4 rounded-lg relative bg-white shadow-sm mt-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-grow max-w-sm">
              <span className="font-medium text-gray-400">#{blocks.findIndex(b => b.id === activeBlock.id) + 1}</span>
              <h2 className="text-lg font-semibold text-gray-700">{activeBlock.title}</h2>
            </div>
          </div>

          <RichTextEditor
            content={activeBlock.content}
            onChange={(newContent) => updateBlockContent(activeBlock.id, newContent)}
          />
        </div>
      ) : (
        !loading && <p className="text-gray-500 italic">Inga block hittades för denna kurs.</p>
      )}

      <div className="flex gap-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className='border rounded-sm border-blue-500 py-2 px-4 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50'
        >
          {loading ? 'Wait...' : saved ? 'Sparad' : 'Spara innehåll'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      <div className="flex flex-row justify-between mt-10">
        <Link href={`/create/creator-tools/create-blocks?courseId=${activeCourseId}`}>
          <CourseButton variant="secondary">Tillbaka</CourseButton>
        </Link>
        <Link href={`/create/creator-tools/create-content?courseId=${activeCourseId}`}>
          <CourseButton>Nästa</CourseButton>
        </Link>
      </div>
    </div>
  );
}