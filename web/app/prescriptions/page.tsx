'use client';

import React, { useEffect, useState } from 'react';
import { listPrescriptions, deletePrescription } from '@/xlib/api';
import { Prescription } from '@/xlib/types';
import Link from 'next/link';

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    listPrescriptions(token).then(setPrescriptions).catch(e => setError(e.message));
  }, [token]);

  async function handleDelete(id: number) {
    if (!confirm('Delete this prescription?')) return;
    try {
      await deletePrescription(id, token);
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">My Prescriptions</h1>
      <Link href="/prescriptions/new" className="bg-blue-600 text-white px-4 py-2 rounded mb-4 inline-block">New Prescription</Link>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {prescriptions.length === 0 ? (
        <p>No prescriptions found.</p>
      ) : (
        <ul className="space-y-4">
          {prescriptions.map(pres => (
            <li key={pres.id} className="border p-4 rounded-md shadow">
              <p><strong>Medication:</strong> {pres.medication_name}</p>
              <p><strong>Dosage:</strong> {pres.dosage}</p>
              <p><strong>Created at:</strong> {new Date(pres.created_at).toLocaleDateString()}</p>
              <div className="flex gap-4 mt-2">
                <Link href={`/prescriptions/${pres.id}`} className="text-blue-600 hover:underline">Edit</Link>
                <button onClick={() => handleDelete(pres.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
