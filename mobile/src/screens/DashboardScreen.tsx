import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { authAPI, clinicalAPI, chatAPI, billingAPI } from '../services/api';
import { User, Appointment, ChatRoom, Invoice } from '../types';

const DashboardScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await authAPI.profile();
        setUser(profile);
        const patientId = profile.id;

        const [appointments, rooms, invoices] = await Promise.all([
          clinicalAPI.getAppointments(),
          chatAPI.getRooms(),
          billingAPI.getInvoices(patientId),
        ]);

        setAppointments(appointments);
        setChatRooms(rooms);
        setInvoices(invoices);
      } catch (err) {
        setError('Failed to fetch dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.appointment_datetime) > new Date()
  );

  const unreadMessages = chatRooms.reduce((count, room) => {
    return count + (room.last_message ? 1 : 0);
  }, 0);

  const totalOutstanding = invoices.reduce((total, invoice) => {
    if (invoice.status === 'due') {
      return total + invoice.amount;
    }
    return total;
  }, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.username}!</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Upcoming Appointments</Text>
        <Text style={styles.metric}>{upcomingAppointments.length}</Text>
        <Text style={styles.metricLabel}>upcoming</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Messages</Text>
        <Text style={styles.metric}>{unreadMessages}</Text>
        <Text style={styles.metricLabel}>unread messages</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Billing Summary</Text>
        <Text style={styles.metric}>${totalOutstanding.toFixed(2)}</Text>
        <Text style={styles.metricLabel}>outstanding</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  metric: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  metricLabel: {
    fontSize: 16,
    color: '#666',
  },
});

export default DashboardScreen;
