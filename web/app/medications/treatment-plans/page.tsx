'use client';

import { useEffect, useState } from 'react';
import { FileText, Plus, X, User } from 'lucide-react';
import { useAuthStore } from '../../../xlib/auth-store';
import { Patient, TreatmentPlan } from '../../../types';
import { medicationsService, patientService } from '../../../xlib/services';



type ModalType = 'view' | 'create' | 'edit' | null;

export default function TreatmentPlansPage() {
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<TreatmentPlan | null>(null);
  const [formData, setFormData] = useState<Partial<TreatmentPlan>>({});
  const { user, hydrated, hydrate } = useAuthStore();

  const canEdit = user?.role === 'ADMIN' || user?.role === 'DOCTOR';

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, patientsRes] = await Promise.all([
          medicationsService.listTreatmentPlans(),
          patientService.listPatients()
        ]);
        setTreatmentPlans(plansRes.data || []);
        setPatients(patientsRes.data || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = (type: ModalType, item?: TreatmentPlan) => {
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
        const response = await medicationsService.createTreatmentPlan(formData);
        setTreatmentPlans([...treatmentPlans, response.data]);
      } else if (modal === 'edit' && selectedItem) {
        const response = await medicationsService.updateTreatmentPlan(selectedItem.id!, formData);
        setTreatmentPlans(treatmentPlans.map(p => p.id === selectedItem.id ? response.data : p));
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save treatment plan:', error);
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  if (!hydrated || loading) {
    return <div className="p-6">Loading treatment plans...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Treatment Plans</h1>
        {canEdit && (
          <button
            onClick={() => openModal('create')}
            className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Treatment Plan
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {treatmentPlans.map((plan) => (
              <tr key={plan.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {getPatientName(plan.patient_id)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {plan.plan_description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {plan.start_date ? new Date(plan.start_date).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    plan.status === 'Active' ? 'bg-green-100 text-green-800' :
                    plan.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                    plan.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {plan.responsible_provider}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => openModal('view', plan)}
                    className="text-orange-600 hover:text-orange-900 mr-3"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => openModal('edit', plan)}
                      className="text-orange-600 hover:text-orange-900"
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
                {modal === 'create' ? 'New Treatment Plan' : 
                 modal === 'edit' ? 'Edit Treatment Plan' : 'Treatment Plan Details'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                <p><strong>Patient:</strong> {getPatientName(selectedItem.patient_id)}</p>
                <p><strong>Description:</strong> {selectedItem.plan_description}</p>
                <p><strong>Start Date:</strong> {selectedItem.start_date}</p>
                {selectedItem.end_date && <p><strong>End Date:</strong> {selectedItem.end_date}</p>}
                <p><strong>Status:</strong> {selectedItem.status}</p>
                <p><strong>Provider:</strong> {selectedItem.responsible_provider}</p>
                {selectedItem.notes && <p><strong>Notes:</strong> {selectedItem.notes}</p>}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    value={formData.patient_id ?? ''}
                    onChange={(e) => setFormData({...formData, patient_id: parseInt(e.target.value)})}
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
                  <label className="block text-sm font-medium text-gray-700">Plan Description</label>
                  <textarea
                    value={formData.plan_description || ''}
                    onChange={(e) => setFormData({...formData, plan_description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={4}
                    required
                  />
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
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status || ''}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsible Provider</label>
                  <input
                    type="text"
                    value={formData.responsible_provider || ''}
                    onChange={(e) => setFormData({...formData, responsible_provider: e.target.value})}
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
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
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