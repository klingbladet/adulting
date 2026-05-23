'use client'
import { useState } from 'react'
import { TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DragHandle from '@tiptap/extension-drag-handle-react'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'
import MenuBar from './tiptap-menus/MenyBar'

interface RichTextEditorProps {
  content: JSONContent | string | null;
  onChange: (json: JSONContent) => void;
}

const extensions = [ 
  TextStyleKit, 
  StarterKit, 
  Image, 
  Youtube.configure({
    controls: false,
    nocookie: true,
    allowFullscreen: false,
  }),
  TextAlign.configure({
        types: ['heading', 'paragraph'],
  }), 
]

export default function RichTextEditor ({ content, onChange }:RichTextEditorProps) {
  const [ preview, setPreview ] = useState(false);

  // Säkerställ att vi hanterar strängifierad JSON korrekt (samma fix som i TipTapViewer)
  let parsedContent = content;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // Fallback till att behålla strängen om det inte är valid JSON
    }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: parsedContent || '<p>Börja skriva...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },

    editorProps: {
      attributes: {
        spellcheck: 'false',
        class: 'min-h-[150px] w-full p-4 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_.ProseMirror-selectednode_iframe]:outline [&_.ProseMirror-selectednode_iframe]:outline-2 [&_.ProseMirror-selectednode_iframe]:outline-blue-400 [&_iframe]:block [&_iframe]:mx-auto',
      },
    },
  })

  if(!editor) {
      return null
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
        <div className="mt-5">
          <DragHandle editor={editor} className={preview ? 'hidden' : ''}>
          <div className="mt-2 flex items-center justify-center w-1 h-1.5 before:content-['⠿'] font-medium cursor-grab border rounded-9xl">
          </div>
          </DragHandle>
        </div>
        {preview ? (
          <div 
            className="min-h-[150px] w-full p-4 [&_p:empty]:min-h-[1.5rem] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_iframe]:block [&_iframe]:mx-auto"
            dangerouslySetInnerHTML={{__html:editor.getHTML()}} 
          ></div>
        ) : (
          <EditorContent editor={editor}/>
        )}
          <div className='flex justify-end gap-1'>
          {preview && 
            <button 
              onClick={togglePreview}
              className='mt-5 border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
            >
              Sluta förhandsgranska
            </button>
          }
          {!preview && 
            <button 
              onClick={togglePreview}
              className='mt-5 border rounded-sm border-gray-300 py-1 px-2 text-gray-600 hover:bg-gray-300 hover:text-white/80 transition duration-300'
            >
              Förhandsgranska
            </button>
          }
        </div>
    </>
  )
}