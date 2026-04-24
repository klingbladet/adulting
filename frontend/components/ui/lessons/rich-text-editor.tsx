'use client'
import { FontSize, TextStyleKit } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DragHandle from '@tiptap/extension-drag-handle-react'

import MenuBar from './tiptap-menus/MenyBar'

const extensions = [FontSize, TextStyleKit, StarterKit]

export default function RichTextEditor () {
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

    return (
        <>
            <MenuBar editor={editor}/>
            <DragHandle editor={editor}
       
            >
              <div className="flex items-center justify-center w-1 h-1.5 before:content-['⠿'] font-medium cursor-grab border rounded-9xl">
              </div>
            </DragHandle>
            <EditorContent editor={editor}/>
        </>
    )
}