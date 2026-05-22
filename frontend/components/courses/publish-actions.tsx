'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import CourseButton from '@/components/courses/course-buttons';
import Link from 'next/link';

export default function PublishActions({ courseId }: { courseId: string | number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePublish = async (isPublished: boolean) => {
    setLoading(true);
    setError('');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      await axios.patch(`${baseUrl}/api/courses/${courseId}`, {
        isPublished: false, // Alltid false tills en admin godkänner!
        status: isPublished ? 'pending_approval' : 'draft'
      }, {
        withCredentials: true
      });
      
      // Rensa eventuella lokala utkast när vi sparat/publicerat
      localStorage.removeItem(`course-draft-${courseId}`);
      localStorage.removeItem(`course-content-draft-${courseId}`);

      // Gå till sammanfattningssidan med rätt status
      router.push(`/create/creator-tools/confirmation?status=${isPublished ? 'review' : 'draft'}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('Det gick inte att uppdatera kursen.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col mt-10 gap-4">
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
      <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
        <Link href={`/create/creator-tools/preview?courseId=${courseId}`} className="w-full sm:w-auto">
          <CourseButton variant="secondary" disabled={loading} fullWidth={false}>Tillbaka</CourseButton>
        </Link>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <CourseButton variant="outline" onClick={() => handlePublish(false)} disabled={loading} fullWidth={false}>
            {loading ? 'Sparar...' : 'Spara som draft'}
          </CourseButton>
          <CourseButton onClick={() => handlePublish(true)} disabled={loading} fullWidth={false}>
          {loading ? 'Sparar...' : 'Skicka in för granskning'}
          </CourseButton>
        </div>
      </div>
    </div>
  );
}