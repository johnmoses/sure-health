'use client';

import Link from 'next/link';
import { Pill, FileText, MessageCircle } from 'lucide-react';

export default function MedicationsPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Medications Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/medications/prescriptions" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <Pill className="h-8 w-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Prescriptions</h2>
            </div>
            <p className="text-gray-600">Manage patient prescriptions and medication orders</p>
          </div>
        </Link>

        <Link href="/medications/treatment-plans" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <FileText className="h-8 w-8 text-orange-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Treatment Plans</h2>
            </div>
            <p className="text-gray-600">Create and manage comprehensive treatment plans</p>
          </div>
        </Link>

        <Link href="/medications/counseling" className="block">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center mb-4">
              <MessageCircle className="h-8 w-8 text-teal-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Counseling</h2>
            </div>
            <p className="text-gray-600">AI-powered medication counseling and education</p>
          </div>
        </Link>
      </div>
    </div>
  );
}