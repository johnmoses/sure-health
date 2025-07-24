'use client';

import React, { useEffect, useState } from 'react';
import { listMedicalRecords } from '@/xlib/api';
import { MedicalRecord } from '@/xlib/types';
import Link from 'next/link';

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchRecords() {
      try {
        const data = await listMedicalRecords(token);
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) fetchRecords();
  }, [token]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">Medical Records</h1>
      <Link href="/ehr/medical_records/new" className="mb-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">Add New Record</Link>
      
      {error && <p className="text-red-600 mb-4">{error}</p>}
      
      {records.length === 0 ? (
        <p>No medical records found.</p>
      ) : (
        <ul className="space-y-4">
          {records.map(rec => (
            <li key={rec.id} className="border p-4 rounded-md shadow">
              <p><strong>ID:</strong> {rec.id}</p>
              <p><strong>Diagnosis:</strong> {rec.diagnosis || 'N/A'}</p>
              <p><strong>Record Date:</strong> {new Date(rec.record_date).toLocaleDateString()}</p>
              <Link href={`/ehr/medical_records/${rec.id}`} className="text-blue-600 hover:underline mt-2 block">View Details</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
