'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

interface User {
  id: number;
  username: string;
  role: "guest" | "patient" | "clinician" | "admin";
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be called within AuthProvider");
  return ctx;
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load auth data from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("user_id");
    const username = localStorage.getItem("username");
    const role = localStorage.getItem("user_role") as User["role"] | null;

    if (token && userId && username && role) {
      setUser({ id: Number(userId), username, role });
    }
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("user_role");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`block px-3 py-2 rounded-md text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
        isActive ? "bg-indigo-700 text-white" : "text-gray-300 hover:bg-indigo-600 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

function NavBar() {
  const { user, loading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) return null;

  return (
    <header className="bg-indigo-800 text-white">
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        aria-label="Primary navigation"
      >
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-semibold hover:text-indigo-300">
              HealthPortal
            </Link>
          </div>

          <div className="hidden md:flex md:space-x-6">
            {!user && (
              <>
                <NavLink href="/auth/login">Login</NavLink>
                <NavLink href="/auth/register">Register</NavLink>
              </>
            )}
            {user && (
              <>
                {user.role === "patient" && (
                  <>
                    <NavLink href="/appointments">My Appointments</NavLink>
                    <NavLink href="/prescriptions">Prescriptions</NavLink>
                    <NavLink href="/monitoring/vitals">Vitals</NavLink>
                  </>
                )}
                {user.role === "clinician" && (
                  <>
                    <NavLink href="/appointments">Manage Appointments</NavLink>
                    <NavLink href="/ehr/medical_records">Patient Records</NavLink>
                    <NavLink href="/prescriptions">Prescriptions</NavLink>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/analytics">Analytics</NavLink>
                    <NavLink href="/admin/settings">Settings</NavLink>
                  </>
                )}

                {/* Common Links */}
                <NavLink href="/chat">Chat</NavLink>
                <NavLink href="/video">Video Sessions</NavLink>
                <NavLink href="/billing/invoices">Billing</NavLink>
                <NavLink href="/auth/profile">Profile</NavLink>

                <button
                  onClick={logout}
                  className="ml-4 bg-red-600 hover:bg-red-700 rounded px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                  aria-label="Logout"
                >
                  Logout ({user.username})
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!mobileOpen ? (
                // hamburger icon
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                // close icon
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav id="mobile-menu" className="md:hidden bg-indigo-900 px-2 pt-2 pb-3 space-y-1" aria-label="Mobile navigation">
            {!user && (
              <>
                <NavLink href="/auth/login">Login</NavLink>
                <NavLink href="/auth/register">Register</NavLink>
              </>
            )}
            {user && (
              <>
                {user.role === "patient" && (
                  <>
                    <NavLink href="/appointments">My Appointments</NavLink>
                    <NavLink href="/prescriptions">Prescriptions</NavLink>
                    <NavLink href="/monitoring/vitals">Vitals</NavLink>
                  </>
                )}
                {user.role === "clinician" && (
                  <>
                    <NavLink href="/appointments">Manage Appointments</NavLink>
                    <NavLink href="/ehr/medical_records">Patient Records</NavLink>
                    <NavLink href="/prescriptions">Prescriptions</NavLink>
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/analytics">Analytics</NavLink>
                    <NavLink href="/admin/settings">Settings</NavLink>
                  </>
                )}

                {/* Common links */}
                <NavLink href="/chat/rooms">Chat</NavLink>
                <NavLink href="/video">Video Sessions</NavLink>
                <NavLink href="/billing/invoices">Billing</NavLink>
                <NavLink href="/profile">Profile</NavLink>

                <button
                  onClick={logout}
                  className="w-full text-left bg-red-600 hover:bg-red-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
                  aria-label="Logout"
                >
                  Logout ({user.username})
                </button>
              </>
            )}
          </nav>
        )}
      </nav>
    </header>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <NavBar />
          <main className="min-h-[calc(100vh-64px)] py-8 px-4 md:px-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
