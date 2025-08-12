import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Modal, TextInput, Button, Alert } from 'react-native';
import { clinicalAPI } from '../services/api';
import { Prescription } from '../types';

const MedicationsScreen = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newPrescription, setNewPrescription] = useState<Omit<Prescription, 'id'> | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [counseling, setCounseling] = useState("");
  const [medicationName, setMedicationName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const rxs = await clinicalAPI.getPrescriptions();
      setPrescriptions(rxs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPrescription = async () => {
    if (newPrescription) {
      try {
        await clinicalAPI.createPrescription(newPrescription);
        setIsModalVisible(false);
        setNewPrescription(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdatePrescription = async () => {
    if (selectedPrescription) {
      try {
        await clinicalAPI.updatePrescription(selectedPrescription.id, selectedPrescription);
        setIsModalVisible(false);
        setSelectedPrescription(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeletePrescription = (id: number) => {
    Alert.alert(
      "Delete Prescription",
      "Are you sure you want to delete this prescription?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "OK", onPress: async () => {
            try {
              await clinicalAPI.deletePrescription(id);
              fetchData(); // Refresh data
            } catch (error) {
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleGetCounseling = async () => {
    if (medicationName) {
      try {
        const res = await clinicalAPI.getMedicationCounseling(medicationName);
        setCounseling(res.counseling);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const renderPrescription = ({ item }: { item: Prescription }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}><Text style={styles.bold}>Medication:</Text> {item.medication_name}</Text>
      <Text style={styles.itemText}><Text style={styles.bold}>Dosage:</Text> {item.dosage}</Text>
      <Text style={styles.itemText}><Text style={styles.bold}>Status:</Text> {item.status}</Text>
      <Text style={styles.itemText}><Text style={styles.bold}>Start Date:</Text> {new Date(item.start_date).toLocaleDateString()}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Edit" onPress={() => { setSelectedPrescription(item); setIsModalVisible(true); }} />
        <Button title="Delete" onPress={() => handleDeletePrescription(item.id)} color="red" />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
          setSelectedPrescription(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{selectedPrescription ? "Edit Prescription" : "New Prescription"}</Text>
            <TextInput
              placeholder="Patient ID"
              style={styles.input}
              defaultValue={selectedPrescription?.patient_id.toString()}
              onChangeText={(text) => selectedPrescription ? setSelectedPrescription({ ...selectedPrescription, patient_id: parseInt(text) }) : setNewPrescription(prev => ({ ...prev!, patient_id: parseInt(text) }))}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Medication Name"
              style={styles.input}
              defaultValue={selectedPrescription?.medication_name}
              onChangeText={(text) => selectedPrescription ? setSelectedPrescription({ ...selectedPrescription, medication_name: text }) : setNewPrescription(prev => ({ ...prev!, medication_name: text }))}
            />
            <TextInput
              placeholder="Dosage"
              style={styles.input}
              defaultValue={selectedPrescription?.dosage}
              onChangeText={(text) => selectedPrescription ? setSelectedPrescription({ ...selectedPrescription, dosage: text }) : setNewPrescription(prev => ({ ...prev!, dosage: text }))}
            />
            <TextInput
              placeholder="Status"
              style={styles.input}
              defaultValue={selectedPrescription?.status || ''}
              onChangeText={(text) => selectedPrescription ? setSelectedPrescription({ ...selectedPrescription, status: text }) : setNewPrescription(prev => ({ ...prev!, status: text }))}
            />
            <TextInput
              placeholder="Start Date (YYYY-MM-DD)"
              style={styles.input}
              defaultValue={selectedPrescription?.start_date || ''}
              onChangeText={(text) => selectedPrescription ? setSelectedPrescription({ ...selectedPrescription, start_date: text }) : setNewPrescription(prev => ({ ...prev!, start_date: text }))}
            />
            <View style={styles.buttonContainer}>
              <Button title={selectedPrescription ? "Update" : "Add"} onPress={selectedPrescription ? handleUpdatePrescription : handleAddPrescription} />
              <Button title="Cancel" onPress={() => { setIsModalVisible(false); setSelectedPrescription(null); }} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Prescriptions</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={prescriptions}
        renderItem={renderPrescription}
        keyExtractor={(item) => item.id.toString()}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Medication Counseling</Text>
      </View>
      <TextInput
        placeholder="Enter Medication Name"
        style={styles.input}
        onChangeText={setMedicationName}
      />
      <Button title="Get Counseling" onPress={handleGetCounseling} />
      {counseling ? <Text style={styles.counselingText}>{counseling}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  item: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  itemText: {
    fontSize: 16,
    color: '#555',
  },
  bold: {
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    width: 200,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  counselingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#333',
  },
});

export default MedicationsScreen;