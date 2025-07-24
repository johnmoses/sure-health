'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { listSessions, deleteSession } from '@/xlib/api';
import { TelemedicineSession } from '@/xlib/types';

export default function VideoSessionsPage() {
  const [sessions, setSessions] = useState<TelemedicineSession[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    listSessions(token).then(setSessions).catch(e => setError(e.message));
  }, [token]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this session?')) return;
    try {
      await deleteSession(id, token);
      setSessions(sessions.filter(s => s.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">Telemedicine Sessions</h1>
      <Link href="/video/new" className="bg-blue-600 text-white px-4 py-2 rounded mb-4 inline-block">New Session</Link>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {sessions.length === 0 ? (
        <p>No sessions found.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map(session => (
            <li key={session.id} className="border p-4 rounded-md shadow">
              <p><strong>Appointment ID:</strong> {session.appointment_id}</p>
              <p><strong>Started At:</strong> {new Date(session.started_at).toLocaleString()}</p>
              <p><strong>Ended At:</strong> {session.ended_at ? new Date(session.ended_at).toLocaleString() : 'Ongoing'}</p>
              <div className="flex gap-4 mt-2">
                <Link href={`/video/${session.id}`} className="text-blue-600 hover:underline">View/Edit</Link>
                <button onClick={() => handleDelete(session.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
