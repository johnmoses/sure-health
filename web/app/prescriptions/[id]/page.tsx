'use client';

import React, { useEffect, useState } from 'react';
import { getPrescription, updatePrescription } from '@/xlib/api';
import { useRouter, usePathname } from 'next/navigation';

export default function EditPrescriptionPage() {
  const [prescription, setPrescription] = useState<any | null>(null);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const pathname = usePathname();
  const prescriptionId = pathname.split('/').pop();
  const router = useRouter();

  useEffect(() => {
    if (!token || !prescriptionId) return;

    getPrescription(Number(prescriptionId), token)
      .then(p => {
        setPrescription(p);
        setMedicationName(p.medication_name);
        setDosage(p.dosage);
        setInstructions(p.instructions || '');
      })
      .catch((err: any) => setError(err.message));
  }, [token, prescriptionId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!prescriptionId) return;
    try {
      await updatePrescription(
        Number(prescriptionId),
        { medication_name: medicationName, dosage, instructions },
        token
      );
      router.push('/prescriptions');
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (!prescription) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSave} className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Edit Prescription</h1>
      {error && <p className="text-red-600">{error}</p>}

      <label className="block mb-1">Medication Name</label>
      <input value={medicationName} onChange={e => setMedicationName(e.target.value)} required className="border p-2 rounded mb-4 w-full" />

      <label className="block mb-1">Dosage</label>
      <input value={dosage} onChange={e => setDosage(e.target.value)} required className="border p-2 rounded mb-4 w-full" />

      <label className="block mb-1">Instructions</label>
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} className="border p-2 rounded mb-4 w-full" />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
    </form>
  );
}
