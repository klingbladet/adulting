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
    return <p className="text-gray-500 italic bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">Inga block hittades för denna kurs.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Välj block att granska</label>
        <select
          value={selectedBlockId || ''}
          onChange={(e) => setSelectedBlockId(Number(e.target.value))}
          className="w-full font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
        >
          {blocks.map((block, index) => (
            <option key={block.id} value={block.id}>
              Del {index + 1}: {block.title}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-medium text-gray-400">#{blocks.findIndex(b => b.id === activeBlock.id) + 1}</span>
          <h3 className="text-xl font-bold text-gray-800">{activeBlock.title}</h3>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[250px] [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6">
          <TipTapViewer content={activeBlock.content} />
        </div>
      </div>
    </div>
  );
}