'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Plus, X, User, DollarSign, Calendar } from 'lucide-react';
import { useAuthStore } from '../auth-store';
import { Patient } from '../types';
import { billingApi, patientsApi } from '../api';

interface Invoice {
  id: string;
  patient_id: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  created_at: string;
  due_date?: string;
  paid_amount: number;
}

interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  method?: string;
}

type ModalType = 'view-invoice' | 'create-invoice' | 'edit-invoice' | 'create-payment' | null;

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState<any>({});
  const { user, hydrated, hydrate } = useAuthStore();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'BILLING';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, patientsRes] = await Promise.all([
          billingApi.getInvoices(),
          patientsApi.getAll()
        ]);
        setInvoices(invoicesRes.data || []);
        setPatients(patientsRes.data || []);
        
        // Load payments for all invoices
        const allPayments = [];
        for (const invoice of invoicesRes.data || []) {
          try {
            const paymentsRes = await billingApi.getPayments(invoice.id);
            allPayments.push(...paymentsRes.data || []);
          } catch (error) {
            console.error(`Failed to fetch payments for invoice ${invoice.id}:`, error);
          }
        }
        setPayments(allPayments);
      } catch (error) {
        console.error('Failed to fetch billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (type: ModalType, invoice?: Invoice) => {
    setModal(type);
    setSelectedInvoice(invoice || null);
    setFormData(invoice || {});
  };

  const closeModal = () => {
    setModal(null);
    setSelectedInvoice(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === 'create-invoice') {
        const response = await billingApi.createInvoice(formData);
        setInvoices([...invoices, response.data]);
      } else if (modal === 'edit-invoice' && selectedInvoice) {
        const response = await billingApi.updateInvoice(selectedInvoice.id, formData);
        setInvoices(invoices.map(i => i.id === selectedInvoice.id ? response.data : i));
      } else if (modal === 'create-payment' && selectedInvoice) {
        const response = await billingApi.createPayment({ ...formData, invoice_id: selectedInvoice.id });
        setPayments([...payments, response.data]);
        // Refresh invoice data to get updated paid amount
        const invoicesRes = await billingApi.getInvoices();
        setInvoices(invoicesRes.data || []);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getInvoicePayments = (invoiceId: string) => {
    return payments.filter(p => p.invoice_id === invoiceId);
  };

  if (!hydrated || loading) {
    return <div className="p-6">Loading billing data...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Billing & Payments</h1>
        {canEdit && (
          <button
            onClick={() => openModal('create-invoice')}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPatientName(invoice.patient_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${invoice.paid_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => openModal('view-invoice', invoice)}
                    className="text-emerald-600 hover:text-emerald-900"
                  >
                    View
                  </button>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => openModal('edit-invoice', invoice)}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openModal('create-payment', invoice)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Add Payment
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {modal === 'create-invoice' ? 'New Invoice' :
                 modal === 'edit-invoice' ? 'Edit Invoice' :
                 modal === 'create-payment' ? 'Add Payment' : 'Invoice Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view-invoice' && selectedInvoice ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  <p><strong>Patient:</strong> {getPatientName(selectedInvoice.patient_id)}</p>
                  <p><strong>Amount:</strong> ${selectedInvoice.amount.toFixed(2)}</p>
                  <p><strong>Paid:</strong> ${selectedInvoice.paid_amount.toFixed(2)}</p>
                  <p><strong>Balance:</strong> ${(selectedInvoice.amount - selectedInvoice.paid_amount).toFixed(2)}</p>
                  <p><strong>Status:</strong> {selectedInvoice.status}</p>
                  <p><strong>Created:</strong> {new Date(selectedInvoice.created_at).toLocaleDateString()}</p>
                  {selectedInvoice.due_date && <p><strong>Due:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>}
                </div>
                
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Payment History</h4>
                  <div className="space-y-2">
                    {getInvoicePayments(selectedInvoice.id).map(payment => (
                      <div key={payment.id} className="flex justify-between text-sm">
                        <span>{new Date(payment.payment_date).toLocaleDateString()} - {payment.method}</span>
                        <span>${payment.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {modal === 'create-payment' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <select
                        value={formData.method || ''}
                        onChange={(e) => setFormData({...formData, method: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit Card">Credit Card</option>
                        <option value="Check">Check</option>
                        <option value="Insurance">Insurance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                      <input
                        type="date"
                        value={formData.payment_date || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Patient</label>
                      <select
                        value={formData.patient_id || ''}
                        onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Patient</option>
                        {patients.map(patient => (
                          <option key={patient.id} value={patient.id}>
                            {patient.firstName} {patient.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.amount || ''}
                        onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select
                        value={formData.status || ''}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        required
                      >
                        <option value="">Select Status</option>
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input
                        type="date"
                        value={formData.due_date || ''}
                        onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                  </>
                )}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-md ${
                      modal === 'create-payment' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {modal === 'create-invoice' ? 'Create Invoice' :
                     modal === 'edit-invoice' ? 'Update Invoice' : 'Add Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}