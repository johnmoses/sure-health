'use client';

import React, { useState } from 'react';
import { createMedicalRecord } from '@/xlib/api';
import { useRouter } from 'next/navigation';

export default function NewMedicalRecordPage() {
  const [patientId, setPatientId] = useState('');
  const [clinicianId, setClinicianId] = useState('');
  const [recordDate, setRecordDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createMedicalRecord({
        patient_id: Number(patientId),
        clinician_id: Number(clinicianId),
        record_date: recordDate,
        diagnosis,
        notes
      }, token);
      router.push('/ehr/medical_records');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Add Medical Record</h1>
      {error && <p className="mb-2 text-red-600">{error}</p>}
      <label className="block mb-1">Patient ID</label>
      <input type="number" value={patientId} onChange={e => setPatientId(e.target.value)} required className="mb-4 p-2 border rounded w-full" />
      
      <label className="block mb-1">Clinician ID</label>
      <input type="number" value={clinicianId} onChange={e => setClinicianId(e.target.value)} required className="mb-4 p-2 border rounded w-full" />
      
      <label className="block mb-1">Record Date</label>
      <input type="date" value={recordDate} onChange={e => setRecordDate(e.target.value)} required className="mb-4 p-2 border rounded w-full" />
      
      <label className="block mb-1">Diagnosis</label>
      <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="mb-4 p-2 border rounded w-full" />

      <label className="block mb-1">Notes</label>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} className="mb-4 p-2 border rounded w-full" />
      
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
