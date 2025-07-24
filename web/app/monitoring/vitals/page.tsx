'use client';

import React, { useEffect, useState } from 'react';
import { listVitalSigns } from '@/xlib/api';
import { VitalSign } from '@/xlib/types';

export default function VitalsListPage() {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const patientId = typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null; // Adjust as needed

  useEffect(() => {
    if (!token || !patientId) return;

    listVitalSigns(patientId, token, typeFilter || undefined)
      .then(setVitals)
      .catch((e) => setError(e.message));
  }, [token, patientId, typeFilter]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-4">Vital Signs</h1>

      <label className="block mb-2">
        Filter by Type:
        <input
          type="text"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder="e.g., heart rate, blood pressure"
          className="ml-2 p-2 border rounded"
        />
      </label>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <table className="w-full text-left border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Type</th>
            <th className="border border-gray-300 p-2">Value</th>
            <th className="border border-gray-300 p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {vitals.length === 0 ? (
            <tr>
              <td className="border border-gray-300 p-2" colSpan={3}>No vital signs found.</td>
            </tr>
          ) : (
            vitals.map((vital) => (
              <tr key={vital.id}>
                <td className="border border-gray-300 p-2">{vital.type}</td>
                <td className="border border-gray-300 p-2">{vital.value}</td>
                <td className="border border-gray-300 p-2">{new Date(vital.timestamp).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
