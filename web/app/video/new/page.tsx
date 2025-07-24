'use client';

import React, { useState } from 'react';
import { createSession } from '@/xlib/api';
import { useRouter } from 'next/navigation';

export default function NewVideoSessionPage() {
  const [appointmentId, setAppointmentId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createSession(
        {
          appointment_id: Number(appointmentId),
          video_url: videoUrl,
          started_at: startedAt,
          ended_at: endedAt || undefined,
        },
        token
      );
      router.push('/video');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form className="max-w-md mx-auto p-4" onSubmit={handleSubmit}>
      <h1 className="text-2xl mb-4">Create Telemedicine Session</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <label className="block mb-1">Appointment ID</label>
      <input type="number" value={appointmentId} onChange={e => setAppointmentId(e.target.value)} required className="mb-4 p-2 border rounded w-full" />

      <label className="block mb-1">Video URL</label>
      <input type="url" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} className="mb-4 p-2 border rounded w-full" />

      <label className="block mb-1">Started At</label>
      <input type="datetime-local" value={startedAt} onChange={e => setStartedAt(e.target.value)} required className="mb-4 p-2 border rounded w-full" />

      <label className="block mb-1">Ended At (optional)</label>
      <input type="datetime-local" value={endedAt} onChange={e => setEndedAt(e.target.value)} className="mb-4 p-2 border rounded w-full" />

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create Session</button>
    </form>
  );
}
