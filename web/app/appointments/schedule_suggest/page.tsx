'use client';

import React, { useState } from 'react';
import { scheduleSuggest } from '@/xlib/api';

export default function ScheduleSuggestPage() {
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuggestion(null);
    if (!query.trim()) {
      setError('Please enter your scheduling request');
      return;
    }
    try {
      const proposal = await scheduleSuggest(query, token);
      if (proposal.success && proposal.appointment_data) {
        setSuggestion(`Suggested Appointment with Clinician ID: ${proposal.appointment_data.clinician_id} at ${new Date(proposal.appointment_data.scheduled_time).toLocaleString()}`);
      } else {
        setError(proposal.message || 'No suggestions available');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Schedule Suggestion</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      {suggestion && <p className="mb-2 text-green-600">{suggestion}</p>}
      <textarea
        value={query}
        onChange={e => setQuery(e.target.value)}
        rows={5}
        placeholder="Describe your preferred scheduling requirements"
        className="mb-4 w-full p-2 border rounded"
      />
      <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Get Suggestion</button>
    </form>
  );
}
