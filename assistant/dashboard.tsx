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
  CreditCard,
  FileText,
  LogOut,
  PlusCircle,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_APPOINTMENTS, MOCK_PAYMENTS } from '@/constants/mockData';
import LogoutModal from '@/components/LogoutModal';

export default function AssistantDashboard() {
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

  const totalPatients = 12;
  const todayAppointments = MOCK_APPOINTMENTS.filter(
    apt => apt.status === 'reserved'
  ).length;
  const pendingPayments = MOCK_PAYMENTS.filter(
    p => p.status === 'pending'
  ).length;

  const menuItems = [
    {
      icon: Calendar,
      title: 'Manage Appointments',
      subtitle: 'View & edit schedules',
      color: Colors.primary,
      route: '/assistant/appointments' as any,
    },
    {
      icon: Users,
      title: 'Patient List',
      subtitle: 'View all patients',
      color: Colors.secondary,
      route: '/assistant/patients' as any,
    },
    {
      icon: FileText,
      title: 'Reports',
      subtitle: 'Manage reports',
      color: Colors.primaryLight,
      route: '/assistant/reports' as any,
    },
    {
      icon: CreditCard,
      title: 'Payments',
      subtitle: 'Track payments',
      color: Colors.gold,
      route: '/assistant/payments' as any,
    },
  ];

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
          colors={[Colors.primaryLight, Colors.primary]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Image source={{ uri: user?.photo }} style={styles.avatar} />
              <View>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.userName}>{user?.name}</Text>
                <Text style={styles.userRole}>Clinic Assistant</Text>
              </View>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color={Colors.white} />
            </Pressable>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Users size={20} color={Colors.primary} />
              <Text style={styles.statNumber}>{totalPatients}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statCard}>
              <Calendar size={20} color={Colors.secondary} />
              <Text style={styles.statNumber}>{todayAppointments}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statCard}>
              <CreditCard size={20} color={Colors.gold} />
              <Text style={styles.statNumber}>{pendingPayments}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>

          <Pressable
            style={styles.newBookingButton}
            onPress={() => router.push('/assistant/walk-in-booking' as any)}
          >
            <PlusCircle size={20} color={Colors.primary} />
            <Text style={styles.newBookingText}>New Walk-in Booking</Text>
          </Pressable>
        </LinearGradient>

        <Animated.ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Quick Access</Text>
          
          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => router.push(item.route)}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: `${item.color}20` }]}>
                  <item.icon size={24} color={item.color} strokeWidth={2} />
                </View>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </Pressable>
            ))}
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
    marginBottom: 20,
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
  userRole: {
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
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  newBookingButton: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newBookingText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.primary,
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
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuItem: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    lineHeight: 16,
  },
});
