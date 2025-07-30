'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, X, User } from 'lucide-react';
import { useAuthStore } from '../../auth-store';
import { Patient } from '../../types';
import { clinicalApi, patientsApi } from '../../api';

interface Encounter {
  id: string;
  patientId: string;
  type: 'INPATIENT' | 'OUTPATIENT' | 'EMERGENCY';
  status: 'PLANNED' | 'ARRIVED' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  reasonCode: string;
  diagnosis?: string;
  notes?: string;
}

type ModalType = 'view' | 'create' | 'edit' | null;

export default function EncountersPage() {
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<Encounter | null>(null);
  const [formData, setFormData] = useState<Partial<Encounter>>({});
  const { user, hydrated, hydrate } = useAuthStore();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'DOCTOR' || user?.role === 'NURSE';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [encountersRes, patientsRes] = await Promise.all([
          clinicalApi.getEncounters(),
          patientsApi.getAll()
        ]);
        setEncounters(encountersRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (type: ModalType, item?: Encounter) => {
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
        const response = await clinicalApi.createEncounter(formData);
        setEncounters([...encounters, response.data]);
      } else if (modal === 'edit' && selectedItem) {
        const response = await clinicalApi.updateEncounter(selectedItem.id, formData);
        setEncounters(encounters.map(e => e.id === selectedItem.id ? response.data : e));
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save encounter:', error);
    }
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  if (!hydrated || loading) {
    return <div className="p-6">Loading encounters...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
        {canEdit && (
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Encounter
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {encounters.map((encounter) => (
              <tr key={encounter.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPatientName(encounter.patientId)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {encounter.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    encounter.status === 'FINISHED' ? 'bg-green-100 text-green-800' :
                    encounter.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    encounter.status === 'PLANNED' ? 'bg-yellow-100 text-yellow-800' :
                    encounter.status === 'ARRIVED' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {encounter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(encounter.startDate).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {encounter.reasonCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', encounter)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => openModal('edit', encounter)}
                      className="text-blue-600 hover:text-blue-900"
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
                {modal === 'create' ? 'New Encounter' : 
                 modal === 'edit' ? 'Edit Encounter' : 'Encounter Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                <p><strong>Patient:</strong> {getPatientName(selectedItem.patientId)}</p>
                <p><strong>Type:</strong> {selectedItem.type}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Start Date:</strong> {new Date(selectedItem.startDate).toLocaleString()}</p>
                {selectedItem.endDate && <p><strong>End Date:</strong> {new Date(selectedItem.endDate).toLocaleString()}</p>}
                <p><strong>Reason:</strong> {selectedItem.reasonCode}</p>
                {selectedItem.diagnosis && <p><strong>Diagnosis:</strong> {selectedItem.diagnosis}</p>}
                {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
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
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.type || ''}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="INPATIENT">Inpatient</option>
                    <option value="OUTPATIENT">Outpatient</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="PLANNED">Planned</option>
                    <option value="ARRIVED">Arrived</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="FINISHED">Finished</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate ? new Date(formData.startDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason Code</label>
                  <input
                    type="text"
                    value={formData.reasonCode || ''}
                    onChange={(e) => setFormData({...formData, reasonCode: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Routine checkup, Chest pain"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis || ''}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Hypertension, Acute bronchitis"
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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