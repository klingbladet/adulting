'use client'
import axios from 'axios'
import { useState } from "react";
import { useSearchParams } from 'next/navigation';
import RichTextEditor from './rich-text-editor';
import { Block } from '@/types/types';
import { JSONContent } from '@tiptap/core';

export default function CreatorToolsClient() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId')
  
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ blocks, setBlocks ] = useState<Block[]>([
    {
      id: Date.now(), 
      courseId: 0, 
      orderIndex: 0,
      title: '',
      content: {}
    }
  ]);

  const addBlock = () => {
    const newBlock: Block = {
      id: Date.now(), 
      courseId: 0, 
      orderIndex: blocks.length,
      title: 'Nytt block',
      content: []
    };
    setBlocks([...blocks, newBlock]);
    setSaved(false)
  }

  const removeBlock = (id: number) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSaved(false);
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = `/api/courses/${courseId}/blocks`
      await axios.post(url, { blocks })
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Skapa en kurs</h1>
      
      {blocks.map((block, index) => (
        <div key={block.id} className="border p-4 rounded-lg relative bg-white shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium text-gray-500">Block {index + 1}</h2>
            
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