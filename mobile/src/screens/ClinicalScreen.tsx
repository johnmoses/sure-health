import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
} from 'react-native';
import { clinicalAPI } from '../services/api';
import { Observation, Encounter, Appointment } from '../types';

const ClinicalScreen = () => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAppointmentModalVisible, setIsAppointmentModalVisible] = useState(false);
  const [isObservationModalVisible, setIsObservationModalVisible] = useState(false);
  const [isEncounterModalVisible, setIsEncounterModalVisible] = useState(false);
  const [newAppointment, setNewAppointment] = useState<Omit<Appointment, 'id'> | null>(null);
  const [newObservation, setNewObservation] = useState<Omit<Observation, 'id'> | null>(null);
  const [newEncounter, setNewEncounter] = useState<Omit<Encounter, 'id'> | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedObservation, setSelectedObservation] = useState<Observation | null>(null);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [obs, enc, apps] = await Promise.all([
        clinicalAPI.getObservations(),
        clinicalAPI.getEncounters(),
        clinicalAPI.getAppointments(),
      ]);
      setObservations(obs);
      setEncounters(enc);
      setAppointments(apps);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddAppointment = async () => {
    if (newAppointment) {
      try {
        await clinicalAPI.createAppointment(newAppointment);
        setIsAppointmentModalVisible(false);
        setNewAppointment(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateAppointment = async () => {
    if (selectedAppointment) {
      try {
        await clinicalAPI.updateAppointment(selectedAppointment.id, selectedAppointment);
        setIsAppointmentModalVisible(false);
        setSelectedAppointment(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteAppointment = (id: number) => {
    Alert.alert('Delete Appointment', 'Are you sure you want to delete this appointment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await clinicalAPI.deleteAppointment(id);
            fetchData(); // Refresh data
          } catch (error) {
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleAddObservation = async () => {
    if (newObservation) {
      try {
        await clinicalAPI.createObservation(newObservation);
        setIsObservationModalVisible(false);
        setNewObservation(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateObservation = async () => {
    if (selectedObservation) {
      try {
        await clinicalAPI.updateObservation(selectedObservation.id, selectedObservation);
        setIsObservationModalVisible(false);
        setSelectedObservation(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteObservation = (id: number) => {
    Alert.alert('Delete Observation', 'Are you sure you want to delete this observation?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await clinicalAPI.deleteObservation(id);
            fetchData(); // Refresh data
          } catch (error) {
            console.error(error);
          }
        },
      },
    ]);
  };

  const handleAddEncounter = async () => {
    if (newEncounter) {
      try {
        await clinicalAPI.createEncounter(newEncounter);
        setIsEncounterModalVisible(false);
        setNewEncounter(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleUpdateEncounter = async () => {
    if (selectedEncounter) {
      try {
        await clinicalAPI.updateEncounter(selectedEncounter.id, selectedEncounter);
        setIsEncounterModalVisible(false);
        setSelectedEncounter(null);
        fetchData(); // Refresh data
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleDeleteEncounter = (id: number) => {
    Alert.alert('Delete Encounter', 'Are you sure you want to delete this encounter?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await clinicalAPI.deleteEncounter(id);
            fetchData(); // Refresh data
          } catch (error) {
            console.error(error);
          }
        },
      },
    ]);
  };

  const renderObservation = ({ item }: { item: Observation }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Code:</Text> {item.code_text}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Value:</Text> {item.value_quantity} {item.value_quantity_unit}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Date:</Text>{' '}
        {new Date(item.effective_datetime).toLocaleDateString()}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => {
            setSelectedObservation(item);
            setIsObservationModalVisible(true);
          }}
        />
        <Button title="Delete" onPress={() => handleDeleteObservation(item.id)} color="red" />
      </View>
    </View>
  );

  const renderEncounter = ({ item }: { item: Encounter }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Class:</Text> {item.class_code}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Type:</Text> {item.type_text}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => {
            setSelectedEncounter(item);
            setIsEncounterModalVisible(true);
          }}
        />
        <Button title="Delete" onPress={() => handleDeleteEncounter(item.id)} color="red" />
      </View>
    </View>
  );

  const renderAppointment = ({ item }: { item: Appointment }) => (
    <View style={styles.item}>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Date:</Text>{' '}
        {new Date(item.appointment_datetime).toLocaleString()}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Practitioner:</Text> {item.practitioner}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Reason:</Text> {item.reason}
      </Text>
      <Text style={styles.itemText}>
        <Text style={styles.bold}>Status:</Text> {item.status}
      </Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Edit"
          onPress={() => {
            setSelectedAppointment(item);
            setIsAppointmentModalVisible(true);
          }}
        />
        <Button title="Delete" onPress={() => handleDeleteAppointment(item.id)} color="red" />
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
      {/* Appointment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isAppointmentModalVisible}
        onRequestClose={() => {
          setIsAppointmentModalVisible(!isAppointmentModalVisible);
          setSelectedAppointment(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </Text>
            <TextInput
              placeholder="Patient ID"
              style={styles.input}
              defaultValue={selectedAppointment?.patient_id.toString()}
              onChangeText={text =>
                selectedAppointment
                  ? setSelectedAppointment({ ...selectedAppointment, patient_id: parseInt(text) })
                  : setNewAppointment(prev => ({ ...prev!, patient_id: parseInt(text) }))
              }
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Practitioner"
              style={styles.input}
              defaultValue={selectedAppointment?.practitioner}
              onChangeText={text =>
                selectedAppointment
                  ? setSelectedAppointment({ ...selectedAppointment, practitioner: text })
                  : setNewAppointment(prev => ({ ...prev!, practitioner: text }))
              }
            />
            <TextInput
              placeholder="Reason"
              style={styles.input}
              defaultValue={selectedAppointment?.reason}
              onChangeText={text =>
                selectedAppointment
                  ? setSelectedAppointment({ ...selectedAppointment, reason: text })
                  : setNewAppointment(prev => ({ ...prev!, reason: text }))
              }
            />
            <TextInput
              placeholder="Status"
              style={styles.input}
              defaultValue={selectedAppointment?.status}
              onChangeText={text =>
                selectedAppointment
                  ? setSelectedAppointment({ ...selectedAppointment, status: text })
                  : setNewAppointment(prev => ({ ...prev!, status: text }))
              }
            />
            <TextInput
              placeholder="Date (YYYY-MM-DDTHH:MM:SS)"
              style={styles.input}
              defaultValue={selectedAppointment?.appointment_datetime}
              onChangeText={text =>
                selectedAppointment
                  ? setSelectedAppointment({ ...selectedAppointment, appointment_datetime: text })
                  : setNewAppointment(prev => ({ ...prev!, appointment_datetime: text }))
              }
            />
            <View style={styles.buttonContainer}>
              <Button
                title={selectedAppointment ? 'Update' : 'Add'}
                onPress={selectedAppointment ? handleUpdateAppointment : handleAddAppointment}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setIsAppointmentModalVisible(false);
                  setSelectedAppointment(null);
                }}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Observation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isObservationModalVisible}
        onRequestClose={() => {
          setIsObservationModalVisible(!isObservationModalVisible);
          setSelectedObservation(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {selectedObservation ? 'Edit Observation' : 'New Observation'}
            </Text>
            <TextInput
              placeholder="Patient ID"
              style={styles.input}
              defaultValue={selectedObservation?.patient_id.toString()}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({ ...selectedObservation, patient_id: parseInt(text) })
                  : setNewObservation(prev => ({ ...prev!, patient_id: parseInt(text) }))
              }
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Status"
              style={styles.input}
              defaultValue={selectedObservation?.status}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({ ...selectedObservation, status: text })
                  : setNewObservation({ ...newObservation!, status: text })
              }
            />
            <TextInput
              placeholder="Code Text"
              style={styles.input}
              defaultValue={selectedObservation?.code_text}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({ ...selectedObservation, code_text: text })
                  : setNewObservation({ ...newObservation!, code_text: text })
              }
            />
            <TextInput
              placeholder="Effective Date (YYYY-MM-DDTHH:MM:SS)"
              style={styles.input}
              defaultValue={selectedObservation?.effective_datetime}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({ ...selectedObservation, effective_datetime: text })
                  : setNewObservation(prev => ({ ...prev!, effective_datetime: text }))
              }
            />
            <TextInput
              placeholder="Value"
              style={styles.input}
              defaultValue={selectedObservation?.value_quantity.toString()}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({
                      ...selectedObservation,
                      value_quantity: parseFloat(text),
                    })
                  : setNewObservation({ ...newObservation!, value_quantity: parseFloat(text) })
              }
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Unit"
              style={styles.input}
              defaultValue={selectedObservation?.value_quantity_unit}
              onChangeText={text =>
                selectedObservation
                  ? setSelectedObservation({ ...selectedObservation, value_quantity_unit: text })
                  : setNewObservation({ ...newObservation!, value_quantity_unit: text })
              }
            />
            <View style={styles.buttonContainer}>
              <Button
                title={selectedObservation ? 'Update' : 'Add'}
                onPress={selectedObservation ? handleUpdateObservation : handleAddObservation}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setIsObservationModalVisible(false);
                  setSelectedObservation(null);
                }}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Encounter Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEncounterModalVisible}
        onRequestClose={() => {
          setIsEncounterModalVisible(!isEncounterModalVisible);
          setSelectedEncounter(null);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              {selectedEncounter ? 'Edit Encounter' : 'New Encounter'}
            </Text>
            <TextInput
              placeholder="Patient ID"
              style={styles.input}
              defaultValue={selectedEncounter?.patient_id.toString()}
              onChangeText={text =>
                selectedEncounter
                  ? setSelectedEncounter({ ...selectedEncounter, patient_id: parseInt(text) })
                  : setNewEncounter(prev => ({ ...prev!, patient_id: parseInt(text) }))
              }
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Status"
              style={styles.input}
              defaultValue={selectedEncounter?.status}
              onChangeText={text =>
                selectedEncounter
                  ? setSelectedEncounter({ ...selectedEncounter, status: text })
                  : setNewEncounter({ ...newEncounter!, status: text })
              }
            />
            <TextInput
              placeholder="Class Code"
              style={styles.input}
              defaultValue={selectedEncounter?.class_code}
              onChangeText={text =>
                selectedEncounter
                  ? setSelectedEncounter({ ...selectedEncounter, class_code: text })
                  : setNewEncounter({ ...newEncounter!, class_code: text })
              }
            />
            <TextInput
              placeholder="Type Text"
              style={styles.input}
              defaultValue={selectedEncounter?.type_text}
              onChangeText={text =>
                selectedEncounter
                  ? setSelectedEncounter({ ...selectedEncounter, type_text: text })
                  : setNewEncounter(prev => ({ ...prev!, type_text: text }))
              }
            />
            <View style={styles.buttonContainer}>
              <Button
                title={selectedEncounter ? 'Update' : 'Add'}
                onPress={selectedEncounter ? handleUpdateEncounter : handleAddEncounter}
              />
              <Button
                title="Cancel"
                onPress={() => {
                  setIsEncounterModalVisible(false);
                  setSelectedEncounter(null);
                }}
                color="red"
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Observations</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsObservationModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={observations}
        renderItem={renderObservation}
        keyExtractor={item => item.id.toString()}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Encounters</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsEncounterModalVisible(true)}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={encounters}
        renderItem={renderEncounter}
        keyExtractor={item => item.id.toString()}
      />
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Appointments</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAppointmentModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={appointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.id.toString()}
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
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
});

export default ClinicalScreen;
