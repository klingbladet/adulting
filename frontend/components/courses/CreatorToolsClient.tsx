'use client'
import axios from 'axios'
import { useState } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import RichTextEditor from './rich-text-editor';
import { Block } from '@/types/types';
import { JSONContent } from '@tiptap/core';

export default function CreatorToolsClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // Hämtar courseId från antingen sökvägen (/courses/123) eller query-parametern (?courseId=123)
  const courseId = params?.courseId || searchParams.get('courseId');
  
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
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
    if (!courseId) {
      setError('Kunde inte spara: courseId saknas i URL:en.');
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

    // 1. Formatera blocken innan de skickas till backend
    const blocksToSave = blocks.map((block, index) => {
      // Om id är en jättestor tidsstämpel är blocket nyskapat i frontend.
      // Då MÅSTE vi ta bort id:t så databasen vet att den ska göra en INSERT, inte en UPDATE.
      const isNewBlock = block.id > 1000000000000;
      
      // Konstruera den slutgiltiga payloaden. Här lägger vi till 'type' för backend 
      // utan att det bråkar med det strikta 'Block'-interfacet i React-state.
      const blockPayload = { 
        ...block, 
        courseId: Number(courseId), 
        type: 'text',
        quizEligible: true
      };

      if (isNewBlock) {
        const { id, ...rest } = blockPayload;
        return rest;
      }
      
      return blockPayload;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const url = `${baseUrl}/api/courses/${courseId}/blocks`
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

  const updateBlockContent = (id: number, newContent: JSONContent) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content: newContent } : block
    ));
    setSaved(false)
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

          <RichTextEditor
            content={block.content}
            onChange={(newContent) => updateBlockContent(block.id, newContent)}
          />
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
    </div>
  );
}