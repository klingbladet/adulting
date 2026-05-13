'use client'
import axios from 'axios'
import { useState } from "react";
import RichTextEditor from '../rich-text-editor';

export default function CreatorToolsClient() {

  const url = ("www")
  
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ preview, setPreview ] = useState(false);

  const handleSave = async () => {
    setLoading(true);

    try {
      if (!saved) {
        await axios.post(url, {
          headers: {
            'Content-Type': 'application/json',
          }, 
          body: JSON.stringify(editor?.getJSON()),
        });
        setSaved(true);
      } else if (saved) {
        await axios.patch(url)
        setSaved(true)
      }
    } catch (error) {
      console.error('Det gick ej att spara lektionen pga servern', error)
      setError('Det gick inte att spara!')
    } finally {
      setLoading (false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Skapa en kurs</h1>
      <RichTextEditor />
      <button 
        onClick={handleSave}
        className='border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
      >
        + Add block
      </button>
      <button 
        onClick={handleSave}
        className='border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
      >
        {loading ? 'Wait...' : saved ? 'Sparad' : 'Spara'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  );
}