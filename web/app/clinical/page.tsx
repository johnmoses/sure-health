'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../xlib/auth';
import api from '../../xlib/api';
import { Stethoscope, Calendar, Activity, FileText, Plus, Clock } from 'lucide-react';
import Link from 'next/link';

interface Encounter {
  id: number;
  patient_id: number;
  provider: string;
  status: string;
  encounter_class: string;
  reason: string;
  period_start: string;
  period_end?: string;
}

interface Observation {
  id: number;
  patient_id: number;
  code: string;
  value: string;
  unit: string;
  status: string;
  effective_datetime: string;
}

export default function Clinical() {
  const { user } = useAuth();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClinicalData = async () => {
      try {
        const [encountersRes, observationsRes] = await Promise.allSettled([
          api.get('/clinical/encounters'),
          api.get('/clinical/observations')
        ]);

        if (encountersRes.status === 'fulfilled') {
          setEncounters(encountersRes.value.data);
        }
        if (observationsRes.status === 'fulfilled') {
          setObservations(observationsRes.value.data);
        }
      } catch (error) {
        console.error('Failed to fetch clinical data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClinicalData();
    }
  }, [user]);

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
          <Link href="/clinical/encounters" className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Patient Encounters</p>
                <p className="text-3xl font-bold">{encounters.length}</p>
              </div>
              <Calendar className="h-8 w-8 opacity-80" />
            </div>
          </Link>

          <Link href="/clinical/observations" className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Observations</p>
                <p className="text-3xl font-bold">{observations.length}</p>
              </div>
              <Activity className="h-8 w-8 opacity-80" />
            </div>
          </Link>

          <Link href="/clinical/appointments" className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Appointments</p>
                <p className="text-3xl font-bold">0</p>
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
              <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors flex items-center">
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
              <button className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors flex items-center">
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
        </div>
      </div>
    </div>
  );
}