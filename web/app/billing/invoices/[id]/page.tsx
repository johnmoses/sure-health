'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getInvoice, listPayments, createPayment, updateInvoice } from '@/xlib/api';
import { Invoice, Payment } from '@/xlib/types';
import Link from 'next/link';

export default function InvoiceDetailsPage() {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');

  const router = useRouter();
  const pathname = usePathname();
  const invoiceId = pathname.split('/').pop();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') || '' : '';

  useEffect(() => {
    async function fetchData() {
      if (!invoiceId) return;
      try {
        const inv = await getInvoice(Number(invoiceId), token);
        setInvoice(inv);
        const pays = await listPayments(Number(invoiceId), token);
        setPayments(pays);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchData();
  }, [invoiceId, token]);

  async function handleCreatePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceId) return;
    setError(null);
    try {
      const newPayment = await createPayment(Number(invoiceId), {
        amount: Number(newPaymentAmount),
        payment_date: new Date().toISOString(),
        method: newPaymentMethod,
      }, token);
      setPayments([...payments, newPayment]);
      setNewPaymentAmount('');
      setNewPaymentMethod('');

      // Refresh invoice status after payment
      const updatedInvoice = await getInvoice(Number(invoiceId), token);
      setInvoice(updatedInvoice);

    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleUpdateInvoiceStatus(newStatus: Invoice['status']) {
    if (!invoiceId || !invoice) return;
    setError(null);
    try {
      await updateInvoice(Number(invoiceId), { status: newStatus }, token);
      setInvoice({ ...invoice, status: newStatus });
    } catch (err: any) {
      setError(err.message);
    }
  }


  if (loading) return <p>Loading...</p>;
  if (!invoice) return <p>Invoice not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-3xl mb-4">Invoice #{invoice.id}</h1>
      {error && <p className="mb-4 text-red-600">{error}</p>}

      <div className="border p-4 rounded-md shadow mb-6">
        <p><strong>Patient ID:</strong> {invoice.patient_id}</p>
        <p><strong>Amount:</strong> ${invoice.amount.toFixed(2)}</p>
        <p><strong>Status:</strong> {invoice.status}</p>
        <p><strong>Description:</strong> {invoice.description || 'N/A'}</p>
        <p><strong>Created:</strong> {new Date(invoice.created_at).toLocaleDateString()}</p>

        <div className="mt-4">
          <label className="block mb-2">Update Status:</label>
          <select
            value={invoice.status}
            onChange={(e) => handleUpdateInvoiceStatus(e.target.value as Invoice['status'])}
            className="p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <h2 className="text-2xl mb-4">Payments for this Invoice</h2>
      {payments.length === 0 ? (
        <p>No payments recorded yet.</p>
      ) : (
        <ul className="space-y-2 mb-6">
          {payments.map(payment => (
            <li key={payment.id} className="border p-3 rounded-md">
              <p>Amount: ${payment.amount.toFixed(2)}</p>
              <p>Date: {new Date(payment.payment_date).toLocaleDateString()}</p>
              <p>Method: {payment.method || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl mb-4">Record New Payment</h2>
      <form onSubmit={handleCreatePayment} className="border p-4 rounded-md shadow">
        <label className="block mb-1">Amount:</label>
        <input
          type="number"
          step="0.01"
          value={newPaymentAmount}
          onChange={e => setNewPaymentAmount(e.target.value)}
          required
          className="mb-4 w-full p-2 border rounded"
        />
        <label className="block mb-1">Method:</label>
        <input
          type="text"
          value={newPaymentMethod}
          onChange={e => setNewPaymentMethod(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
          placeholder="e.g., Credit Card, Bank Transfer"
        />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Record Payment</button>
      </form>

      <div className="mt-6">
        <Link href="/billing/invoices" className="text-blue-600 hover:underline">Back to Invoices</Link>
      </div>
    </div>
  );
}
