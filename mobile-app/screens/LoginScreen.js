/**
 * Login Screen
 * 
 * Authenticates users via facial recognition:
 * 1. User enters their email
 * 2. Captures face image using device camera
 * 3. Sends image to backend for verification
 * 4. Backend extracts embedding, decrypts stored embedding,
 *    compares using Euclidean distance
 * 5. Returns match/no-match result
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
} from 'react-native';
import { loginUser } from '../services/api';
import FaceCamera from '../components/FaceCamera';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Validate email and start camera capture.
   */
  const startLogin = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    setShowCamera(true);
  };

  /**
   * Handle captured image and send to backend for authentication.
   */
  const handleCapture = async (uri) => {
    setShowCamera(false);
    setIsLoading(true);

    try {
      const result = await loginUser(email.trim(), uri);

      if (result.success) {
        navigation.replace('Dashboard', {
          user: result.user,
          comparison: result.comparison,
        });
      } else {
        Alert.alert('Authentication Failed', result.message);
      }
    } catch (error) {
      console.error('[LoginScreen] API Error:', error);
      const message =
        error.response?.data?.message || `Request failed: ${error.message}`;
      
      // Show distance info if available (for academic demonstration)
      const comparison = error.response?.data?.comparison;
      if (comparison) {
        Alert.alert(
          'Authentication Failed',
          `${message}\n\nDistance: ${comparison.distance}\nThreshold: ${comparison.threshold}`
        );
      } else {
        Alert.alert('Error', message);
      }
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
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.lockIcon}>🔐</Text>
          <Text style={styles.title}>Face Login</Text>
          <Text style={styles.subtitle}>
            Authenticate using your facial biometrics
          </Text>
        </View>

        {/* Security badge */}
        <View style={styles.securityBadge}>
          <Text style={styles.badgeText}>🛡️ AES-256 Encrypted Verification</Text>
        </View>

        {/* Email Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          onPress={startLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#0a0a1a" />
              <Text style={styles.loginButtonText}>  Verifying...</Text>
            </View>
          ) : (
            <Text style={styles.loginButtonText}>📸 Scan Face to Login</Text>
          )}
        </TouchableOpacity>

        {isLoading && (
          <Text style={styles.loadingText}>
            Decrypting and comparing biometric data...
          </Text>
        )}

        {/* Register Link */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            Don't have an account? Register
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
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
    textAlign: 'center',
  },
  securityBadge: {
    backgroundColor: 'rgba(0, 255, 136, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.15)',
  },
  badgeText: {
    color: '#00ff88',
    fontSize: 13,
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: '#2a2a3e',
  },
  loginButton: {
    backgroundColor: '#00d4ff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#0a0a1a',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#888',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerLinkText: {
    color: '#00d4ff',
    fontSize: 15,
    fontWeight: '500',
  },
});
