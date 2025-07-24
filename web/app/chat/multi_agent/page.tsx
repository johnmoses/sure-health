'use client';

import React, { useState } from 'react';
import { multiAgentChat } from '@/xlib/api';

export default function MultiAgentChatPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse(null);
    if (!query.trim()) {
      setError('Please enter your query');
      return;
    }

    try {
      const res = await multiAgentChat(query, '[YOUR_USER_ID_HERE]');
      if (res.error) {
        setError(res.error);
      } else {
        setResponse(res.response);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">AI Assistant</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {response && <p className="mb-2 whitespace-pre-line bg-gray-100 p-4 rounded">{response}</p>}

      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={5}
        placeholder="Ask me anything health related..."
        className="mb-4 w-full p-2 border rounded"
      />
      <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">Ask</button>
    </form>
  );
}
