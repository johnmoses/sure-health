'use client';

import React, { useState } from 'react';
import { sendBillingQuery } from '@/xlib/api';

export default function BillingQueryPage() {
  const [queryText, setQueryText] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse(null);
    if (!queryText.trim()) {
      setError('Please enter your query.');
      return;
    }

    try {
      const result = await sendBillingQuery(queryText, token, invoiceId ? Number(invoiceId) : undefined);
      if (result.success) {
        setResponse(result.answer || 'Query processed successfully.');
      } else {
        setError(result.message || 'An error occurred while processing your query.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Billing Query Assistant</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {response && <p className="mb-2 text-green-600">{response}</p>}

      <label className="block mb-1">Your Question:</label>
      <textarea
        value={queryText}
        onChange={e => setQueryText(e.target.value)}
        rows={5}
        className="mb-4 w-full p-2 border rounded"
        placeholder="e.g., What is my current outstanding balance? Or, Explain invoice #123."
        required
      />

      <label className="block mb-1">Invoice ID (Optional context):</label>
      <input
        type="number"
        value={invoiceId}
        onChange={e => setInvoiceId(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
        placeholder="e.g., 123"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Ask</button>
    </form>
  );
}
