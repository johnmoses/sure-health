export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'DOCTOR' | 'NURSE' | 'STAFF';
  avatar?: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  emergencyContact: string;
  insuranceId?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  duration: number;
  type: 'CONSULTATION' | 'FOLLOW_UP' | 'EMERGENCY';
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: string[];
  date: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  patientId: string;
  prescribedBy: string;
  prescribedAt: string;
}

export interface Bill {
  id: string;
  patientId: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  dueDate: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: string;
  type: 'TEXT' | 'FILE' | 'IMAGE';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}