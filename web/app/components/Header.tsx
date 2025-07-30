'use client';

import Link from 'next/link';
import { useAuthStore } from '../auth-store';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            SureHealth
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">Dashboard</Link>
                <Link href="/patients" className="text-gray-700 hover:text-indigo-600">Patients</Link>
                <Link href="/clinical" className="text-gray-700 hover:text-indigo-600">Clinical</Link>
                <Link href="/medications" className="text-gray-700 hover:text-indigo-600">Medications</Link>
                <Link href="/billing" className="text-gray-700 hover:text-indigo-600">Billing</Link>
                <Link href="/chat" className="text-gray-700 hover:text-indigo-600">Chat</Link>
              </nav>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <button onClick={logout} className="text-gray-500 hover:text-red-600">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-x-4">
              <Link href="/auth" className="text-gray-700 hover:text-indigo-600">Sign In</Link>
              <Link href="/auth/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}