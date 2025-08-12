import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, Modal, TextInput } from 'react-native';
import { authAPI } from '../services/api';
import { User } from '../types';

const ProfileScreen = ({ navigation }: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState<Omit<User, 'id' | 'created_at'> | null>(null);
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '' });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const profile = await authAPI.profile();
        setUser(profile);
        setEditedUser(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchUser();
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

  const handleUpdateProfile = async () => {
    if (editedUser) {
      try {
        await authAPI.updateProfile(editedUser);
        setIsEditModalVisible(false);
        const profile = await authAPI.profile();
        setUser(profile);
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  const handleChangePassword = async () => {
    try {
      await authAPI.changePassword(passwords);
      setIsChangePasswordModalVisible(false);
      setPasswords({ old_password: '', new_password: '' });
      Alert.alert('Success', 'Password changed successfully.');
    } catch (error) {
      console.error('Error changing password:', error);
      Alert.alert('Error', 'Failed to change password.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{user?.username}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={() => setIsEditModalVisible(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => setIsChangePasswordModalVisible(true)}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={[styles.buttonText, styles.logoutButtonText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={editedUser?.username}
              onChangeText={(text) => setEditedUser(prev => prev ? { ...prev, username: text } : { username: text, email: '', role: '' })}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={editedUser?.email}
              onChangeText={(text) => setEditedUser(prev => prev ? { ...prev, email: text } : { username: '', email: text, role: '' })}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsEditModalVisible(false)}>
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={isChangePasswordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChangePasswordModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Old Password"
              secureTextEntry
              onChangeText={(text) => setPasswords({ ...passwords, old_password: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              onChangeText={(text) => setPasswords({ ...passwords, new_password: text })}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsChangePasswordModalVisible(false)}>
                <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileContainer: {
    padding: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  label: {
    fontWeight: 'bold',
    width: 100,
    fontSize: 16,
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  logoutButtonText: {
    color: '#fff',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  cancelButtonText: {
    color: '#fff',
  },
});

export default ProfileScreen;
