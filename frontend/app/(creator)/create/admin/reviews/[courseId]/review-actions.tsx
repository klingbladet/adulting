'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function ReviewActions({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState< 'approve' | 'reject' | null>(null);
  const [error, setError] = useState('');

  const handleUpdateStatus = async (action: 'approve' | 'reject') => {
    setLoading(action);
    setError('');
    
    // Sätt rätt status beroende på vilken knapp som klickas
    const payload = action === 'approve' 
      ? { isPublished: true, status: 'published' }
      : { isPublished: false, status: 'draft' };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await axios.patch(`${baseUrl}/api/courses/${courseId}`, payload, {
        withCredentials: true
      });
      
      // Skicka tillbaka admin till listan och uppdatera den
      router.push('/create/admin/reviews');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(`Det gick inte att ${action === 'approve' ? 'godkänna' : 'neka'} kursen.`);
      setLoading(null);
    }
  };

  return (
    <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold mb-4">Beslut</h3>
      {error && <p className="text-red-500 text-sm font-medium mb-4">{error}</p>}
      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <button onClick={() => handleUpdateStatus('reject')} disabled={!!loading} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">{loading === 'reject' ? 'Sparar...' : 'Neka (återställ till draft)'}</button>
        <button onClick={() => handleUpdateStatus('approve')} disabled={!!loading} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50">{loading === 'approve' ? 'Publicerar...' : 'Godkänn och Publicera'}</button>
      </div>
    </div>
  );
}