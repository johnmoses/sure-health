'use client';

import React, { useEffect, useState } from 'react';
import { fetchDashboardSummary } from '@/xlib/api';
import { DashboardSummary } from '@/xlib/types';

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    if (!token) return;
    fetchDashboardSummary(token)
      .then(setSummary)
      .catch((e: Error) => setError(e.message));
  }, [token]);

  if (error) {
    return <p className="text-red-600 p-4">{error}</p>;
  }

  if (!summary) {
    return <p className="p-4">Loading dashboard...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Summary</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Users</h2>
          <p className="text-3xl">{summary.total_users}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Active Appointments</h2>
          <p className="text-3xl">{summary.active_appointments}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Total Billings</h2>
          <p className="text-3xl">{summary.total_billings}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Active Chat Sessions</h2>
          <p className="text-3xl">{summary.active_chat_sessions}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Prescriptions</h2>
          <p className="text-3xl">{summary.prescriptions_count}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Video Sessions</h2>
          <p className="text-3xl">{summary.video_sessions_count}</p>
        </li>
        <li className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">Vital Signs Recorded</h2>
          <p className="text-3xl">{summary.vital_signs_count}</p>
        </li>
      </ul>
    </div>
  );
}
