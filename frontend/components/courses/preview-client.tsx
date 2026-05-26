
'use client'

import { useState } from "react";
import TipTapViewer from "./tiptap-viewer";
import { JSONContent } from "@tiptap/react";

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

  const activeBlock = blocks.find(b => b.id === selectedBlockId) || blocks[0];

  if (blocks.length === 0) {
    return <p className="text-muted-foreground italic bg-card p-6 rounded-lg shadow-sm border border-border mt-6">Inga block hittades för denna kurs.</p>;
  }

  return (
    <div className="bg-card p-8 rounded-2xl shadow-sm border border-border mt-6">
      <div className="mb-8">
        <label className="block text-sm font-semibold text-foreground mb-3">Välj steg att granska</label>
        <select
          value={selectedBlockId || ''}
          onChange={(e) => setSelectedBlockId(Number(e.target.value))}
          className="w-full font-medium text-foreground bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors cursor-pointer"
        >
          {blocks.map((block, index) => (
            <option key={block.id} value={block.id}>
              Del {index + 1}: {block.title}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="font-bold text-muted-foreground bg-secondary px-3 py-1 rounded-lg">#{blocks.findIndex(b => b.id === activeBlock.id) + 1}</span>
          <h3 className="text-2xl font-bold text-foreground">{activeBlock.title}</h3>
        </div>

        <div className="bg-muted/50 p-8 rounded-2xl border border-border min-h-[250px] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
          <TipTapViewer content={activeBlock.content} />
        </div>
      </div>
    </div>
  );
}