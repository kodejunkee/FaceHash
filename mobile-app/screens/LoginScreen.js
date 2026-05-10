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
import { Ionicons } from '@expo/vector-icons';
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
          <Ionicons name="scan-outline" size={48} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.title}>FaceHash Auth</Text>
          <Text style={styles.subtitle}>
            Authenticate using your facial biometrics
          </Text>
        </View>

        {/* Security badge */}
        <View style={styles.securityBadge}>
          <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
          <Text style={styles.badgeText}>AES-256 Encrypted Verification</Text>
        </View>

        {/* Email Input */}
        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your registered email"
            placeholderTextColor="#71717A"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            selectionColor="#FFFFFF"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.buttonDisabled]}
          onPress={startLogin}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={styles.loginButtonText}>  Verifying...</Text>
            </View>
          ) : (
            <View style={styles.btnRow}>
              <Ionicons name="camera-outline" size={20} color="#000000" />
              <Text style={styles.loginButtonText}>Scan Face to Login</Text>
            </View>
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
          activeOpacity={0.7}
        >
          <Text style={styles.registerLinkText}>
            Don't have an account? <Text style={styles.registerLinkHighlight}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  icon: {
    marginBottom: 16,
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
    textAlign: 'center',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  badgeText: {
    color: '#E4E4E7',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
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
    borderWidth: 1,
    borderColor: '#27272A',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#71717A',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  registerLinkText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  registerLinkHighlight: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
