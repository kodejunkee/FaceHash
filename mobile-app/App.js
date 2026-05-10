/**
 * App.js — Main Application Entry Point
 * 
 * Sets up React Navigation with three screens:
 * 1. Login — Default screen for face authentication
 * 2. Register — New user registration with biometrics
 * 3. Dashboard — Post-authentication screen
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#000000',
          },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false,
            headerLeft: () => null, // Prevent back navigation
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
