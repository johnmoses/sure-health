'use client';

import Link from 'next/link';
import { Calendar, Activity, FileText } from 'lucide-react';

export default function ClinicalPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Clinical Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/clinical/appointments" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <Calendar className="h-8 w-8 text-indigo-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
            </div>
            <p className="text-gray-600">Manage patient appointments, scheduling, and calendar</p>
          </div>
        </Link>

        <Link href="/clinical/observations" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <Activity className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Observations</h2>
            </div>
            <p className="text-gray-600">Record and track patient vital signs and measurements</p>
          </div>
        </Link>

        <Link href="/clinical/encounters" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Encounters</h2>
            </div>
            <p className="text-gray-600">Document patient visits and clinical encounters</p>
          </div>
        </Link>
      </div>
    </div>
  );
}