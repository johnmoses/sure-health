'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../xlib/auth';
import { medicationsService } from '../../xlib/services';
import { Prescription } from '../../types';
import { Pill, Plus, Search, Clock, User, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Medications() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user) return; // Ensure user is loaded
      try {
        const response = await medicationsService.listPrescriptions();
        setPrescriptions(response.data || []);
      } catch (error) {
        console.error('Failed to fetch prescriptions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.prescribed_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activePrescriptions = prescriptions.filter(p => p.status === 'active').length;
  const totalPrescriptions = prescriptions.length;

  const handleNewPrescription = () => {
    console.log('New Prescription button clicked. Implement modal or form here.');
    // Example: open a modal for adding a new prescription
    // setOpenAddPrescriptionModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid gap-6">
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
            <Pill className="h-10 w-10 mr-3 text-emerald-600" />
            Medication Management
          </h1>
          <p className="text-gray-600">Manage prescriptions, treatment plans, and medication counseling</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Active Prescriptions</p>
                <p className="text-3xl font-bold">{activePrescriptions}</p>
              </div>
              <Pill className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Prescriptions</p>
                <p className="text-3xl font-bold">{totalPrescriptions}</p>
              </div>
              <FileText className="h-8 w-8 opacity-80" />
            </div>
          </div>

          <Link href="/medications/counseling" className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">AI Counseling</p>
                <p className="text-lg font-semibold">Available</p>
              </div>
              <User className="h-8 w-8 opacity-80" />
            </div>
          </Link>
        </div>

        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications or prescriber..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button
            onClick={handleNewPrescription}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Prescription
          </button>
        </div>

        <div className="grid gap-6">
          {filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-2 rounded-lg mr-4">
                      <Pill className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800">
                        {prescription.medication_name}
                      </h3>
                      <p className="text-gray-600">{prescription.dosage} - {prescription.frequency}</p>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <User className="h-4 w-4 mr-2 text-emerald-600" />
                      Prescribed by: {prescription.prescribed_by}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                      Start: {new Date(prescription.start_date).toLocaleDateString()}
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        prescription.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {prescription.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 flex gap-2">
                  <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                    View Details
                  </button>
                  {/* Removed Edit and Refill buttons as backend update/refill endpoints are missing */}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPrescriptions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Add your first prescription to get started'}
            </p>
          </div>
        )}

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Link href="/medications/counseling" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-slate-800">AI Counseling</h3>
            </div>
            <p className="text-gray-600">Get AI-powered medication counseling</p>
          </Link>

          <Link href="/medications/treatment-plans" className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-slate-800">Treatment Plans</h3>
            </div>
            <p className="text-gray-600">Comprehensive treatment planning and monitoring</p>
          </Link>
        </div>
      </div>
    </div>
  );
}