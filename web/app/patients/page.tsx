'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../xlib/auth';
import { patientService } from '../../xlib/services';
import { Patient } from '../../types';
import { Users, Plus, Search, Phone, Mail, Calendar } from 'lucide-react';

export default function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      setLoading(true);
      try {
        let response;
        if (debouncedSearchTerm) {
          response = await patientService.searchPatients(debouncedSearchTerm);
        } else {
          response = await patientService.listPatients();
        }
        setPatients(response.data);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user, debouncedSearchTerm]);

  const handleAddPatient = () => {
    console.log('Add Patient button clicked. Implement modal or form here.');
    // Example: open a modal for adding a new patient
    // setOpenAddPatientModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2 flex items-center">
            <Users className="h-10 w-10 mr-3 text-emerald-600" />
            Patient Management
          </h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients by name or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleAddPatient}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Patient
          </button>
        </div>

        <div className="grid gap-6">
          {patients.map((patient) => (
            <div key={patient.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-2 rounded-lg mr-4">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        {patient.first_name} {patient.last_name}
                      </h3>
                      <p className="text-gray-600">MRN: {patient.medical_record_number}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                      {patient.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                      {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">Insurance:</span> {patient.insurance_provider || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 flex gap-2">
                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  <button className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-200 transition-colors">
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {patients.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first patient to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom hook for debouncing a value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
