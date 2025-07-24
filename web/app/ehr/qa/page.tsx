'use client';

import React, { useState } from 'react';
import { ehrSmartQuery } from '@/xlib/api';

export default function SmartQueryPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAnswer(null);
    if (!query.trim()) {
      setError('Please enter a query question');
      return;
    }
    try {
      const res = await ehrSmartQuery(query, token);
      if (res.success) {
        setAnswer(res.answer || "No answer returned");
      } else {
        setError(res.message || 'Failed to retrieve answer');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Ask Your Electronic Health Record</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {answer && <p className="mb-4 text-green-700 whitespace-pre-wrap">{answer}</p>}

      <textarea
        rows={5}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Enter your question about your medical history, lab results, or treatments"
        className="mb-4 w-full p-2 border rounded"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
}
