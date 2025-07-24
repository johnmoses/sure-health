"use client";

import React, { useEffect, useState, useContext, createContext } from "react";
import Image from "next/image";
import Link from "next/link";

// Dummy types, replace with your actual user type/interface
interface User {
  id: number;
  username: string;
  role: "guest" | "patient" | "clinician" | "admin";
}

// Simple Auth context to hold user (expand with real auth logic)
const AuthContext = createContext<{ user: User | null; loading: boolean }>({
  user: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate auth fetch - replace with real user fetch/token verification
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role") as User["role"] | null;
    if (token && role) {
      // e.g. fetch user profile from API here
      setUser({ id: 1, username: "JohnDoe", role });
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function HomeContent() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center text-lg">Loading...</div>;

  if (!user) {
    // Guest Landing Page
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <Image
          src="/logo.svg"
          alt="App Logo"
          width={180}
          height={38}
          priority
        />

        <h1 className="mt-4 text-3xl font-bold text-center max-w-md">
          Welcome to Sure Health
        </h1>

        <p className="mt-2 max-w-md text-center text-gray-600">
          Manage your health, appointments, prescriptions and more in one place.
        </p>

        <div className="mt-6 flex gap-4">
          <Link
            href="/auth/login"
            className="px-6 py-3 rounded bg-blue-600 text-white text-lg font-semibold hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="px-6 py-3 rounded border border-blue-600 text-blue-600 text-lg font-semibold hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // Authenticated user dashboard/home with role-based quick access cards
  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold">
          Welcome back, {user.username}
        </h1>
        <Link href="/profile" className="text-blue-600 underline">
          Profile
        </Link>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Patient quick links */}
        {(user.role === "patient" || user.role === "admin") && (
          <>
            <DashboardCard label="My Appointments" href="/appointments" />
            <DashboardCard label="My Prescriptions" href="/prescriptions" />
            <DashboardCard label="Vital Signs" href="/monitoring/vitals" />
          </>
        )}

        {/* Clinician quick links */}
        {(user.role === "clinician" || user.role === "admin") && (
          <>
            <DashboardCard label="Manage Appointments" href="/appointments" />
            <DashboardCard
              label="Patient Records"
              href="/ehr/medical_records"
            />
            <DashboardCard
              label="Prescriptions Management"
              href="/prescriptions"
            />
          </>
        )}

        {/* Common links */}
        <DashboardCard label="Chat & Support" href="/chat" />
        <DashboardCard label="Telemedicine Sessions" href="/video" />
        <DashboardCard label="Billing & Payments" href="/billing/invoices" />

        {/* Admin exclusive */}
        {user.role === "admin" && (
          <>
            <DashboardCard label="User Management" href="/admin/users" />
            <DashboardCard label="Analytics Dashboard" href="/dashboard" />
            <DashboardCard label="System Settings" href="/admin/settings" />
          </>
        )}
      </section>
    </div>
  );
}

function DashboardCard({ label, href }: { label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 p-6 text-center shadow hover:shadow-lg transition flex flex-col justify-center"
    >
      <span className="text-xl font-semibold">{label}</span>
    </Link>
  );
}
