import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, FlatList } from 'react-native';
import { authAPI, clinicalAPI } from '../services/api';
import { Appointment } from '../types';
import Icon from 'react-native-vector-icons/FontAwesome';

const HomeScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<any>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, apps] = await Promise.all([
          authAPI.profile(),
          clinicalAPI.getAppointments(),
        ]);
        setUser(profile);
        setAppointments(apps);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await authAPI.logout();
          } catch (error) {
            console.log('Logout error:', error);
          } finally {
            navigation.replace('Auth');
          }
        },
      },
    ]);
  };

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentDate}>{new Date(item.appointment_datetime).toLocaleString()}</Text>
      <Text style={styles.appointmentText}>with {item.practitioner}</Text>
      <Text style={styles.appointmentText}>Reason: {item.reason}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user?.username}!</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Icon name="sign-out" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Appointments')}>
            <Icon name="calendar" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Medications')}>
            <Icon name="medkit" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Medications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Chats')}>
            <Icon name="comments" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Billing')}>
            <Icon name="credit-card" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Billing</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Dashboard')}>
            <Icon name="dashboard" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsContainer}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {loading ? (
            <Text>Loading appointments...</Text>
          ) : (
            <FlatList
              data={appointments}
              renderItem={renderAppointment}
              keyExtractor={(item) => item.id.toString()}
              ListEmptyComponent={<Text>No upcoming appointments.</Text>}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    flexWrap: 'wrap',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: 100,
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    marginTop: 5,
  },
  appointmentsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appointmentText: {
    fontSize: 14,
    marginTop: 5,
  },
});

export default HomeScreen;
