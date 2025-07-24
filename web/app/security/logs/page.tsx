'use client';

import React, { useEffect, useState } from 'react';
import { getUserLogs } from '@/xlib/api';
import { AuditLog, PaginatedAuditLogs } from '@/xlib/types';

export default function SecurityLogsPage() {
  const [logsData, setLogsData] = useState<PaginatedAuditLogs | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [filterEventType, setFilterEventType] = useState('');
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null; // Adjust how you get user id

  useEffect(() => {
    if (!token || !userId) {
      setError('User not authenticated');
      return;
    }
    setLoading(true);
    getUserLogs(userId, token, page, perPage, filterEventType || undefined)
      .then(setLogsData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, userId, page, perPage, filterEventType]);

  function handleNextPage() {
    if (logsData?.has_next) setPage(prev => prev + 1);
  }

  function handlePrevPage() {
    if (logsData?.has_prev && page > 1) setPage(prev => prev - 1);
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl mb-6">Event Logs</h1>

      <div className="mb-4">
        <label htmlFor="eventTypeFilter" className="block mb-1 font-semibold">Filter by Event Type:</label>
        <input
          id="eventTypeFilter"
          type="text"
          value={filterEventType}
          placeholder="e.g., page_view, button_click"
          onChange={e => {
            setFilterEventType(e.target.value);
            setPage(1); // Reset pagination on filter change
          }}
          className="p-2 border rounded w-full max-w-xs"
        />
      </div>

      {loading && <p>Loading logs...</p>}
      {error && <p className="text-red-600 mb-4">{error}</p>}

      {!loading && !error && logsData && logsData.items.length === 0 && (
        <p>No logs found.</p>
      )}

      {!loading && !error && logsData && logsData.items.length > 0 && (
        <>
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border border-gray-300 text-left">ID</th>
                <th className="p-2 border border-gray-300 text-left">Event Type</th>
                <th className="p-2 border border-gray-300 text-left">Metadata</th>
                <th className="p-2 border border-gray-300 text-left">IP Address</th>
                <th className="p-2 border border-gray-300 text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logsData.items.map((log: AuditLog) => (
                <tr key={log.id} className="even:bg-gray-50">
                  <td className="p-2 border border-gray-300">{log.id}</td>
                  <td className="p-2 border border-gray-300">{log.event_type}</td>
                  <td className="p-2 border border-gray-300">
                    <pre className="whitespace-pre-wrap max-w-xs truncate">{JSON.stringify(log.event_metadata, null, 2)}</pre>
                  </td>
                  <td className="p-2 border border-gray-300">{log.ip_address || 'N/A'}</td>
                  <td className="p-2 border border-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between">
            <button
              onClick={handlePrevPage}
              disabled={!logsData.has_prev || page === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <div>Page {page} of {logsData.pages}</div>
            <button
              onClick={handleNextPage}
              disabled={!logsData.has_next}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
