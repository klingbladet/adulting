import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useCallback } from 'react'

import menuBarStateSelector from './menyBarState'

export default function MenuBar ({ editor } : { editor: Editor | null }) {
    
    const editorState = useEditorState({
        editor: editor!,
        selector: menuBarStateSelector
    })

    const isEditable = useEditorState({
        editor: editor!,
        selector: context => {
            return context.editor.isEditable
        },
    })

    const addImage = useCallback(() => {
        const url = window.prompt('URL')

        if (url) {
            editor!.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    if(!editor) {
        return null
    }

    if(!editorState) {
        return null
    }

    const toggleEditable = () => {
        editor.setEditable(!editor.isEditable)
        editor.view.dispatch(editor.view.state.tr)
    }

    return (
        <div className="bg-gray-200 p-2 rounded-t-sm">
            <div className="button-group text-sm flex items-center gap-1 flex-wrap">
                <button
                    onClick={() => editor.chain().focus().setFontSize('28px').run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editor.isActive('textStyle', { fontSize: '28px' }) ? 'is-active bg-gray-400' : ''}`}
                    data-test-id="28px"
                >
                    Font size 28px
                </button>
                <button
                    onClick={() => editor.chain().focus().setFontSize('32px').run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editor.isActive('textStyle', { fontSize: '32px' }) ? 'is-active bg-gray-400' : ''}`}
                    data-test-id="32px"
                >
                    Font size 32px
                </button>
                <button 
                onClick={() => editor.chain().focus().unsetFontSize().run()} data-test-id="unsetFontSize"
                className='bg-red-300 px-2 rounded-sm'
                >
                    Unset font size
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={!editorState.canBold}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isBold ? 'is-active bg-gray-400' : ''}`}
                >
                    Bold
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={!editorState.canItalic}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isItalic ? 'is-active bg-gray-400' : ''}`}
                >
                    Italic
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={!editorState.canStrike}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isStrike ? 'is-active bg-gray-400' : ''}`}
                >
                    Strike
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={!editorState.canCode}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isCode ? 'is-active bg-gray-400' : ''}`}
                >
                    Code
                </button>
                <button 
                    onClick={() => editor.chain().focus().unsetAllMarks().run()}
                    className='bg-amber-300 px-2 rounded-sm'
                >
                    Clear marks
                </button>
                <button 
                    onClick={() => editor.chain().focus().clearNodes().run()}
                    className='bg-amber-300 px-2 rounded-sm'
                >
                    Clear nodes
                </button>
                <button
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isParagraph ? 'is-active bg-gray-400' : ''}`}
                >
                    Paragraph
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading1 ? 'is-active bg-gray-400' : ''}`}
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading2 ? 'is-active bg-gray-400' : ''}`}
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading3 ? 'is-active bg-gray-400' : ''}`}
                >
                    H3
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading4 ? 'is-active bg-gray-400' : ''}`}
                >
                    H4
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading5 ? 'is-active bg-gray-400' : ''}`}
                >
                    H5
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isHeading6 ? 'is-active bg-gray-400' : ''}`}
                >
                    H6
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isBulletList ? 'is-active bg-gray-400' : ''}`}
                >
                    Bullet list
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isOrderedList ? 'is-active bg-gray-400' : ''}`}
                >
                    Ordered list
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isCodeBlock ? 'is-active bg-gray-400' : ''}`}
                >
                    Code block
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`bg-gray-300 px-2 rounded-sm ${editorState.isBlockquote ? 'is-active bg-gray-400' : ''}`}
                >
                    Blockquote
                </button>
                <button 
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className='bg-blue-300 px-2 rounded-sm'
                >
                    Horizontal rule
                </button>
                <button 
                    onClick={() => editor.chain().focus().setHardBreak().run()}
                    className='bg-purple-300 px-2 rounded-sm'
                >
                    Hard break
                </button>
                <button 
                    onClick={addImage}
                    className='bg-gray-300 px-2 rounded-sm hover:bg-gray-400'
                >
                    Set image
                </button>
                <button 
                    onClick={toggleEditable}
                    className={`bg-gray-300 px-2 rounded-sm ${isEditable ? 'is-active bg-gray-400' : ''}`}
                >
                        Toggle editable
                </button>
                <button 
                    onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo}
                    className='bg-red-300 px-2 rounded-sm'
                >
                    Undo
                </button>
                <button 
                    onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo}
                    className='bg-green-300 px-2 rounded-sm'
                >
                    Redo
                </button>
            </div>
        </div>
    )
}