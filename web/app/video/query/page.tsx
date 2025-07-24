'use client';

import React, { useState } from 'react';
import { videoAgentQuery } from '@/xlib/api';

export default function VideoAgentQueryPage() {
  const [query, setQuery] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [agentKey, setAgentKey] = useState('video_summarizer');
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAnswer(null);

    if (!query.trim()) {
      setError('Query is required.');
      return;
    }

    try {
      const resp = await videoAgentQuery(query, token, sessionId ? Number(sessionId) : undefined, agentKey);
      setAnswer(resp.answer);
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Video Agent Query</h1>

      {error && <p className="mb-4 text-red-600">{error}</p>}
      {answer && <pre className="mb-4 whitespace-pre-wrap bg-gray-100 p-4 rounded">{answer}</pre>}

      <label className="block mb-1">Query</label>
      <textarea
        rows={4}
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Ask about the video session..."
        className="mb-4 w-full p-2 border rounded"
      />

      <label className="block mb-1">Session ID (optional)</label>
      <input
        type="number"
        value={sessionId}
        onChange={e => setSessionId(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
        placeholder="Session ID"
      />

      <label className="block mb-1">Agent Key</label>
      <input
        type="text"
        value={agentKey}
        onChange={e => setAgentKey(e.target.value)}
        className="mb-4 p-2 border rounded w-full"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Get Answer</button>
    </form>
  );
}
