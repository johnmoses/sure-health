'use client';

import React, { useState } from 'react';
import { createPrescription } from '@/xlib/api';
import { useRouter } from 'next/navigation';

export default function CreatePrescriptionPage() {
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [patientId, setPatientId] = useState('');
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      // clinician_id is taken from token on backend - no need to send here if not in your schema
      await createPrescription(
        {
          patient_id: Number(patientId),
          clinician_id: Number(patientId), // replace with clinician id if needed
          medication_name: medicationName,
          dosage,
          instructions,
        },
        token
      );
      router.push('/prescriptions');
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">New Prescription</h1>

      <label className="block mb-1">Patient ID</label>
      <input type="number" value={patientId} onChange={e => setPatientId(e.target.value)} required className="border p-2 rounded mb-4 w-full" />

      <label className="block mb-1">Medication Name</label>
      <input type="text" value={medicationName} onChange={e => setMedicationName(e.target.value)} required className="border p-2 rounded mb-4 w-full" />

      <label className="block mb-1">Dosage</label>
      <input type="text" value={dosage} onChange={e => setDosage(e.target.value)} required className="border p-2 rounded mb-4 w-full" />

      <label className="block mb-1">Instructions</label>
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} className="border p-2 rounded mb-4 w-full" />

      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Create</button>
    </form>
  );
}
