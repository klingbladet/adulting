'use client'
import axios from 'axios'
import { useState, useEffect } from "react";
import Link from "next/link";
import CourseButton from "@/components/courses/course-buttons";
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Block } from '@/types/types';
import { Course } from '@/types/types';
import { Category } from '@/types/types';

export default function CreateBlocks() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Hämtar courseId från antingen sökvägen (/courses/123) eller query-parametern (?courseId=123)
  const courseId = params?.courseId || searchParams.get('courseId');
  
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ activeCourseId, setActiveCourseId ] = useState<number | null>(courseId ? Number(courseId) : null);
  const [ courseTitle, setCourseTitle ] = useState('');
  const [ categoryId, setCategoryId ] = useState<string>('');
  const [ categories, setCategories ] = useState<Category[]>([]);
  const [ blocks, setBlocks ] = useState<Block[]>([
    {
      id: Date.now(), 
      courseId: 0, 
      orderIndex: 0,
      title: '',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph' }
        ]
      }
    }
  ]);

  useEffect(() => {
    // Hämtar dina kategorier från databasen så att vi får riktiga UUID:n
    const fetchCategories = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
        const res = await axios.get(`${baseUrl}/api/courses/categories`, { withCredentials: true });
        setCategories(res.data?.categories || res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    // Denna effekt körs om ett courseId finns i URL:en när komponenten laddas.
    // Den hämtar då befintlig kursdata så att du kan redigera en existerande kurs.
    const fetchCourseData = async (id: string | number) => {
        setLoading(true);
        setError('');
        try {
            const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
            
            // Hämta kursinformation (titel etc.) - OBS: Antar att GET /api/courses/:id finns.
            const coursePromise = axios.get(`${baseUrl}/api/courses/${id}`, { withCredentials: true });
            // Hämta alla block för kursen (innehåll)
            const blocksPromise = axios.get(`${baseUrl}/api/courses/${id}/blocks`, { withCredentials: true });

            const [courseResponse, blocksResponse] = await Promise.all([coursePromise, blocksPromise]);

            const courseData: Course = courseResponse.data.course; 
            const blocksData: Block[] = blocksResponse.data.blocks;
            
            if (courseData) {
                setCourseTitle(courseData.title);
                // Sätt categoryId om det finns (vi utökar typen temporärt för att undvika 'any' varningen)
                const extendedCourse = courseData as Course & { categoryId?: string | number | null };
                if (extendedCourse.categoryId) setCategoryId(String(extendedCourse.categoryId));
                setBlocks(blocksData || []); 
                setActiveCourseId(courseData.id);
            }
        } catch (err) {
            console.error("Failed to fetch course data", err);
            setError("Kunde inte ladda kursdata. Kursen kanske inte finns eller så är du inte inloggad.");
            router.replace('/create/creator-tools/create-blocks'); // Återställ URL om kursen inte hittas
        } finally {
            setLoading(false);
        }
    };

    if (courseId) {
        // Säkerställ att vi bara skickar en sträng, även om `useParams` skulle ge en array (vid catch-all routes)
        const idToFetch = Array.isArray(courseId) ? courseId[0] : courseId;
        fetchCourseData(idToFetch);
    }
  }, [courseId, router]);

  const addBlock = () => {
    const newBlock: Block = {
      id: Date.now(), 
      courseId: 0, 
      orderIndex: blocks.length,
      title: 'Nytt block',
      content: {
        type: 'doc',
        content: [
          { type: 'paragraph' }
        ]
      }
    };
    setBlocks([...blocks, newBlock]);
    setSaved(false)
  }

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSaved(false);
  }

  const handleSave = async () => {
    if (!courseTitle || courseTitle.trim().length < 3) {
      setError('Kursen måste ha en titel på minst 3 tecken.');
      return;
    }

    if (!categoryId) {
      setError('Du måste välja en kategori för kursen.');
      return;
    }

    // Frontend-validering så att redigeraren direkt förstår vad som är fel
    const invalidBlock = blocks.find(b => !b.title || b.title.trim().length < 5);
    if (invalidBlock) {
      setError('Alla block måste ha en titel på minst 5 tecken.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      let targetCourseId = activeCourseId;

      // 1. Skapa kursen först om vi inte redan har ett activeCourseId
      if (!targetCourseId) {
        const courseRes = await axios.post(`${baseUrl}/api/courses`, {
          title: courseTitle,
          categoryId: categoryId, // Är nu garanterat en UUID-sträng från databasen
          status: 'draft', // Status är '.notNull()' i schema, defaultar till draft.
        }, {
          withCredentials: true
        });
        
        targetCourseId = courseRes.data.id || courseRes.data.course?.id;
        if (!targetCourseId) throw new Error("Kunde inte hämta ID för den nya kursen");
        
        setActiveCourseId(targetCourseId);

        // Uppdatera URL:en med det nya kurs-ID:t. Detta gör att om du laddar om sidan,
        // kommer den att ladda in den nyskapade kursen för redigering istället för att starta om från noll.
        router.replace(`/create/creator-tools/create-blocks?courseId=${targetCourseId}`, { scroll: false });
      } else {
        // Om vi redan har targetCourseId bör vi uppdatera kursen med eventuellt nytt namn och kategori.
        await axios.patch(`${baseUrl}/api/courses/${targetCourseId}`, {
          title: courseTitle,
          categoryId: categoryId, // Är nu garanterat en UUID-sträng från databasen
        }, {
          withCredentials: true
        }).catch(err => console.warn("Update course details failed", err));
      }

      // 2. Formatera blocken med rätt targetCourseId
      const blocksToSave = blocks.map((block) => {
        const isNewBlock = block.id > 1000000000000;
        
        const blockPayload = { 
          ...block, 
          courseId: Number(targetCourseId), 
          type: 'text', // Typ krävs normalt enligt schema för blocks
          quizEligible: true
        };
  
        if (isNewBlock) {
          const { id, ...rest } = blockPayload;
          return rest;
        }
        
        return blockPayload;
      });

      // 3. Spara blocken (uppdaterar / skapar nya)
      const url = `${baseUrl}/api/courses/${targetCourseId}/blocks`
      await axios.put(url, { blocks: blocksToSave }, {
        withCredentials: true // Detta är nyckeln! Säger åt axios att skicka med better-auth cookies.
      });
      setSaved(true);
    } catch (error) {
      console.error('Det gick ej att spara lektionen pga servern', error)
      setError('Det gick inte att spara!')
    } finally {
      setLoading (false);
    }
  }

  const updateBlockTitle = (id: number, newTitle: string) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, title: newTitle } : block
    ));
    setSaved(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Skapa en kurs</h1>
      <div>
        <input
          type="text"
          value={courseTitle}
          onChange={(e) => {
            setCourseTitle(e.target.value);
            setSaved(false);
          }}
          placeholder='Kursnamn'
          className="w-full font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
      <div>
        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setSaved(false);
          }}
          className="w-full font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="" disabled>Välj kategori</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>  
      {blocks.map((block, index) => (
        <div key={block.id} className="border p-4 rounded-lg relative bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2 flex-grow max-w-sm">
              <span className="font-medium text-gray-400">#{index + 1}</span>
              <input
                type="text"
                value={block.title || ''}
                onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                placeholder="Skriv en rubrik (minst 5 tecken)"
                className="w-full font-medium text-gray-700 bg-transparent border-b border-dashed border-gray-300 px-1 py-1 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {blocks.length > 1 && (
              <button
                className="text-red-400 hover:text-red-600 text-sm font-medium transition"
                onClick={() => removeBlock(block.id)}
              >
                ✕ Remove
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="flex gap-4">
        <button 
          onClick={addBlock}
          className='border rounded-sm border-blue-500 py-2 px-4 text-blue-600 hover:bg-blue-50 transition'
        >
          + Add block
        </button>

        <button 
          onClick={handleSave}
          className='border rounded-sm border-gray-300 py-2 px-4 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition'
        >
          {loading ? 'Wait...' : saved ? 'Sparad' : 'Spara'}
        </button>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="flex flex-row justify-between mt-10">
        <Link href="/create/creator-tools">
          <CourseButton variant="secondary">Tillbaka</CourseButton>
        </Link>
        {activeCourseId ? (
          <Link href={`/create/creator-tools/create-content?courseId=${activeCourseId}`}>
            <CourseButton>Nästa</CourseButton>
          </Link>
        ) : (
          <div className="opacity-50 cursor-not-allowed">
            <CourseButton disabled>Nästa</CourseButton>
          </div>
        )}
      </div>
    </div>
  );
}