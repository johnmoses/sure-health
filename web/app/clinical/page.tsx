'use client';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../xlib/auth-store';
import { clinicalService, patientService } from '../../xlib/services';
import { Stethoscope, Calendar, Activity, FileText, Plus, Clock, X, User } from 'lucide-react';
import Link from 'next/link';
import { Encounter, Observation, Appointment, Patient } from '../../types';

type ModalType = 'view' | 'create' | 'edit' | null;
type ClinicalItemType = Encounter | Observation | Appointment | null;

export default function Clinical() {
  const { user } = useAuthStore();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<ClinicalItemType>(null);
  const [formData, setFormData] = useState<Partial<ClinicalItemType>>({});
  const [currentFormType, setCurrentFormType] = useState<'encounter' | 'observation' | 'appointment' | null>(null);

  useEffect(() => {
    const fetchClinicalData = async () => {
      try {
        const [encountersRes, observationsRes, appointmentsRes, patientsRes] = await Promise.allSettled([
          clinicalService.listEncounters(),
          clinicalService.listObservations(),
          clinicalService.listAppointments(),
          patientService.listPatients() 
        ]);

        if (encountersRes.status === 'fulfilled') {
          setEncounters(encountersRes.value.data);
        }
        if (observationsRes.status === 'fulfilled') {
          setObservations(observationsRes.value.data);
        }
        if (appointmentsRes.status === 'fulfilled') {
          setAppointments(appointmentsRes.value.data);
        }
        if (patientsRes.status === 'fulfilled') {
          setPatients(patientsRes.value.data);
        }
      } catch (error) {
        console.error('Failed to fetch clinical data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      console.log('Current user state:', user);
      fetchClinicalData();
    } else {
      setLoading(false); // Ensure loading is set to false if user is not available
    }
  }, [user]);

  const openModal = (type: ModalType, itemType: 'encounter' | 'observation' | 'appointment', item?: ClinicalItemType) => {
    setModal(type);
    setCurrentFormType(itemType);
    setSelectedItem(item || null);
    setFormData(item || {});
  };

  const closeModal = () => {
    setModal(null);
    setSelectedItem(null);
    setFormData({});
    setCurrentFormType(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response: any;
      if (currentFormType === 'encounter') {
        if (modal === 'create') {
          response = await clinicalService.createEncounter(formData as Encounter);
          setEncounters(prev => [...prev, response.data]);
        } else if (modal === 'edit' && selectedItem) {
          response = await clinicalService.updateEncounter(selectedItem.id!, formData as Encounter);
          setEncounters(prev => prev.map(item => item.id === selectedItem.id ? response.data : item));
        }
      } else if (currentFormType === 'observation') {
        if (modal === 'create') {
          response = await clinicalService.createObservation(formData as Observation);
          setObservations(prev => [...prev, response.data]);
        } else if (modal === 'edit' && selectedItem) {
          response = await clinicalService.updateObservation(selectedItem.id!, formData as Observation);
          setObservations(prev => prev.map(item => item.id === selectedItem.id ? response.data : item));
        }
      } else if (currentFormType === 'appointment') {
        if (modal === 'create') {
          response = await clinicalService.createAppointment(formData as Appointment);
          setAppointments(prev => [...prev, response.data]);
        } else if (modal === 'edit' && selectedItem) {
          response = await clinicalService.updateAppointment(selectedItem.id!, formData as Appointment);
          setAppointments(prev => prev.map(item => item.id === selectedItem.id ? response.data : item));
        }
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save clinical data:', error);
    }
  };

  const handleDelete = async (itemType: 'encounter' | 'observation' | 'appointment', id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (itemType === 'encounter') {
        await clinicalService.deleteEncounter(id);
        setEncounters(prev => prev.filter(item => item.id !== id));
      } else if (itemType === 'observation') {
        await clinicalService.deleteObservation(id);
        setObservations(prev => prev.filter(item => item.id !== id));
      } else if (itemType === 'appointment') {
        await clinicalService.deleteAppointment(id);
        setAppointments(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete clinical data:', error);
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid lg:grid-cols-2 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center">
            <Stethoscope className="h-10 w-10 mr-3 text-emerald-600" />
            Clinical Management
          </h1>
          <p className="text-gray-600">Manage patient encounters, observations, and clinical data</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="#" onClick={() => openModal('create', 'encounter')} className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Patient Encounters</p>
                <p className="text-3xl font-bold">{encounters.length}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </Link>

          <Link href="#" onClick={() => openModal('create', 'observation')} className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Observations</p>
                <p className="text-3xl font-bold">{observations.length}</p>
              </div>
              <Activity className="h-8 w-8 opacity-80" />
            </div>
          </Link>

          <Link href="#" onClick={() => openModal('create', 'appointment')} className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Appointments</p>
                <p className="text-3xl font-bold">{appointments.length}</p>
              </div>
              <Clock className="h-8 w-8 opacity-80" />
            </div>
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-blue-600" />
                Recent Encounters
              </h2>
              <button onClick={() => openModal('create', 'encounter')} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New
              </button>
            </div>
            
            <div className="space-y-4">
              {encounters.slice(0, 5).map((encounter) => (
                <div key={encounter.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800">{encounter.reason}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      encounter.status === 'finished' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {encounter.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Provider: {encounter.provider}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(encounter.period_start).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => openModal('view', 'encounter', encounter)} className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    <button onClick={() => openModal('edit', 'encounter', encounter)} className="text-green-600 hover:text-green-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete('encounter', encounter.id!)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              
              {encounters.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No encounters recorded</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-green-600" />
                Recent Observations
              </h2>
              <button onClick={() => openModal('create', 'observation')} className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New
              </button>
            </div>
            
            <div className="space-y-4">
              {observations.slice(0, 5).map((observation) => (
                <div key={observation.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800 capitalize">
                      {observation.code.replace('_', ' ')}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {observation.status}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-emerald-600 mb-1">
                    {observation.value} {observation.unit}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(observation.effective_datetime).toLocaleDateString()}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => openModal('view', 'observation', observation)} className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    <button onClick={() => openModal('edit', 'observation', observation)} className="text-green-600 hover:text-green-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete('observation', observation.id!)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              
              {observations.length === 0 && (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No observations recorded</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mt-8 lg:mt-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 flex items-center">
                <Clock className="h-6 w-6 mr-2 text-purple-600" />
                Recent Appointments
              </h2>
              <button onClick={() => openModal('create', 'appointment')} className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                New
              </button>
            </div>
            
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-800">{appointment.reason}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                      appointment.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Practitioner: {appointment.practitioner}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.appointment_datetime).toLocaleDateString()} at {new Date(appointment.appointment_datetime).toLocaleTimeString()}
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <button onClick={() => openModal('view', 'appointment', appointment)} className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                    <button onClick={() => openModal('edit', 'appointment', appointment)} className="text-green-600 hover:text-green-800 text-sm">Edit</button>
                    <button onClick={() => handleDelete('appointment', appointment.id!)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                  </div>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No appointments recorded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for CRUD operations */}
      {modal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
          <div className="relative p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium capitalize">
                {modal} {currentFormType}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modal === 'view' && selectedItem ? (
              <div className="space-y-3">
                {currentFormType === 'encounter' && selectedItem && (
                  <>
                    <p><strong>Patient:</strong> {getPatientName((selectedItem as Encounter).patient_id)}</p>
                    <p><strong>Reason:</strong> {(selectedItem as Encounter).reason}</p>
                    <p><strong>Provider:</strong> {(selectedItem as Encounter).provider}</p>
                    <p><strong>Status:</strong> {(selectedItem as Encounter).status}</p>
                    <p><strong>Class:</strong> {(selectedItem as Encounter).encounter_class}</p>
                    <p><strong>Start:</strong> {new Date((selectedItem as Encounter).period_start).toLocaleString()}</p>
                    <p><strong>End:</strong> {(selectedItem as Encounter).period_end ? new Date((selectedItem as Encounter).period_end!).toLocaleString() : 'N/A'}</p>
                  </>
                )}
                {currentFormType === 'observation' && selectedItem && (
                  <>
                    <p><strong>Patient:</strong> {getPatientName((selectedItem as Observation).patient_id)}</p>
                    <p><strong>Code:</strong> {(selectedItem as Observation).code}</p>
                    <p><strong>Value:</strong> {(selectedItem as Observation).value} {(selectedItem as Observation).unit}</p>
                    <p><strong>Status:</strong> {(selectedItem as Observation).status}</p>
                    <p><strong>Effective:</strong> {new Date((selectedItem as Observation).effective_datetime).toLocaleString()}</p>
                  </>
                )}
                {currentFormType === 'appointment' && selectedItem && (
                  <>
                    <p><strong>Patient:</strong> {getPatientName((selectedItem as Appointment).patient_id)}</p>
                    <p><strong>Reason:</strong> {(selectedItem as Appointment).reason}</p>
                    <p><strong>Practitioner:</strong> {(selectedItem as Appointment).practitioner}</p>
                    <p><strong>Status:</strong> {(selectedItem as Appointment).status}</p>
                    <p><strong>Location:</strong> {(selectedItem as Appointment).location}</p>
                    <p><strong>Time:</strong> {new Date((selectedItem as Appointment).appointment_datetime).toLocaleString()}</p>
                  </>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient</label>
                  <select
                    name="patient_id"
                    value={(formData as any).patient_id || ''}
                    onChange={handleChange}
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

                {currentFormType === 'encounter' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <input type="text" name="reason" value={(formData as Encounter).reason || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Provider</label>
                      <input type="text" name="provider" value={(formData as Encounter).provider || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="status" value={(formData as Encounter).status || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                        <option value="">Select Status</option>
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="finished">Finished</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Class</label>
                      <input type="text" name="encounter_class" value={(formData as Encounter).encounter_class || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Period Start</label>
                      <input type="datetime-local" name="period_start" value={(formData as Encounter).period_start ? (formData as Encounter).period_start.substring(0, 16) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Period End</label>
                      <input type="datetime-local" name="period_end" value={(formData as Encounter).period_end ? (formData as Encounter).period_end!.substring(0, 16) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                  </>
                )}

                {currentFormType === 'observation' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Code</label>
                      <input type="text" name="code" value={(formData as Observation).code || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Value</label>
                      <input type="text" name="value" value={(formData as Observation).value || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Unit</label>
                      <input type="text" name="unit" value={(formData as Observation).unit || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="status" value={(formData as Observation).status || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                        <option value="">Select Status</option>
                        <option value="final">Final</option>
                        <option value="preliminary">Preliminary</option>
                        <option value="amended">Amended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Effective Datetime</label>
                      <input type="datetime-local" name="effective_datetime" value={(formData as Observation).effective_datetime ? (formData as Observation).effective_datetime.substring(0, 16) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                  </>
                )}

                {currentFormType === 'appointment' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Reason</label>
                      <input type="text" name="reason" value={(formData as Appointment).reason || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Practitioner</label>
                      <input type="text" name="practitioner" value={(formData as Appointment).practitioner || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select name="status" value={(formData as Appointment).status || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required>
                        <option value="">Select Status</option>
                        <option value="booked">Booked</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input type="text" name="location" value={(formData as Appointment).location || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Appointment Datetime</label>
                      <input type="datetime-local" name="appointment_datetime" value={(formData as Appointment).appointment_datetime ? (formData as Appointment).appointment_datetime.substring(0, 16) : ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 mt-4">
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