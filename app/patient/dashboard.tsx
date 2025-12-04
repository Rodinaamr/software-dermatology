import Colors from '@/constants/colors';
import { MOCK_APPOINTMENTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
    Bell,
    Calendar,
    Clock,
    CreditCard,
    FileText,
    LogOut,
    MessageSquare,
    Phone,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogoutModal from '@/components/LogoutModal';

export default function PatientDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [nextAppointment] = useState(
    MOCK_APPOINTMENTS.find(apt => apt.patientId === user?.id && apt.status === 'reserved')
  );

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

  const menuItems = [
    {
      icon: Calendar,
      title: 'Book Appointment',
      subtitle: 'Schedule your visit',
      color: Colors.primary,
      route: '/patient/book-appointment' as any,
    },
    {
      icon: FileText,
      title: 'My Reports',
      subtitle: 'View treatment history',
      color: Colors.secondary,
      route: '/patient/reports' as any,
    },
    {
      icon: CreditCard,
      title: 'My Payments',
      subtitle: 'Payment history',
      color: Colors.gold,
      route: '/patient/payments' as any,
    },
    {
      icon: MessageSquare,
      title: 'Feedback',
      subtitle: 'Share your experience',
      color: Colors.primaryLight,
      route: '/patient/feedback' as any,
    },
    {
      icon: Phone,
      title: 'Contact Us',
      subtitle: 'Get in touch',
      color: Colors.status.success,
      route: '/patient/contact' as any,
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
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Image
                source={{ uri: user?.photo }}
                style={styles.avatar}
              />
              <View>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>{user?.name}</Text>
              </View>
            </View>
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <LogOut size={24} color={Colors.white} />
            </Pressable>
          </View>

          {nextAppointment && (
            <View style={styles.notificationCard}>
              <View style={styles.notificationIcon}>
                <Bell size={20} color={Colors.primary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>Next Appointment</Text>
                <View style={styles.appointmentDetails}>
                  <Clock size={14} color={Colors.text.secondary} />
                  <Text style={styles.appointmentText}>
                    {new Date(nextAppointment.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    at {nextAppointment.time}
                  </Text>
                </View>
                <Text style={styles.appointmentSpecialty}>
                  {nextAppointment.specialty}
                </Text>
              </View>
            </View>
          )}
        </LinearGradient>

        <Animated.ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
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
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  appointmentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  appointmentText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  appointmentSpecialty: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
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
