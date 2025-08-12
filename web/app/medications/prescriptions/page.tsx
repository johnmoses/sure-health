'use client';

import { useEffect, useState } from 'react';
import { Pill, Plus, X, User } from 'lucide-react';
import { useAuthStore } from '../../../xlib/auth-store';
import { Patient, Prescription } from '../../../types';
import { medicationsService, patientService } from '../../../xlib/services';

type ModalType = 'view' | 'create' | 'edit' | null;

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<Prescription | null>(null);
  const [formData, setFormData] = useState<Partial<Prescription>>({});
  const { user, hydrated, hydrate } = useAuthStore();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'DOCTOR';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prescriptionsRes, patientsRes] = await Promise.all([
          medicationsService.listPrescriptions(),
          patientService.listPatients()
        ]);
        setPrescriptions(prescriptionsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (type: ModalType, item?: Prescription) => {
    setModal(type);
    setSelectedItem(item || null);
    setFormData(item || {});
  };

  const closeModal = () => {
    setModal(null);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal === 'create') {
        const response = await medicationsService.createPrescription(formData);
        setPrescriptions([...prescriptions, response.data]);
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save prescription:', error);
    }
  };

  // const getPatientName = (patientId: string) => {
  //   const patient = patients.find(p => p.id === patientId);
  //   return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  // };

  if (!hydrated || loading) {
    return <div className="p-6">Loading prescriptions...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
        {canEdit && (
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prescription
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medication</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dosage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <tr key={prescription.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPatientName(prescription.patientId)}
                    </span>
                  </div> */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prescription.medication_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prescription.dosage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {prescription.frequency}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    prescription.status === 'Active' ? 'bg-green-100 text-green-800' :
                    prescription.status === 'Inactive' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {prescription.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', prescription)}
                    className="text-purple-600 hover:text-purple-900 mr-3"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => openModal('edit', prescription)}
                      className="text-purple-600 hover:text-purple-900"
                    >
                      Edit
                    </button>
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
                {modal === 'create' ? 'New Prescription' : 
                 modal === 'edit' ? 'Edit Prescription' : 'Prescription Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                {/* <p><strong>Patient:</strong> {getPatientName(selectedItem.patientId)}</p> */}
                <p><strong>Medication:</strong> {selectedItem.medication_name}</p>
                <p><strong>Dosage:</strong> {selectedItem.dosage}</p>
                <p><strong>Frequency:</strong> {selectedItem.frequency}</p>
                <p><strong>Route:</strong> {selectedItem.route}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Start Date:</strong> {selectedItem.start_date}</p>
                {selectedItem.end_date && <p><strong>End Date:</strong> {selectedItem.end_date}</p>}
                <p><strong>Prescribed By:</strong> {selectedItem.prescribed_by}</p>
                {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  {/* <select
                    value={formData.patientId || ''}
                    onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select> */}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Medication Name</label>
                  <input
                    type="text"
                    value={formData.medication_name || ''}
                    onChange={(e) => setFormData({...formData, medication_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage || ''}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 10mg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Frequency</label>
                  <input
                    type="text"
                    value={formData.frequency || ''}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Once daily"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Route</label>
                  <select
                    value={formData.route || ''}
                    onChange={(e) => setFormData({...formData, route: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Route</option>
                    <option value="Oral">Oral</option>
                    <option value="Injection">Injection</option>
                    <option value="Topical">Topical</option>
                    <option value="Inhalation">Inhalation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prescribed By</label>
                  <input
                    type="text"
                    value={formData.prescribed_by || ''}
                    onChange={(e) => setFormData({...formData, prescribed_by: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                  />
                </div>
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
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    {modal === 'create' ? 'Create' : 'Update'}
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