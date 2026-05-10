/**
 * Dashboard Screen
 * 
 * Displayed after successful authentication.
 * Completely overhauled Layout: Control Center / Widget Dashboard.
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
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtnIcon} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
        }
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#000000" />
            <Text style={styles.verifiedText}>AUTHENTICATED</Text>
          </View>
          <Text style={styles.heroGreeting}>Hello, {user.name.split(' ')[0]}</Text>
          <Text style={styles.heroSub}>Identity verified via facial biometrics</Text>
        </View>

        {/* Biometric Analysis Hero Widget */}
        {comparison && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Match Diagnostics</Text>
            <View style={styles.card}>
              <View style={styles.resultHeader}>
                <Ionicons
                  name={comparison.match ? "shield-checkmark" : "warning"}
                  size={36}
                  color={comparison.match ? "#FFFFFF" : "#EF4444"}
                />
                <View style={styles.resultTextContainer}>
                  <Text style={[styles.resultMainText, !comparison.match && styles.errorText]}>
                    {comparison.match ? 'MATCH CONFIRMED' : 'MATCH FAILED'}
                  </Text>
                  <Text style={styles.resultSubText}>Based on Euclidean distance</Text>
                </View>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>DISTANCE</Text>
                  <Text style={styles.statValue}>{comparison.distance}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>THRESHOLD</Text>
                  <Text style={styles.statValue}>{comparison.threshold}</Text>
                </View>
              </View>
            </View>
            <View style={styles.tooltipBox}>
              <Ionicons name="information-circle-outline" size={14} color="#71717A" style={styles.tooltipIcon} />
              <Text style={styles.tooltipText}>
                A distance below the threshold indicates the same person. Lower distance = higher similarity.
              </Text>
            </View>
          </View>
        )}

        {/* Security Audit Log - 2x2 Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Protocol</Text>
          <View style={styles.securityGrid}>
            <View style={styles.securityWidget}>
              <Ionicons name="lock-closed" size={24} color="#FFFFFF" style={styles.widgetIcon} />
              <Text style={styles.widgetText}>AES-256 Encryption</Text>
            </View>
            <View style={styles.securityWidget}>
              <Ionicons name="eye-off" size={24} color="#FFFFFF" style={styles.widgetIcon} />
              <Text style={styles.widgetText}>No raw images stored</Text>
            </View>
            <View style={styles.securityWidget}>
              <MaterialCommunityIcons name="shield-lock-outline" size={24} color="#FFFFFF" style={styles.widgetIcon} />
              <Text style={styles.widgetText}>Env Key Storage</Text>
            </View>
            <View style={styles.securityWidget}>
              <MaterialCommunityIcons name="shield-key" size={24} color="#FFFFFF" style={styles.widgetIcon} />
              <Text style={styles.widgetText}>Randomized IVs</Text>
            </View>
          </View>
        </View>

        {/* Network Access - Horizontal Carousel */}
        <View style={styles.carouselSection}>
          <View style={[styles.sectionHeaderRow, { paddingHorizontal: 24 }]}>
            <Text style={styles.sectionTitle}>Network ({users.length})</Text>
            {apiStatus && (
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{apiStatus.status?.toUpperCase()}</Text>
              </View>
            )}
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ padding: 20 }} />
          ) : users.length === 0 ? (
            <Text style={styles.emptyText}>No users registered yet</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.usersCarousel}
            >
              {users.map((u) => (
                <View key={u.id} style={styles.userCard}>
                  <View style={styles.userInitialsBox}>
                    <Text style={styles.userInitialsText}>{u.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <Text style={styles.userName} numberOfLines={1}>{u.name}</Text>
                  <Text style={styles.userEmail} numberOfLines={1}>{u.email}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 76 : 56,
    paddingBottom: 20,
  },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#000000',
  },
  logoutBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  verifiedText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  heroGreeting: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 15,
    color: '#A1A1AA',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 36,
  },
  carouselSection: {
    marginBottom: 36,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#27272A',
    backgroundColor: '#09090B',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  resultTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  resultMainText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  resultSubText: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 2,
  },
  errorText: {
    color: '#EF4444',
  },
  tooltipBox: {
    flexDirection: 'row',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  tooltipIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  tooltipText: {
    fontSize: 12,
    color: '#71717A',
    flex: 1,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#27272A',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  securityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  securityWidget: {
    width: '47%',
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  widgetIcon: {
    alignSelf: 'flex-start',
  },
  widgetText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E4E4E7',
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#27272A',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  usersCarousel: {
    paddingLeft: 24,
    paddingRight: 8, // Less padding on right to account for card margin
  },
  userCard: {
    width: 140,
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
  },
  userInitialsBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInitialsText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  emptyText: {
    color: '#A1A1AA',
    fontSize: 13,
    paddingHorizontal: 24,
  },
});
