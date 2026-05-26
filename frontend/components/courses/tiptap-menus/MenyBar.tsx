import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { useCallback } from 'react'
import React from 'react'
import { 
    Bold, Italic, Strikethrough, Code, AlignLeft, AlignCenter, AlignRight, 
    Eraser, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, 
    Pilcrow, List, ListOrdered, Quote, FileCode, Minus, CornerDownLeft, 
    Image as ImageIcon, Video, Undo, Redo, X, Maximize, Check, Lock, Unlock
} from 'lucide-react'

import menuBarStateSelector from './menyBarState'

interface ToolbarBtnProps {
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    title?: string;
    testId?: string;
}

const ToolbarBtn = ({ active, disabled, onClick, children, title, testId }: ToolbarBtnProps) => (
    <button
        onClick={(e) => { e.preventDefault(); onClick(); }}
        disabled={disabled}
        title={title}
        data-test-id={testId}
        className={`p-1.5 rounded-md transition-colors flex items-center justify-center shrink-0 ${
            disabled ? 'opacity-30 cursor-not-allowed' :
            active ? 'bg-blue-100 text-blue-700 shadow-sm' :
            'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`}
    >
        {children}
    </button>
)

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-1 shrink-0" />

export default function MenuBar ({ editor } : { editor: Editor | null }) {
    const [height, setHeight] = React.useState(180)
    const [width, setWidth] = React.useState(320)


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

    const addYoutubeVideo = () => {
      const url = window.prompt('Enter YouTube URL')

      if (url) {
        editor!.commands.setYoutubeVideo({
          src: url,
          width: Math.max(320, width) || 640,
          height: Math.max(180, height) || 480,
        })
      }
    }

    const updateMediaSize = () => {
        editor!.chain()
        .focus()
        .selectAll()
        .updateAttributes('youtube', {
            width: Math.max(320, width) || 640,
            height: Math.max(180, height) || 480,
        })
        .updateAttributes('image', {
            width: Math.max(320, width) || 640,
            height: Math.max(180, height) || 480,
        })
        .run()
    }

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
        <div className="flex flex-wrap items-center gap-1 w-full text-gray-700">
            <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editorState.canUndo} title="Ångra"><Undo size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editorState.canRedo} title="Gör om"><Redo size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().setFontSize('28px').run()} active={editor.isActive('textStyle', { fontSize: '28px' })} testId="28px"><span className="text-[11px] font-bold px-0.5">28</span></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setFontSize('32px').run()} active={editor.isActive('textStyle', { fontSize: '32px' })} testId="32px"><span className="text-[11px] font-bold px-0.5">32</span></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().unsetFontSize().run()} title="Återställ textstorlek" testId="unsetFontSize"><X size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editorState.isHeading1} title="Rubrik 1"><Heading1 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editorState.isHeading2} title="Rubrik 2"><Heading2 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editorState.isHeading3} title="Rubrik 3"><Heading3 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} active={editorState.isHeading4} title="Rubrik 4"><Heading4 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} active={editorState.isHeading5} title="Rubrik 5"><Heading5 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} active={editorState.isHeading6} title="Rubrik 6"><Heading6 size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setParagraph().run()} active={editorState.isParagraph} title="Brödtext"><Pilcrow size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editorState.isBold} disabled={!editorState.canBold} title="Fet"><Bold size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editorState.isItalic} disabled={!editorState.canItalic} title="Kursiv"><Italic size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editorState.isStrike} disabled={!editorState.canStrike} title="Genomstruken"><Strikethrough size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editorState.isCode} disabled={!editorState.canCode} title="Kod"><Code size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editorState.isAlignLeft} title="Vänsterjustera"><AlignLeft size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editorState.isAlignCenter} title="Centrera"><AlignCenter size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editorState.isAlignRight} title="Högerjustera"><AlignRight size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editorState.isBulletList} title="Punktlista"><List size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editorState.isOrderedList} title="Numrerad lista"><ListOrdered size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editorState.isBlockquote} title="Citat"><Quote size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editorState.isCodeBlock} title="Kodblock"><FileCode size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linje"><Minus size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => editor.chain().focus().setHardBreak().run()} title="Radbrytning"><CornerDownLeft size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={() => { editor.chain().focus().unsetAllMarks().run(); editor.chain().focus().clearNodes().run(); }} title="Rensa formatering"><Eraser size={16} /></ToolbarBtn>
            
            <Divider />
            
            <ToolbarBtn onClick={addImage} title="Infoga bild"><ImageIcon size={16} /></ToolbarBtn>
            <ToolbarBtn onClick={addYoutubeVideo} testId="add" title="Infoga YouTube-video"><Video size={16} /></ToolbarBtn>
            
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-md text-xs ml-1 shadow-sm">
                <Maximize size={14} className="text-gray-400" />
                <input
                    id="width"
                    type="number" min="320" max="1024" placeholder="W" value={width}
                    onChange={event => setWidth(Number(event.target.value))}
                    className="w-10 bg-transparent text-center focus:outline-none text-gray-700 font-medium"
                    title="Bredd"
                />
                <span className="text-gray-400">x</span>
                <input
                    id="height"
                    type="number" min="180" max="720" placeholder="H" value={height}
                    onChange={event => setHeight(Number(event.target.value))}
                    className="w-10 bg-transparent text-center focus:outline-none text-gray-700 font-medium"
                    title="Höjd"
                />
                <button onClick={(e) => { e.preventDefault(); updateMediaSize(); }} className="ml-1 text-gray-400 hover:text-blue-600 transition-colors" title="Uppdatera mediestorlek">
                    <Check size={14} />
                </button>
            </div>
            
            <div className="flex-grow" />
            
            <ToolbarBtn onClick={toggleEditable} active={!isEditable} title={isEditable ? 'Lås redigering' : 'Lås upp redigering'}>
                {isEditable ? <Unlock size={16} /> : <Lock size={16} />}
            </ToolbarBtn>
        </div>
    )
}