/**
 * Dashboard Screen
 * 
 * Displayed after successful authentication.
 * Shows:
 * - Authenticated user information
 * - Face match distance score (for academic demonstration)
 * - List of all registered users
 * - API health status
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { getUsers, healthCheck } from '../services/api';

export default function DashboardScreen({ route, navigation }) {
  const { user, comparison } = route.params;
  const [users, setUsers] = useState([]);
  const [apiStatus, setApiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersResult, healthResult] = await Promise.all([
        getUsers(),
        healthCheck(),
      ]);
      setUsers(usersResult.users || []);
      setApiStatus(healthResult);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00d4ff" />
      }
    >
      {/* Success Header */}
      <View style={styles.successHeader}>
        <Text style={styles.checkIcon}>✅</Text>
        <Text style={styles.successTitle}>Authentication Successful</Text>
        <Text style={styles.successSubtitle}>
          Identity verified using facial biometrics
        </Text>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Authenticated User</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValueSmall}>{user.id}</Text>
        </View>
      </View>

      {/* Biometric Match Details (Academic Demo) */}
      {comparison && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔬 Biometric Match Details</Text>
          <Text style={styles.cardDescription}>
            Euclidean distance between face embeddings
          </Text>
          <View style={styles.metricRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{comparison.distance}</Text>
              <Text style={styles.metricLabel}>Distance</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{comparison.threshold}</Text>
              <Text style={styles.metricLabel}>Threshold</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricValue, styles.matchText]}>
                {comparison.match ? 'MATCH' : 'NO MATCH'}
              </Text>
              <Text style={styles.metricLabel}>Result</Text>
            </View>
          </View>
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              A distance below the threshold indicates the same person.
              Lower distance = higher similarity.
            </Text>
          </View>
        </View>
      )}

      {/* Security Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔒 Security Information</Text>
        <View style={styles.securityRow}>
          <Text style={styles.securityDot}>●</Text>
          <Text style={styles.securityText}>Biometric template encrypted with AES-256-CBC</Text>
        </View>
        <View style={styles.securityRow}>
          <Text style={styles.securityDot}>●</Text>
          <Text style={styles.securityText}>No raw face images stored in database</Text>
        </View>
        <View style={styles.securityRow}>
          <Text style={styles.securityDot}>●</Text>
          <Text style={styles.securityText}>Encryption key stored in environment variables</Text>
        </View>
        <View style={styles.securityRow}>
          <Text style={styles.securityDot}>●</Text>
          <Text style={styles.securityText}>Random IV generated for each encryption</Text>
        </View>
      </View>

      {/* Registered Users */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          👥 Registered Users ({users.length})
        </Text>
        {isLoading ? (
          <ActivityIndicator size="small" color="#00d4ff" />
        ) : users.length === 0 ? (
          <Text style={styles.emptyText}>No users registered yet</Text>
        ) : (
          users.map((u, index) => (
            <View key={u.id} style={styles.userRow}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {u.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{u.name}</Text>
                <Text style={styles.userEmail}>{u.email}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* API Status */}
      {apiStatus && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ API Status</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, styles.statusOk]}>
              {apiStatus.status?.toUpperCase()}
            </Text>
          </View>
        </View>
      )}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  checkIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#888',
  },
  card: {
    backgroundColor: '#12122a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e1e3a',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 13,
    color: '#888',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  infoValueSmall: {
    fontSize: 11,
    color: '#888',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    maxWidth: '60%',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00d4ff',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888',
  },
  matchText: {
    color: '#00ff88',
  },
  explanationBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.06)',
    borderRadius: 10,
    padding: 12,
  },
  explanationText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  securityDot: {
    color: '#00ff88',
    fontSize: 8,
    marginRight: 10,
    marginTop: 5,
  },
  securityText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e1e3a',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00d4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    color: '#0a0a1a',
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  statusOk: {
    color: '#00ff88',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoutButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '700',
  },
});
