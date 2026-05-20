'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

export default function ReviewActions({ courseId, courseStatus, courseTitle }: { courseId: string, courseStatus?: string, courseTitle?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'approve' | 'reject' | 'delete' | null>(null);
  const [error, setError] = useState('');
  
  // Status action modal
  const [pendingAction, setPendingAction] = useState<'approve' | 'reject' | null>(null);
  
  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const expectedTitleToMatch = courseTitle || "";

  const handleUpdateStatus = async (action: 'approve' | 'reject') => {
    setLoading(action);
    setError('');
    
    // Sätt rätt status beroende på vilken knapp som klickas
    const payload = action === 'approve' 
      ? { isPublished: true, status: 'published' }
      : { isPublished: false, status: 'rejected' };

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await axios.patch(`${baseUrl}/api/courses/${courseId}`, payload, {
        withCredentials: true
      });
      
      // Skicka tillbaka admin till listan med status som query param för bekräftelse
      router.push(`/create/admin/reviews?status=${action === 'approve' ? 'approved' : 'rejected'}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(`Det gick inte att ${action === 'approve' ? 'godkänna' : 'neka'} kursen.`);
      setLoading(null);
      setPendingAction(null);
    }
  };

  const handleDelete = async () => {
    setLoading('delete');
    setError('');

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await axios.delete(`${baseUrl}/api/courses/${courseId}`, {
        withCredentials: true
      });
      router.push('/create/admin/reviews');
      router.refresh();
    } catch (error) {
      console.error("Det gick inte att ta bort kursen", error);
      setError("Något gick fel när kursen skulle raderas.");
      setLoading(null);
      setShowDeleteModal(false);
    }
  };

  const confirmAction = () => {
    if (pendingAction) {
      handleUpdateStatus(pendingAction);
    }
  };

  return (
    <>
      <div className="mt-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-4">Beslut</h3>
        {error && <p className="text-red-500 text-sm font-medium mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          
          {(courseStatus === 'pending_approval' || courseStatus === 'published') && (
            <button 
              onClick={() => setPendingAction('reject')} 
              disabled={!!loading} 
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
            >
              {loading === 'reject' ? 'Sparar...' : courseStatus === 'published' ? 'Neka (Avpublicera)' : 'Neka (återställ till nekad)'}
            </button>
          )}

          {courseStatus === 'rejected' && (
            <button 
              onClick={() => setShowDeleteModal(true)} 
              disabled={!!loading} 
              className="px-6 py-3 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Trash2 size={20} />
              {loading === 'delete' ? 'Raderar...' : 'Ta bort permanent'}
            </button>
          )}

          {(courseStatus === 'pending_approval' || courseStatus === 'rejected') && (
            <button 
              onClick={() => setPendingAction('approve')} 
              disabled={!!loading} 
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading === 'approve' ? 'Publicerar...' : 'Godkänn och Publicera'}
            </button>
          )}

        </div>
      </div>

      {pendingAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Bekräfta beslut
            </h3>
            <p className="mb-6 text-gray-600 text-lg">
              Är du säker på att du vill {pendingAction === 'approve' ? 'godkänna och publicera' : 'neka'} denna kurs?
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingAction(null)}
                disabled={!!loading}
                className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={confirmAction}
                disabled={!!loading}
                className={`px-5 py-2 text-white rounded-lg transition-colors font-medium disabled:opacity-50 ${
                  pendingAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {loading ? 'Laddar...' : 'Ja, genomför'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Radera kurs permanent</h3>
            <p className="mb-4 text-sm text-gray-600">
              Är du säker på att du vill radera <strong>{expectedTitleToMatch}</strong>? Denna åtgärd går inte att ångra och all data kommer att försvinna permanent.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skriv <strong>{expectedTitleToMatch}</strong> för att bekräfta:
              </label>
              <input
                type="text"
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-800 bg-transparent"
                placeholder={expectedTitleToMatch}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={!!loading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteInput !== expectedTitleToMatch || !!loading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === 'delete' ? "Raderar..." : "Radera permanent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}