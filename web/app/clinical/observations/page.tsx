'use client';

import { useEffect, useState } from 'react';
import { Activity, Plus, X, User } from 'lucide-react';
import { useAuth } from '../../../xlib/auth'; // Use the common auth hook
import { Observation, Patient } from '../../../types';
import { clinicalService, patientService } from '../../../xlib/services';

type ModalType = 'view' | 'create' | 'edit' | null;

export default function ObservationsPage() {
  const { user } = useAuth(); // Use the common auth hook
  const [observations, setObservations] = useState<Observation[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<Observation | null>(null);
  const [formData, setFormData] = useState<Partial<Observation>>({});

  const canEdit = user?.role === 'admin' || user?.role === 'clinician'; // Adjusted roles based on common patterns

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is loaded
      try {
        const [observationsRes, patientsRes] = await Promise.all([
          clinicalService.listObservations(),
          patientService.listPatients()
        ]);
        setObservations(observationsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Depend on user to refetch when auth state changes

  const openModal = (type: ModalType, item?: Observation) => {
    setModal(type);
    setSelectedItem(item || null);
    // Ensure date is in correct format for date input
    if (item?.effective_datetime) {
      setFormData({ ...item, effective_datetime: new Date(item.effective_datetime).toISOString().slice(0, 10) });
    } else {
      setFormData(item || {});
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelectedItem(null);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert date string back to ISO string if needed by backend
      const dataToSend = { ...formData };
      if (dataToSend.effective_datetime && typeof dataToSend.effective_datetime === 'string') {
        dataToSend.effective_datetime = new Date(dataToSend.effective_datetime).toISOString();
      }

      if (modal === 'create') {
        const response = await clinicalService.createObservation(dataToSend as Observation);
        setObservations([...observations, response.data]);
      } else if (modal === 'edit' && selectedItem) {
        const response = await clinicalService.updateObservationById(selectedItem.id!, dataToSend as Partial<Observation>);
        setObservations(observations.map(o => o.id === selectedItem.id ? response.data : o));
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save observation:', error);
    }
  };

  const getPatientName = (patientId: number | undefined) => {
    if (patientId === undefined) return 'N/A';
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Observations</h1>
        {canEdit && (
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Observation
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {observations.map((observation) => (
              <tr key={observation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPatientName(observation.patient_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {observation.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {observation.value} {observation.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {observation.effective_datetime ? new Date(observation.effective_datetime).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    observation.status === 'FINAL' ? 'bg-green-100 text-green-800' :
                    observation.status === 'PRELIMINARY' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {observation.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', observation)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => openModal('edit', observation)}
                      className="text-green-600 hover:text-green-900"
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
                {modal === 'create' ? 'New Observation' : 
                 modal === 'edit' ? 'Edit Observation' : 'Observation Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                <p><strong>Patient:</strong> {getPatientName(selectedItem.patient_id)}</p>
                <p><strong>Code:</strong> {selectedItem.code}</p>
                <p><strong>Value:</strong> {selectedItem.value} {selectedItem.unit}</p>
                <p><strong>Date:</strong> {selectedItem.effective_datetime ? new Date(selectedItem.effective_datetime).toLocaleDateString() : 'N/A'}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    value={formData.patient_id || ''}
                    onChange={(e) => setFormData({...formData, patient_id: parseInt(e.target.value) || undefined})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., LOINC:8480-6 (Blood Pressure)"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Value</label>
                  <input
                    type="text"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., 120/80, 72"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Unit</label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., mmHg, bpm, °C"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Effective Date</label>
                  <input
                    type="date"
                    value={formData.effective_datetime ? new Date(formData.effective_datetime).toISOString().slice(0, 10) : ''}
                    onChange={(e) => setFormData({...formData, effective_datetime: e.target.value})}
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
                    <option value="PRELIMINARY">Preliminary</option>
                    <option value="FINAL">Final</option>
                    <option value="AMENDED">Amended</option>
                  </select>
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
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
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