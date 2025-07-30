'use client';

import Link from 'next/link';
import { useAuthStore } from './auth-store';
import { Users, Stethoscope, Pill, CreditCard, MessageCircle } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="flex items-center justify-center bg-gray-50 py-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">SureHealth</h1>
        <p className="text-xl text-gray-600 mb-8">Electronic Health Records System</p>
        
        {isAuthenticated ? (
          <div>
            <p className="text-lg text-gray-700 mb-6">Welcome back, {user?.name || user?.username}!</p>
            <p className="text-sm text-gray-500 mb-8">Role: {user?.role}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <Link href="/dashboard" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <Users className="h-8 w-8 text-indigo-600 mb-2" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              <Link href="/patients" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Patients</span>
              </Link>
              <Link href="/clinical" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <Stethoscope className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Clinical</span>
              </Link>
              <Link href="/medications" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <Pill className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Medications</span>
              </Link>
              <Link href="/billing" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <CreditCard className="h-8 w-8 text-yellow-600 mb-2" />
                <span className="text-sm font-medium">Billing</span>
              </Link>
              <Link href="/chat" className="flex flex-col items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <MessageCircle className="h-8 w-8 text-red-600 mb-2" />
                <span className="text-sm font-medium">Chat</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-lg text-gray-600 mb-8">Comprehensive healthcare management platform</p>
            <div className="space-x-4">
              <Link
                href="/auth"
                className="inline-block px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="inline-block px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Register
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6">
                <Stethoscope className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Clinical Management</h3>
                <p className="text-gray-600">Comprehensive patient care and clinical workflows</p>
              </div>
              <div className="text-center p-6">
                <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Telemedicine</h3>
                <p className="text-gray-600">Video consultations and secure messaging</p>
              </div>
              <div className="text-center p-6">
                <CreditCard className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Billing & Payments</h3>
                <p className="text-gray-600">Streamlined financial management</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
