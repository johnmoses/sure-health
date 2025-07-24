'use client';

import React, { useState } from 'react';
import { createInvoice } from '@/xlib/api';
import { useRouter } from 'next/navigation';

export default function CreateInvoicePage() {
  const [patientId, setPatientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createInvoice({
        patient_id: Number(patientId),
        amount: Number(amount),
        description,
      }, token);
      router.push('/billing/invoices'); // Redirect to invoices list
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Create New Invoice</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <label className="block mb-1">Patient ID:</label>
      <input
        type="number"
        value={patientId}
        onChange={e => setPatientId(e.target.value)}
        required
        className="mb-4 w-full p-2 border rounded"
      />
      <label className="block mb-1">Amount:</label>
      <input
        type="number"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        required
        className="mb-4 w-full p-2 border rounded"
      />
      <label className="block mb-1">Description:</label>
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
        className="mb-4 w-full p-2 border rounded"
        placeholder="e.g., Consultation for April 2024"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Invoice</button>
    </form>
  );
}
