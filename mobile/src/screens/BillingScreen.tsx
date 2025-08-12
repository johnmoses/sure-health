import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { billingAPI, authAPI } from '../services/api';
import { Invoice, User } from '../types';

const BillingScreen = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await authAPI.profile();
        setUser(profile);
        // The profile object from the backend should have a patient_id
        const patientId = profile.id; // Assuming the user ID is the patient ID
        const fetchedInvoices = await billingAPI.getInvoices(patientId);
        setInvoices(fetchedInvoices);
      } catch (err) {
        setError('Failed to fetch data.');
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

  const renderItem = ({ item }: { item: Invoice }) => (
    <View style={styles.invoiceItem}>
      <Text style={styles.invoiceText}>Invoice ID: {item.id}</Text>
      <Text style={styles.invoiceText}>Amount: ${item.amount.toFixed(2)}</Text>
      <Text style={styles.invoiceText}>Status: {item.status}</Text>
      <Text style={styles.invoiceText}>Due Date: {new Date(item.due_date).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Invoices for {user?.username}</Text>
      <FlatList
        data={invoices}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No invoices found.</Text>}
      />
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
  invoiceItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  invoiceText: {
    fontSize: 16,
  },
});

export default BillingScreen;
