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
import { Ionicons } from '@expo/vector-icons';
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
          <View style={styles.infoTitleRow}>
            <Ionicons name="information-circle-outline" size={18} color="#FFFFFF" style={styles.infoIcon} />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            Your face image is processed to generate a biometric template.
            This template is encrypted using AES-256 before being
            stored in our secure database. Your actual face image is never stored.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your full name"
            placeholderTextColor="#71717A"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            selectionColor="#FFFFFF"
          />

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#71717A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            selectionColor="#FFFFFF"
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.registerButton, isLoading && styles.buttonDisabled]}
          onPress={startCapture}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="camera-outline" size={20} color="#000000" />
              <Text style={styles.registerButtonText}>
                Capture Face & Register
              </Text>
            </View>
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
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>
            Already registered? <Text style={styles.backButtonHighlight}>Go to Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#A1A1AA',
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: '#09090B',
    borderRadius: 8,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    marginRight: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E4E4E7',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#09090B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingText: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  backButtonHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
