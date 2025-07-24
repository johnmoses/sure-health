'use client';

import React, { useState } from 'react';
import { getMedicationAdvice } from '@/xlib/api';

export default function MedicationAdvicePage() {
  const [query, setQuery] = useState('');
  const [context, setContext] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse(null);

    if (!query.trim()) {
      setError('Query text is required.');
      return;
    }

    try {
      const res = await getMedicationAdvice(query, context, token);
      if (res.success) {
        setResponse(res.advice || 'No advice returned.');
      } else {
        setError(res.message || 'Failed to get medication advice.');
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Medication Advice</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {response && <p className="mb-2 text-green-700 whitespace-pre-wrap">{response}</p>}

      <label className="block mb-1">Query:</label>
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={4}
        className="mb-4 p-2 border rounded w-full"
        placeholder="Enter your medication question"
        required
      />

      <label className="block mb-1">Context (optional):</label>
      <textarea
        value={context}
        onChange={e => setContext(e.target.value)}
        rows={3}
        className="mb-4 p-2 border rounded w-full"
        placeholder="Additional context (clinical notes, history)"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ask</button>
    </form>
  );
}
