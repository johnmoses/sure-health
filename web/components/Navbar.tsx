'use client';
import Link from 'next/link';
import { useAuth } from '../xlib/auth';
import { Heart, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 font-bold text-xl">
            <Heart className="h-8 w-8" />
            <span>SureHealth</span>
          </Link>
          
          {user && (
            <div className="flex items-center space-x-6">
              <Link href="/dashboard" className="hover:text-emerald-200 transition-colors">Dashboard</Link>
              <Link href="/patients" className="hover:text-emerald-200 transition-colors">Patients</Link>
              <Link href="/clinical" className="hover:text-emerald-200 transition-colors">Clinical</Link>
              <Link href="/medications" className="hover:text-emerald-200 transition-colors">Medications</Link>
              <Link href="/billing" className="hover:text-emerald-200 transition-colors">Billing</Link>
              <Link href="/chat" className="hover:text-emerald-200 transition-colors">Chat</Link>
              
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{user.username}</span>
                <button onClick={logout} className="hover:text-emerald-200 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}