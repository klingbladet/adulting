
'use client'

import { useState } from "react";
import TipTapViewer from "./tiptap-viewer";
import { JSONContent } from "@tiptap/react";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";

interface PreviewBlock {
  id: number;
  title: string;
  content: JSONContent | string | null;
}

interface PreviewClientProps {
  blocks: PreviewBlock[];
}

export default function PreviewClient({ blocks }: PreviewClientProps) {
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(blocks.length > 0 ? blocks[0].id : null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("mobile");

  if (blocks.length === 0) {
    return <p className="text-muted-foreground italic bg-card p-6 rounded-lg shadow-sm border border-border mt-6">Inga block hittades för denna kurs.</p>;
  }

  const activeBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];
  const activeIndex = blocks.findIndex(b => b.id === activeBlock.id);
  const stepNumber = activeIndex + 1;
  const totalBlocks = blocks.length;
  const progress = totalBlocks > 0 ? (stepNumber / totalBlocks) * 100 : 0;
  const nextBlock = activeIndex < totalBlocks - 1 ? blocks[activeIndex + 1] : null;

  return (
    <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border mt-6">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-1">Välj steg att granska</label>
          <select
            value={selectedBlockId || ''}
            onChange={(e) => setSelectedBlockId(Number(e.target.value))}
            className="w-full sm:w-64 font-medium text-foreground bg-background border border-border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer text-sm"
          >
            {blocks.map((block, index) => (
              <option key={block.id} value={block.id}>
                Del {index + 1}: {block.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex bg-muted p-1 rounded-xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => setPreviewMode("desktop")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              previewMode === "desktop"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Monitor size={16} />
            Desktopvy
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode("mobile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              previewMode === "mobile"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Smartphone size={16} />
            Mobilvy
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      {previewMode === "desktop" ? (
        <div className="pt-2 animate-in fade-in duration-200 w-full min-h-[500px] flex flex-col bg-background text-foreground font-sans rounded-2xl overflow-hidden border border-border">
          {/* Header Banner */}
          <header className="flex justify-center items-center w-full bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-10 pb-8 px-6 relative shrink-0 text-left border-b border-border/20">
            <div className="w-full max-w-2xl flex flex-col gap-3 justify-center items-start">
              <div className="flex items-center gap-2 text-foreground/80 cursor-pointer">
                <ArrowLeft size={16} />
                <span className="text-xs font-semibold">Gå tillbaka</span>
              </div>
              
              <div className="flex flex-col items-start">
                <span className="text-xs md:text-sm text-muted-foreground leading-tight">Förhandsgranskning</span>
                <h3 className="text-lg md:text-2xl font-bold text-foreground mt-0.5 leading-tight">{activeBlock.title}</h3>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-sm h-1.5 overflow-hidden rounded-full bg-secondary/60 mt-1">
                <div className="h-full bg-button transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              
              <span className="text-xs font-medium text-foreground/95">
                Steg {stepNumber} av {totalBlocks} avklarat
              </span>
            </div>
          </header>

          {/* Block Content */}
          <div className="flex-1 py-8 px-6 flex justify-center items-start bg-background">
            <div className="prose prose-slate dark:prose-invert w-full max-w-2xl text-base leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6 bg-background">
              <TipTapViewer content={activeBlock.content} />
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="py-6 border-t border-border bg-card flex justify-center shrink-0">
            <div className="w-full max-w-md px-6">
              {nextBlock ? (
                <div className="w-full py-3.5 px-6 bg-button text-white text-sm font-semibold rounded-full select-none cursor-pointer hover:opacity-90 transition-opacity text-center whitespace-nowrap overflow-hidden text-ellipsis shadow-sm">
                  Gå vidare till: {nextBlock.title}
                </div>
              ) : (
                <div className="w-full py-3.5 px-6 bg-button text-white text-sm font-semibold rounded-full select-none cursor-pointer hover:opacity-90 transition-opacity text-center shadow-sm">
                  Gå till quiz
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center py-4 bg-muted/20 rounded-2xl border border-border/50 animate-in fade-in duration-200">
          {/* iPhone Mockup Frame */}
          <div className="relative w-[360px] h-[720px] bg-neutral-900 rounded-[48px] p-[10px] shadow-2xl border border-neutral-800 ring-1 ring-neutral-950/10 flex flex-col z-0">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-[18px] left-1/2 -translate-x-1/2 w-[96px] h-[26px] bg-neutral-900 rounded-full z-30 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-neutral-800 rounded-full ml-auto mr-3" />
            </div>

            {/* Simulated Side Buttons */}
            <div className="absolute left-[-3px] top-[100px] w-[3px] h-[35px] bg-neutral-800 rounded-r-sm" />
            <div className="absolute left-[-3px] top-[145px] w-[3px] h-[45px] bg-neutral-800 rounded-r-sm" />
            <div className="absolute left-[-3px] top-[200px] w-[3px] h-[45px] bg-neutral-800 rounded-r-sm" />
            <div className="absolute right-[-3px] top-[135px] w-[3px] h-[65px] bg-neutral-800 rounded-l-sm" />

            {/* Screen Container */}
            <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-background border border-neutral-950 flex flex-col z-10">
              
              {/* Virtual Status Bar */}
              <div className="h-9 shrink-0 bg-transparent flex items-center justify-between px-6 pt-2.5 text-[11px] font-semibold select-none z-20 text-foreground">
                <span>09:41</span>
                <div className="flex items-center gap-1.5 opacity-80">
                  {/* Signal bars */}
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <rect x="3" y="14" width="3" height="6" rx="0.5" />
                    <rect x="8" y="10" width="3" height="10" rx="0.5" />
                    <rect x="13" y="6" width="3" height="14" rx="0.5" />
                    <rect x="18" y="2" width="3" height="18" rx="0.5" className="opacity-40" />
                  </svg>
                  {/* Wifi signal */}
                  <svg className="w-3.5 h-3.5 stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M5 13a10 10 0 0 1 14 0" />
                    <path d="M8.5 16.5a5 5 0 0 1 7 0" />
                    <path d="M12 20h.01" />
                  </svg>
                  {/* Battery */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <rect x="2" y="7" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                    <rect x="5" y="10" width="10" height="4" />
                    <path d="M20 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Scrollable Mobile Viewport */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden text-gray-950 dark:text-white bg-background text-left relative flex flex-col">
                
                {/* Course Banner / Header */}
                <div className="bg-[linear-gradient(270deg,#DEEDEA_-64.34%,#C0E7F7_89.05%,#4BBDE5_213.33%)] dark:bg-[linear-gradient(270deg,#1D3537_-64.34%,#0C4F80_89.05%,#0A5C9A_213.33%)] pt-6 pb-6 px-5 relative shrink-0">
                  <ArrowLeft size={16} className="text-foreground/80 mb-3 cursor-pointer" />
                  <span className="text-[11px] text-muted-foreground font-sans block leading-none">Förhandsgranskning</span>
                  <h4 className="text-base font-bold text-foreground mt-1 leading-tight">{activeBlock.title}</h4>
                  
                  {/* Progress bar */}
                  <div className="mt-3 h-1 w-full bg-secondary/60 rounded-full overflow-hidden">
                    <div className="h-full bg-button transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[11px] font-medium text-foreground/95 mt-1.5 block">
                    Steg {stepNumber} av {totalBlocks} avklarat
                  </span>
                </div>

                {/* Mobile TipTap Content */}
                <div className="flex-1 p-5 prose prose-slate dark:prose-invert max-w-full text-[14px] leading-relaxed text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 bg-background">
                  <TipTapViewer content={activeBlock.content} />
                </div>

                {/* Mobile Next Step Action Footer */}
                <div className="p-4 border-t border-border bg-card text-center shrink-0">
                  {nextBlock ? (
                    <div className="w-full py-3 px-4 bg-button text-white text-xs font-semibold rounded-full select-none cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis">
                      Gå vidare till: {nextBlock.title}
                    </div>
                  ) : (
                    <div className="w-full py-3 px-4 bg-button text-white text-xs font-semibold rounded-full select-none cursor-pointer hover:opacity-90 transition-opacity">
                      Gå till quiz
                    </div>
                  )}
                </div>

              </div>

              {/* Virtual Home Indicator Bar */}
              <div className="h-4 shrink-0 bg-transparent flex items-center justify-center pb-1">
                <div className="w-32 h-1 bg-foreground/30 rounded-full" />
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}