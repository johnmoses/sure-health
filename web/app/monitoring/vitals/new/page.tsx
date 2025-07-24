'use client';

import React, { useState } from 'react';
import { addVitalSign } from '@/xlib/api';
import { useRouter } from 'next/navigation';

export default function AddVitalSignPage() {
  const [type, setType] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const patientId = typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null; // Adjust as needed
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!patientId) {
      setError('Patient ID not available');
      return;
    }

    if (!type.trim() || !value.trim()) {
      setError('Type and value are required');
      return;
    }

    try {
      await addVitalSign({ patient_id: patientId, type, value }, token);
      router.push('/monitoring/vitals');
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Add Vital Sign</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <label className="block mb-1">Type</label>
      <input
        type="text"
        value={type}
        onChange={(e) => setType(e.target.value)}
        required
        className="mb-4 p-2 w-full border rounded"
        placeholder="e.g., heart rate"
      />

      <label className="block mb-1">Value</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="mb-4 p-2 w-full border rounded"
        placeholder="e.g., 72 bpm"
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add Vital Sign</button>
    </form>
  );
}
