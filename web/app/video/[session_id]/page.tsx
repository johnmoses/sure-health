'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getSession, updateSession } from '@/xlib/api';
import { TelemedicineSession } from '@/xlib/types';

export default function VideoSessionDetailPage() {
  const [session, setSession] = useState<TelemedicineSession | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const router = useRouter();

  const pathname = usePathname();
  const sessionId = pathname.split('/').pop();

  useEffect(() => {
    async function fetchData() {
      if (!sessionId) return;
      try {
        const data = await getSession(Number(sessionId), token);
        setSession(data);
        setVideoUrl(data.video_url || '');
        setStartedAt(data.started_at);
        setEndedAt(data.ended_at || '');
      } catch (e: any) {
        setError(e.message);
      }
    }
    if (token) fetchData();
  }, [sessionId, token]);

  async function handleSave() {
    if (!sessionId) return;
    setError(null);
    try {
      await updateSession(
        Number(sessionId),
        { video_url: videoUrl, started_at: startedAt, ended_at: endedAt || null },
        token
      );
      router.push('/video');
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!session) return <p>Loading...</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Telemedicine Session #{session.id}</h1>
      
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <label className="block mb-1">Video URL</label>
      <input
        type="url"
        value={videoUrl}
        onChange={e => setVideoUrl(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <label className="block mb-1">Started At</label>
      <input
        type="datetime-local"
        value={startedAt}
        onChange={e => setStartedAt(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <label className="block mb-1">Ended At</label>
      <input
        type="datetime-local"
        value={endedAt}
        onChange={e => setEndedAt(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
    </div>
  );
}
