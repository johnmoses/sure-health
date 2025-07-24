'use client';

import React, { useState } from 'react';
import { nlpCreateAppointment } from '@/xlib/api';

export default function NLPCreatePage() {
  const [query, setQuery] = useState('');
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultMsg(null);
    if (!query.trim()) {
      setError('Please enter your appointment request');
      return;
    }
    try {
      const data = await nlpCreateAppointment(query, token);
      setResultMsg('Appointment created successfully!');
      setQuery('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Create Appointment (NLP)</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {resultMsg && <p className="mb-2 text-green-600">{resultMsg}</p>}
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={5}
        placeholder="Describe your appointment request in natural language"
        className="mb-4 w-full p-2 border rounded"
      />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
