import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import AuthScreen from '../screens/AuthScreen';
import ChatsScreen from '../screens/ChatsScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import ClinicalScreen from '../screens/ClinicalScreen';
import MedicationsScreen from '../screens/MedicationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
      tabBarStyle: {
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="home" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Clinical"
      component={ClinicalScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="stethoscope" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Medications"
      component={MedicationsScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="medkit" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Chats"
      component={ChatsScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="comments" size={size} color={color} />,
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => <Icon name="user" size={size} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
