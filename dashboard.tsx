import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Users,
  AlertCircle,
  LogOut,
  Clock,
  FileText,
  MessageSquare,
  FolderOpen,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_APPOINTMENTS } from '@/constants/mockData';
import LogoutModal from '@/components/LogoutModal';

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    setTimeout(() => {
      if (Platform.OS === 'web') {
        // @ts-ignore - window is available on web
        if (typeof window !== 'undefined') {
          // @ts-ignore
          window.location.href = '/';
        }
      } else {
        router.replace('/');
      }
    }, 50);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const today = new Date().toISOString().split('T')[0];
  
  const todayAppointments = MOCK_APPOINTMENTS.filter(
    apt => apt.date === today && apt.status === 'reserved'
  );
  
  const emergencyCases = MOCK_APPOINTMENTS.filter(
    apt => apt.isEmergency && apt.status === 'reserved'
  ).length;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LogoutModal
        visible={showLogoutModal}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[Colors.secondary, Colors.goldLight]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Image source={{ uri: user?.photo }} style={styles.avatar} />
              <View>
                <Text style={styles.welcomeText}>Good Morning,</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                {user?.specialty && (
                  <Text style={styles.userSpecialty}>{user.specialty}</Text>
                )}
              </View>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Calendar size={24} color={Colors.secondary} />
              <Text style={styles.statNumber}>{todayAppointments.length}</Text>
              <Text style={styles.statLabel}>Scheduled</Text>
            </View>
            <View style={styles.statCard}>
              <AlertCircle size={24} color={Colors.status.error} />
              <Text style={styles.statNumber}>{emergencyCases}</Text>
              <Text style={styles.statLabel}>Emergency</Text>
            </View>
            <View style={styles.statCard}>
              <Users size={24} color={Colors.primary} />
              <Text style={styles.statNumber}>
                {MOCK_APPOINTMENTS.filter(apt => apt.status === 'completed').length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </LinearGradient>

        <Animated.ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {todayAppointments.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>No appointments for today</Text>
            </View>
          ) : (
            todayAppointments.map((apt) => (
            <Pressable 
              key={apt.id} 
              style={styles.appointmentCard}
              onPress={() => router.push(`/doctor/patient-medical-history?patientId=${apt.patientId}&patientName=${encodeURIComponent(apt.patientName)}` as any)}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentTime}>
                  <Clock size={16} color={Colors.text.secondary} />
                  <Text style={styles.timeText}>{apt.time}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    apt.isEmergency && styles.emergencyBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      apt.isEmergency && styles.emergencyText,
                    ]}
                  >
                    {apt.isEmergency ? 'Emergency' : 'Regular'}
                  </Text>
                </View>
              </View>
              <Text style={styles.patientName}>{apt.patientName}</Text>
              <Text style={styles.specialty}>{apt.specialty}</Text>
              <Text style={styles.tapHint}>Tap to view patient medical history</Text>
            </Pressable>
          ))
          )}

          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/appointments' as any)}
            >
              <FileText size={24} color={Colors.secondary} />
              <Text style={styles.actionText}>View All Appointments</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/medical-records' as any)}
            >
              <FolderOpen size={24} color={Colors.primary} />
              <Text style={styles.actionText}>Medical Records</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/patient-feedback' as any)}
            >
              <MessageSquare size={24} color={Colors.secondary} />
              <Text style={styles.actionText}>Patient Feedback</Text>
            </Pressable>
          </View>
        </Animated.ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  userSpecialty: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.8,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  tapHint: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: '500' as const,
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}20`,
  },
  emergencyBadge: {
    backgroundColor: `${Colors.status.error}20`,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  emergencyText: {
    color: Colors.status.error,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  quickActions: {
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
});
