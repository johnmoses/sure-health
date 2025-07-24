'use client';

import React, { useEffect, useState } from 'react';
import { listInvoices, deleteInvoice } from '@/xlib/api';
import { Invoice } from '@/xlib/types';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchInvoices() {
      try {
        const data = await listInvoices(token);
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    if (token) fetchInvoices();
  }, [token]);

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(id, token);
      setInvoices(invoices.filter(inv => inv.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-6">My Invoices</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      <Link href="/billing/invoices/new" className="bg-blue-500 text-white px-4 py-2 rounded mb-4 inline-block">Create New Invoice</Link>
      <Link href="/billing/query" className="ml-2 bg-purple-500 text-white px-4 py-2 rounded mb-4 inline-block">Billing Query</Link>

      {invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <ul className="space-y-4">
          {invoices.map(invoice => (
            <li key={invoice.id} className="border p-4 rounded-md shadow">
              <p><strong>Invoice ID:</strong> {invoice.id}</p>
              <p><strong>Amount:</strong> ${invoice.amount.toFixed(2)}</p>
              <p><strong>Status:</strong> {invoice.status}</p>
              <p><strong>Description:</strong> {invoice.description || 'N/A'}</p>
              <p><strong>Created:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>
              <div className="mt-2 space-x-2">
                <Link href={`/billing/invoices/${invoice.id}`} className="text-blue-600 hover:underline">View Details</Link>
                <button onClick={() => handleDelete(invoice.id)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
