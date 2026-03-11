/**
 * Register Screen
 * 
 * Allows users to register with:
 * - Full name
 * - Email address
 * - Face capture (facial biometric)
 * 
 * The captured face image is sent to the backend where:
 * 1. Face embedding is extracted
 * 2. Embedding is encrypted with AES-256-CBC
 * 3. Encrypted embedding is stored in Supabase PostgreSQL
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { registerUser } from '../services/api';
import FaceCamera from '../components/FaceCamera';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedUri, setCapturedUri] = useState(null);

  /**
   * Handle face image capture from camera.
   * Automatically triggers registration with the captured image.
   */
  const handleCapture = async (uri) => {
    setShowCamera(false);
    setCapturedUri(uri);
    await handleRegister(uri);
  };

  /**
   * Validate inputs and begin the face capture process.
   */
  const startCapture = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    setShowCamera(true);
  };

  /**
   * Send registration data to the backend.
   */
  const handleRegister = async (imageUri) => {
    setIsLoading(true);
    try {
      const result = await registerUser(name.trim(), email.trim(), imageUri);

      if (result.success) {
        Alert.alert(
          'Registration Successful',
          `Welcome, ${result.user.name}! Your facial biometric data has been securely encrypted and stored.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      console.error('[RegisterScreen] API Error:', error);
      const message =
        error.response?.data?.message || `Request failed: ${error.message}`;
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show camera when capturing
  if (showCamera) {
    return (
      <FaceCamera
        onCapture={handleCapture}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Register with your facial biometric data
          </Text>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🔒 How it works</Text>
          <Text style={styles.infoText}>
            Your face image is processed to generate a biometric template.
            This template is encrypted using AES-256 encryption before being
            stored in our secure database. Your actual face image is never stored.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.buttonDisabled]}
          onPress={startCapture}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#0a0a1a" />
          ) : (
            <Text style={styles.registerButtonText}>
              📸 Capture Face & Register
            </Text>
          )}
        </TouchableOpacity>

        {isLoading && (
          <Text style={styles.loadingText}>
            Processing biometric data... This may take a moment.
          </Text>
        )}

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>
            Already registered? Go to Login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00d4ff',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ccc',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  registerButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#0a0a1a',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#00d4ff',
    fontSize: 15,
    fontWeight: '500',
  },
});
