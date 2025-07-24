'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  getMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  listLabResults,
  createLabResult,
} from '@/xlib/api';
import { MedicalRecord, LabResult } from '@/xlib/types';
import Link from 'next/link';

export default function MedicalRecordDetails() {
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  // New Lab Result state
  const [testName, setTestName] = useState('');
  const [result, setResult] = useState('');
  const [unit, setUnit] = useState('');
  const [refRange, setRefRange] = useState('');
  const [dateConducted, setDateConducted] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const pathname = usePathname();
  const recordId = pathname.split('/').pop();

  // Load record and lab results on mount
  useEffect(() => {
    async function fetchData() {
      if (!recordId) return;
      try {
        const dataRec = await getMedicalRecord(Number(recordId), token);
        setRecord(dataRec);
        setDiagnosis(dataRec.diagnosis || '');
        setNotes(dataRec.notes || '');

        const labs = await listLabResults(Number(recordId), token);
        setLabResults(labs);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) fetchData();
  }, [recordId, token]);

  async function handleUpdateRecord() {
    if (!recordId) return;
    setError(null);
    try {
      const updated = await updateMedicalRecord(Number(recordId), { diagnosis, notes }, token);
      setRecord(updated);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDeleteRecord() {
    if (!recordId || !confirm('Delete this medical record?')) return;
    setError(null);
    try {
      await deleteMedicalRecord(Number(recordId), token);
      // Redirect back to list page after deletion
      location.href = '/ehr/medical_records';
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleAddLabResult(e: React.FormEvent) {
    e.preventDefault();
    if (!recordId) return;
    setError(null);
    try {
      const newLab = await createLabResult(Number(recordId), {
        test_name: testName,
        result,
        unit,
        reference_range: refRange,
        date_conducted: dateConducted,
      }, token);
      setLabResults([...labResults, newLab]);
      // Reset form fields
      setTestName('');
      setResult('');
      setUnit('');
      setRefRange('');
      setDateConducted('');
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (!record) {
    return <div className="max-w-xl mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">Medical Record #{record.id}</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      {!isEditing ? (
        <>
          <p><strong>Patient ID:</strong> {record.patient_id}</p>
          <p><strong>Clinician ID:</strong> {record.clinician_id}</p>
          <p><strong>Record Date:</strong> {new Date(record.record_date).toLocaleDateString()}</p>
          <p><strong>Diagnosis:</strong> {record.diagnosis || 'N/A'}</p>
          <p><strong>Notes:</strong> {record.notes || 'N/A'}</p>

          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-400 px-4 py-2 rounded mr-2"
          >
            Edit Record
          </button>
          <button
            onClick={handleDeleteRecord}
            className="bg-red-600 px-4 py-2 rounded text-white"
          >
            Delete Record
          </button>
        </>
      ) : (
        <>
          <label className="block mb-1">Diagnosis:</label>
          <textarea
            className="mb-4 p-2 border rounded w-full"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
          />

          <label className="block mb-1">Notes:</label>
          <textarea
            className="mb-4 p-2 border rounded w-full"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          <button
            onClick={handleUpdateRecord}
            className="bg-green-600 text-white px-4 py-2 rounded mr-2"
          >
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">
            Cancel
          </button>
        </>
      )}

      <h2 className="text-2xl mt-8 mb-4">Lab Results</h2>
      {labResults.length === 0 ? (
        <p>No lab results.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {labResults.map(lab => (
            <li key={lab.id} className="border p-3 rounded-md">
              <p><strong>{lab.test_name}</strong></p>
              <p>Result: {lab.result} {lab.unit ? `(${lab.unit})` : ''}</p>
              <p>Reference Range: {lab.reference_range || 'N/A'}</p>
              <p>Date Conducted: {new Date(lab.date_conducted).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddLabResult} className="border p-4 rounded-md shadow">
        <h3 className="text-xl mb-4">Add Lab Result</h3>

        <label className="block mb-1">Test Name:</label>
        <input
          value={testName}
          onChange={e => setTestName(e.target.value)}
          required
          className="mb-4 p-2 border rounded w-full"
        />

        <label className="block mb-1">Result:</label>
        <input
          value={result}
          onChange={e => setResult(e.target.value)}
          required
          className="mb-4 p-2 border rounded w-full"
        />

        <label className="block mb-1">Unit:</label>
        <input
          value={unit}
          onChange={e => setUnit(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
          placeholder="Optional"
        />

        <label className="block mb-1">Reference Range:</label>
        <input
          value={refRange}
          onChange={e => setRefRange(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
          placeholder="Optional"
        />

        <label className="block mb-1">Date Conducted:</label>
        <input
          type="date"
          value={dateConducted}
          onChange={e => setDateConducted(e.target.value)}
          required
          className="mb-4 p-2 border rounded w-full"
        />

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Lab Result
        </button>
      </form>

      <div className="mt-6">
        <Link href="/ehr/medical_records" className="text-blue-600 hover:underline">Back to Medical Records</Link>
      </div>
    </div>
  );
}
