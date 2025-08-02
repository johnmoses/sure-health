'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../xlib/auth';
import { Heart, Shield, Users, Activity } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-full">
              <Heart className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Welcome to SureHealth
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your comprehensive AI-powered healthcare management platform. 
            Streamline patient care, manage clinical data, and enhance healthcare delivery.
          </p>
          <div className="space-x-4">
            <Link
              href="/auth/login"
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-8 py-4 rounded-lg font-medium hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 inline-block"
            >
              Get Started
            </Link>
            <Link
              href="/auth/register"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-50 border border-emerald-200 transition-all duration-200 inline-block"
            >
              Sign Up
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Patient Management</h3>
            <p className="text-gray-600">
              Comprehensive patient records, demographics, and medical history management.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">Clinical Data</h3>
            <p className="text-gray-600">
              Track observations, encounters, appointments, and clinical workflows.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-3">HIPAA Compliant</h3>
            <p className="text-gray-600">
              Secure, encrypted, and fully compliant with healthcare regulations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
