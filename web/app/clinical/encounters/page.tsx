'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, X, User } from 'lucide-react';
import { useAuth } from '../../../xlib/auth'; // Use the common auth hook
import { Encounter, Patient } from '../../../types';
import { clinicalService, patientService } from '../../../xlib/services';

type ModalType = 'view' | 'create' | null; // Removed 'edit'

export default function EncountersPage() {
  const { user } = useAuth(); // Use the common auth hook
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<Encounter | null>(null);
  const [formData, setFormData] = useState<Partial<Encounter>>({});

  const canCreate = user?.role === 'admin' || user?.role === 'clinician'; // Adjusted roles based on common patterns

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is loaded
      try {
        const [encountersRes, patientsRes] = await Promise.all([
          clinicalService.listEncounters(),
          patientService.listPatients()
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
  }, [user]); // Depend on user to refetch when auth state changes

  const openModal = (type: ModalType, item?: Encounter) => {
    setModal(type);
    setSelectedItem(item || null);
    // Ensure date is in correct format for datetime-local input
    if (item?.period_start) {
      setFormData({ ...item, period_start: new Date(item.period_start).toISOString().slice(0, 16) });
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
      // Convert datetime-local string back to ISO string if needed by backend
      const dataToSend = { ...formData };
      if (dataToSend.period_start && typeof dataToSend.period_start === 'string') {
        dataToSend.period_start = new Date(dataToSend.period_start).toISOString();
      }
      if (dataToSend.period_end && typeof dataToSend.period_end === 'string') {
        dataToSend.period_end = new Date(dataToSend.period_end).toISOString();
      }

      if (modal === 'create') {
        const response = await clinicalService.createEncounter(dataToSend as Encounter);
        setEncounters([...encounters, response.data]);
      }
      // Removed else if (modal === 'edit' && selectedItem) block
      closeModal();
    } catch (error) {
      console.error('Failed to save encounter:', error);
    }
  };

  const getPatientName = (patientId: number | undefined) => {
    if (patientId === undefined) return 'N/A';
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  if (loading) {
    return <div className="p-6">Loading encounters...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Encounters</h1>
        {canCreate && (
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
                      {getPatientName(encounter.patient_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {encounter.encounter_class}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    encounter.status === 'finished' ? 'bg-green-100 text-green-800' :
                    encounter.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    encounter.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                    encounter.status === 'arrived' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {encounter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {encounter.period_start ? new Date(encounter.period_start).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {encounter.reason || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', encounter)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </button>
                  {/* Removed Edit button as backend update endpoint is missing */}
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
                {modal === 'create' ? 'New Encounter' : 'Encounter Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                <p><strong>Patient:</strong> {getPatientName(selectedItem.patient_id)}</p>
                <p><strong>Type:</strong> {selectedItem.encounter_class}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Start Date:</strong> {selectedItem.period_start ? new Date(selectedItem.period_start).toLocaleString() : 'N/A'}</p>
                {selectedItem.period_end && <p><strong>End Date:</strong> {new Date(selectedItem.period_end).toLocaleString()}</p>}
                <p><strong>Reason:</strong> {selectedItem.reason || 'N/A'}</p>
                {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
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
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <select
                    value={formData.encounter_class || ''}
                    onChange={(e) => setFormData({...formData, encounter_class: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="inpatient">Inpatient</option>
                    <option value="outpatient">Outpatient</option>
                    <option value="emergency">Emergency</option>
                  </select>
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
                    <option value="planned">Planned</option>
                    <option value="arrived">Arrived</option>
                    <option value="in-progress">In Progress</option>
                    <option value="finished">Finished</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="datetime-local"
                    value={formData.period_start ? new Date(formData.period_start).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, period_start: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="datetime-local"
                    value={formData.period_end ? new Date(formData.period_end).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, period_end: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason</label>
                  <input
                    type="text"
                    value={formData.reason || ''}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Routine checkup, Chest pain"
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
                    Create
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