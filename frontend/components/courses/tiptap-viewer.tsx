'use client'

import { useEffect } from 'react';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react'
import { TextStyleKit } from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import TextAlign from '@tiptap/extension-text-align'

interface TipTapViewerProps {
  // Kan ta in antingen ett JSON-objekt eller en sträng
  content: JSONContent | string | null;
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

export default function TipTapViewer({ content }: TipTapViewerProps) {
  let parsedContent = content;

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // Är det vanlig text/html (inte JSON) faller vi tillbaka till att behålla strängen.
    }
  }

  const editor = useEditor({
    editable: false, // Detta gör editorn read-only
    immediatelyRender: false,
    extensions,
    content: parsedContent || '<p></p>',
  })

  // Uppdatera innehållet dynamiskt när prop 'content' ändras
  useEffect(() => {
    if (editor && parsedContent) {
      editor.commands.setContent(parsedContent);
    }
  }, [parsedContent, editor]);

  if (!editor) {
    return null
  }

  return <EditorContent editor={editor} />
}