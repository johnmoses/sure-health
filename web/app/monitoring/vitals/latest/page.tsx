'use client';

import React, { useEffect, useState } from 'react';
import { getLatestVitalSigns } from '@/xlib/api';
import { VitalSign } from '@/xlib/types';

export default function LatestVitalsPage() {
  const [vitals, setVitals] = useState<VitalSign[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const patientId = typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null; // Adjust as needed

  useEffect(() => {
    if (!token || !patientId) return;

    getLatestVitalSigns(patientId, token)
      .then(setVitals)
      .catch(e => setError(e.message));
  }, [token, patientId]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">Latest Vital Signs by Type</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {vitals.length === 0 ? (
        <p>No vital signs available.</p>
      ) : (
        <ul className="space-y-4">
          {vitals.map(vital => (
            <li key={vital.id} className="border p-4 rounded-md shadow">
              <p><strong>Type:</strong> {vital.type}</p>
              <p><strong>Value:</strong> {vital.value}</p>
              <p><strong>Recorded at:</strong> {new Date(vital.timestamp).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
