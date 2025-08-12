'use client';

import { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, X, User } from 'lucide-react';
import { useAuth } from '../../../xlib/auth'; // Assuming this is the correct auth hook
import { Appointment, Patient } from '../../../types';
import { clinicalService, patientService } from '../../../xlib/services';

type ModalType = 'view' | 'create' | null; // Removed 'edit'

export default function AppointmentsPage() {
  const { user } = useAuth(); // Use the common auth hook
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<Partial<Appointment>>({});

  const canCreate = user?.role === 'admin' || user?.role === 'clinician'; // Adjusted roles based on common patterns

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Ensure user is loaded
      try {
        const [appointmentsRes, patientsRes] = await Promise.all([
          clinicalService.listAppointments(),
          patientService.listPatients()
        ]);
        setAppointments(appointmentsRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Depend on user to refetch when auth state changes

  const openModal = (type: ModalType, item?: Appointment) => {
    setModal(type);
    setSelectedItem(item || null);
    // Ensure date is in correct format for datetime-local input
    if (item?.appointment_datetime) {
      setFormData({ ...item, appointment_datetime: new Date(item.appointment_datetime).toISOString().slice(0, 16) });
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
      if (dataToSend.appointment_datetime && typeof dataToSend.appointment_datetime === 'string') {
        dataToSend.appointment_datetime = new Date(dataToSend.appointment_datetime).toISOString();
      }

      if (modal === 'create') {
        const response = await clinicalService.createAppointment(dataToSend as Appointment);
        setAppointments([...appointments, response.data]);
      }
      // Removed else if (modal === 'edit' && selectedItem) block
      closeModal();
    } catch (error) {
      console.error('Failed to save appointment:', error);
    }
  };

  const getPatientName = (patientId: number | undefined) => {
    if (patientId === undefined) return 'N/A';
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  if (loading) {
    return <div className="p-6">Loading appointments...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
        {canCreate && (
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Appointment
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Practitioner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {getPatientName(appointment.patient_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.appointment_datetime ? new Date(appointment.appointment_datetime).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {appointment.practitioner || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                    appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                    appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {appointment.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', appointment)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
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
                {modal === 'create' ? 'New Appointment' : 'Appointment Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                <p><strong>Patient:</strong> {getPatientName(selectedItem.patient_id)}</p>
                <p><strong>Date:</strong> {selectedItem.appointment_datetime ? new Date(selectedItem.appointment_datetime).toLocaleString() : 'N/A'}</p>
                <p><strong>Practitioner:</strong> {selectedItem.practitioner || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedItem.status}</p>
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
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.appointment_datetime ? new Date(formData.appointment_datetime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setFormData({...formData, appointment_datetime: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Practitioner</label>
                  <input
                    type="text"
                    value={formData.practitioner || ''}
                    onChange={(e) => setFormData({...formData, practitioner: e.target.value})}
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
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
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