'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../xlib/auth';
import { patientService, clinicalService, medicationsService, billingService } from '../../xlib/services';
import { 
  Users, 
  Calendar, 
  Pill, 
  CreditCard, 
  Activity, 
  Heart, 
  TrendingUp,
  UserCheck,
  Stethoscope,
  FileText
} from 'lucide-react';
import { DashboardData } from '../../types';

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData>({
    totalPatients: 0,
    todayAppointments: 0,
    activePrescriptions: 0,
    pendingBills: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          patientService.listPatients(),
          clinicalService.listAppointments(),
          medicationsService.listPrescriptions(),
          billingService.listInvoices()
        ]);

        const patients = results[0].status === 'fulfilled' ? results[0].value.data : [];
        const appointments = results[1].status === 'fulfilled' ? results[1].value.data : [];
        const prescriptions = results[2].status === 'fulfilled' ? results[2].value.data : [];
        const invoices = results[3].status === 'fulfilled' ? results[3].value.data : [];

        const today = new Date().toDateString();
        const todayAppointments = appointments.filter((apt: any) => 
          new Date(apt.appointment_datetime).toDateString() === today
        ).length;

        const activePrescriptions = prescriptions.filter((rx: any) => 
          rx.status === 'active'
        ).length;

        const pendingBills = invoices.filter((inv: any) => 
          inv.status === 'pending'
        ).length;

        setData({
          totalPatients: patients.length,
          todayAppointments,
          activePrescriptions,
          pendingBills
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
                  <div className="h-16 w-16 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Healthcare Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}! Here's your healthcare overview.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Patients</p>
                <p className="text-3xl font-bold">{data.totalPatients}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Today's Appointments</p>
                <p className="text-3xl font-bold">{data.todayAppointments}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Calendar className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Active Prescriptions</p>
                <p className="text-3xl font-bold">{data.activePrescriptions}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <Pill className="h-8 w-8" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-6 rounded-xl shadow-lg text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-1">Pending Bills</p>
                <p className="text-3xl font-bold">{data.pendingBills}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <CreditCard className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
              <Activity className="h-6 w-6 mr-2 text-emerald-600" />
              Healthcare Overview
            </h2>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Patient Load</span>
                <span className="font-bold text-xl text-slate-800">
                  {data.totalPatients} patients
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Daily Appointments</span>
                <span className="font-bold text-xl text-emerald-600">
                  {data.todayAppointments} scheduled
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Medication Management</span>
                <span className="font-bold text-xl text-purple-600">
                  {data.activePrescriptions} active
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold mb-6 text-slate-800 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-red-600" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50">
                <span className="text-gray-700">Patient Management</span>
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50">
                <span className="text-gray-700">Clinical Records</span>
                <Stethoscope className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex items-center justify-between p-3 border-l-4 border-purple-500 bg-purple-50">
                <span className="text-gray-700">Prescriptions</span>
                <Pill className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50">
                <span className="text-gray-700">Billing & Invoices</span>
                <FileText className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Dashboard;