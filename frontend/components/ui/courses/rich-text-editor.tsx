'use client'
import axios from 'axios'
import { useState } from 'react'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DragHandle from '@tiptap/extension-drag-handle-react'
import Image from '@tiptap/extension-image'

import MenuBar from './tiptap-menus/MenyBar'


const extensions = [ TextStyleKit, StarterKit, Image ]
const url = ("www")

export default function RichTextEditor () {
  const [ saved, setSaved ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [ error, setError ] = useState('');
  const [ preview, setPreview ] = useState(false);

  const editor = useEditor({
    immediatelyRender: false ,
    extensions,
    content: `
<h2>
  Hi there,
</h2>
<p>
  this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:
</p>
<ul>
  <li>
    That's a bullet list with one …
  </li>
  <li>
    … or two list items.
  </li>
</ul>
<p>
  Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:
</p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
<p>
  I know, I know, this is impressive. It's only the tip of the iceberg though. Give it a try and click a little bit around. Don't forget to check the other examples too.
</p>
<blockquote>
  Wow, that's amazing. Good work, boy! 👏
  <br />
  — Mom
</blockquote>
`,
    })

    if(!editor) {
        return null
    }

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

    const togglePreview = () => {
      //if (!preview) {
        setPreview(!preview)
      //} else {
        //setPreview(preview!)
      //}
    }

    return (
        <>
            {!preview && <MenuBar editor={editor}/> }
            <div>
              <DragHandle editor={editor} className={preview ? 'hidden' : ''}>
              <div className="flex items-center justify-center w-1 h-1.5 before:content-['⠿'] font-medium cursor-grab border rounded-9xl">
              </div>
              </DragHandle>
            </div>
            {preview ? <div dangerouslySetInnerHTML={{__html:editor.getHTML()}} ></div> : <EditorContent editor={editor}/> }
             <div className='flex justify-end gap-1'>
              {preview && 
                <button 
                  onClick={togglePreview}
                  className='border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
                >
                  Sluta förhandsgranska
                </button>
              }
              {!preview && 
                <button 
                  onClick={togglePreview}
                  className='border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
                >
                  Förhandsgranska
                </button>
              }
              <button 
                onClick={handleSave}
                className='border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
              >
                {loading ? 'Wait...' : saved ? 'Sparad' : 'Spara'}
              </button>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </>
    )
}