import LogoutModal from '@/components/LogoutModal';
import Colors from '@/constants/colors';
import { MOCK_APPOINTMENTS, MOCK_PAYMENTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  LogOut,
  Shield,
  Sparkles,
  UserPlus,
  Users
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Declare window for web
declare const window: any;

// Add missing green color if it doesn't exist
const GREEN_COLOR = '#34C759'; // iOS green color

export default function AssistantDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, []);

  // Create shimmer interpolation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();

    setTimeout(() => {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.location) {
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

  // Stats calculation for the icons only
  const todayAppointments = MOCK_APPOINTMENTS.filter(
    apt => apt.status === 'reserved'
  ).length;
  const completedThisMonth = MOCK_APPOINTMENTS.filter(
    apt => apt.status === 'completed' && new Date(apt.date).getMonth() === new Date().getMonth()
  ).length;
  const emergencyAppointments = MOCK_APPOINTMENTS.filter(
    apt => apt.isEmergency && apt.status === 'reserved'
  ).length;
  const totalPatients = 12; // From your second image

  // REMOVED "Aesthetic Medicine" - Added "Total Patients" instead
  const statsData = [
    {
      id: 'patients',
      title: 'Total Patients',
      value: String(totalPatients),
      icon: Users, // Users icon for patients
      color: Colors.white,
      bgColor: Colors.secondary, // Using secondary color for patients
      route: '/assistant/patients',
    },
    {
      id: 'scheduled',
      title: 'Scheduled Today',
      value: String(todayAppointments),
      icon: Calendar,
      color: Colors.white,
      bgColor: Colors.primary,
      route: '/assistant/appointments',
    },
    {
      id: 'emergency',
      title: 'Emergency',
      value: String(emergencyAppointments),
      icon: AlertTriangle,
      color: Colors.white,
      bgColor: Colors.status?.error || '#FF3B30',
      route: '/assistant/appointments?type=emergency',
    },
    {
      id: 'completed',
      title: 'Completed This Month',
      value: String(completedThisMonth),
      icon: CheckCircle,
      color: Colors.white,
      bgColor: GREEN_COLOR, // Using the defined green color
      route: '/assistant/appointments?status=completed',
    },
  ];

  const quickActions = [
    {
      id: 'walk-in',
      title: 'Walk-in Booking',
      subtitle: 'Register new patient',
      icon: UserPlus,
      color: Colors.primary,
      route: '/assistant/walk-in-booking',
    },
    {
      id: 'appointments',
      title: 'Manage Schedule',
      subtitle: 'View & edit appointments',
      icon: Calendar,
      color: Colors.secondary,
      route: '/assistant/appointments',
    },
    {
      id: 'reports',
      title: 'Generate Reports',
      subtitle: 'Create daily reports',
      icon: FileText,
      color: Colors.primaryLight,
      route: '/assistant/reports',
    },
    {
      id: 'payments',
      title: 'Payment Tracking',
      subtitle: 'Process & track payments',
      icon: DollarSign,
      color: Colors.gold,
      route: '/assistant/payments',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'appointment',
      title: 'Sarah Johnson checked in',
      time: '10:30 AM',
      status: 'completed',
    },
    {
      id: '2',
      type: 'payment',
      title: 'Payment received from Michael Chen',
      time: '9:45 AM',
      status: 'success',
    },
    {
      id: '3',
      type: 'booking',
      title: 'New walk-in registration',
      time: '9:15 AM',
      status: 'pending',
    },
    {
      id: '4',
      type: 'appointment',
      title: 'Emma Wilson rescheduled',
      time: 'Yesterday',
      status: 'warning',
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
        {/* BACKGROUND LAYER */}
        <View style={styles.backgroundLayer}>
          <View style={styles.decorativePattern}>
            {[...Array(8)].map((_, i) => (
              <View key={i} style={[styles.decorativeDot, { 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.03 + Math.random() * 0.07,
              }]} />
            ))}
          </View>
        </View>

        {/* MAIN CONTENT */}
        <Animated.ScrollView
          style={[styles.content, { opacity: fadeAnim }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ENHANCED HEADER SECTION */}
          <Animated.View 
            style={[
              styles.floatingHeader,
              { transform: [{ translateY: floatAnim }] }
            ]}
          >
            {/* Glow effect behind header */}
            <View style={styles.headerGlow} />
            
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerContent}
            >
              {/* Shimmer effect */}
              <Animated.View style={[
                styles.shimmer,
                { transform: [{ translateX: shimmerTranslate }] }
              ]} />

              <View style={styles.headerTop}>
                <View style={styles.userInfo}>
                  {/* Animated Avatar */}
                  <Animated.View style={[
                    styles.avatarContainer,
                    { transform: [{ scale: pulseAnim }] }
                  ]}>
                    <Image source={{ uri: user?.photo }} style={styles.avatar} />
                    <View style={styles.avatarRing}>
                      <View style={styles.avatarRingInner} />
                    </View>
                    <Shield size={16} color={Colors.white} style={styles.verifiedBadge} />
                  </Animated.View>

                  <View style={styles.userDetails}>
                    <View style={styles.greetingRow}>
                      <Activity size={14} color={Colors.white} />
                      <Text style={styles.greetingText}>{getGreeting()},</Text>
                    </View>

                    <View style={styles.nameContainer}>
                      <Text style={styles.userName}>{user?.name}</Text>
                      <View style={styles.titleBadge}>
                        <Text style={styles.titleText}>Clinic Assistant</Text>
                      </View>
                    </View>

                    <View style={styles.specialtyRow}>
                      <Text style={styles.specialtyMain}>Dr. Wahid Lotfy Clinic</Text>
                    </View>
                  </View>
                </View>

                <Pressable onPress={handleLogout} style={styles.logoutButton}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                    style={styles.logoutGradient}
                  >
                    <LogOut size={20} color={Colors.white} />
                  </LinearGradient>
                </Pressable>
              </View>

              {/* ICONS ONLY - NO WHITE BACKGROUND */}
              <View style={styles.iconsRow}>
                {statsData.map((stat, index) => (
                  <Pressable
                    key={stat.id}
                    onPress={() => router.push(stat.route as any)}
                    style={styles.iconContainer}
                  >
                    <Animated.View 
                      style={[
                        styles.iconWrapper,
                        { 
                          backgroundColor: stat.bgColor,
                          transform: [{ translateY: floatAnim }] 
                        }
                      ]}
                    >
                      <stat.icon size={24} color={stat.color} />
                    </Animated.View>
                    <View style={styles.iconTextContainer}>
                      <Text style={styles.iconValue}>{stat.value}</Text>
                      <Text style={styles.iconLabel}>{stat.title}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          </Animated.View>

          {/* QUICK ACTIONS SECTION */}
          <View style={styles.quickActionsSection}>
            <View style={styles.sectionHeader}>
              <Sparkles size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>

            <View style={styles.actionsGrid}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route as any)}
                >
                  <LinearGradient
                    colors={[action.color, `${action.color}DD`]}
                    style={styles.actionIconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <action.icon size={22} color={Colors.white} />
                  </LinearGradient>
                  <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionDescription}>{action.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* RECENT ACTIVITIES SECTION */}
          <View style={styles.activitiesSection}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Recent Activities</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{recentActivities.length}</Text>
              </View>
            </View>

            <View style={styles.activitiesList}>
              {recentActivities.map((activity) => (
                <Animated.View
                  key={activity.id}
                  style={[
                    styles.activityCard,
                    { opacity: fadeAnim }
                  ]}
                >
                  <View style={styles.activityContent}>
                    <View style={[
                      styles.activityIcon,
                      activity.status === 'completed' && styles.activityIconCompleted,
                      activity.status === 'success' && styles.activityIconSuccess,
                      activity.status === 'pending' && styles.activityIconPending,
                      activity.status === 'warning' && styles.activityIconWarning,
                    ]}>
                      {activity.type === 'appointment' ? (
                        <Calendar size={14} color={Colors.white} />
                      ) : activity.type === 'payment' ? (
                        <DollarSign size={14} color={Colors.white} />
                      ) : (
                        <UserPlus size={14} color={Colors.white} />
                      )}
                    </View>
                    <View style={styles.activityDetails}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                    {activity.status === 'pending' && (
                      <View style={styles.pendingBadge}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* TODAY'S APPOINTMENTS SECTION */}
          <View style={styles.appointmentsSection}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Today's Schedule</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{todayAppointments}</Text>
              </View>
            </View>

            {todayAppointments === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIllustration}>
                  <Calendar size={48} color={Colors.text.secondary} />
                  <Animated.View style={[
                    styles.emptyPulse,
                    { transform: [{ scale: pulseAnim }] }
                  ]} />
                </View>
                <Text style={styles.emptyText}>No appointments scheduled</Text>
                <Text style={styles.emptySubtext}>Schedule is clear for today</Text>
              </View>
            ) : (
              MOCK_APPOINTMENTS.filter(apt => apt.status === 'reserved').slice(0, 3).map((apt) => (
                <Animated.View
                  key={apt.id}
                  style={[
                    styles.appointmentCard,
                    { opacity: fadeAnim }
                  ]}
                >
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentTime}>
                      <Clock size={14} color={Colors.text.secondary} />
                      <Text style={styles.timeText}>{apt.time}</Text>
                    </View>

                    <View style={styles.patientStatus}>
                      <View style={[
                        styles.statusDot,
                        apt.isEmergency && styles.statusDotEmergency
                      ]} />
                      <Text style={[
                        styles.statusText,
                        apt.isEmergency && styles.statusTextEmergency
                      ]}>
                        {apt.isEmergency ? 'EMERGENCY' : 'REGULAR'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.patientInfo}>
                    <View style={styles.patientAvatarPlaceholder}>
                      <Text style={styles.patientInitial}>
                        {apt.patientName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.patientDetails}>
                      <Text style={styles.patientName}>{apt.patientName}</Text>
                      <View style={styles.patientMeta}>
                        <Text style={styles.specialty}>{apt.specialty}</Text>
                        <View style={styles.separator} />
                        <Text style={styles.appointmentType}>Consultation</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))
            )}
          </View>

          {/* PENDING PAYMENTS SECTION */}
          {MOCK_PAYMENTS.filter(p => p.status === 'pending').length > 0 && (
            <View style={styles.paymentsSection}>
              <View style={styles.sectionHeader}>
                <AlertCircle size={20} color={Colors.status?.error || '#FF3B30'} />
                <Text style={[styles.sectionTitle, styles.pendingTitle]}>
                  Pending Payments
                </Text>
                <View style={[styles.sectionCount, styles.pendingCount]}>
                  <Text style={styles.sectionCountText}>{MOCK_PAYMENTS.filter(p => p.status === 'pending').length}</Text>
                </View>
              </View>

              <Animated.View style={[
                styles.pendingAlert,
                { transform: [{ scale: pulseAnim }] }
              ]}>
                <View style={styles.pendingAlertContent}>
                  <DollarSign size={24} color={Colors.white} />
                  <View style={styles.pendingAlertText}>
                    <Text style={styles.pendingAlertTitle}>
                      {MOCK_PAYMENTS.filter(p => p.status === 'pending').length} payments pending
                    </Text>
                    <Text style={styles.pendingAlertSubtitle}>
                      Total: $1,500 • Requires attention
                    </Text>
                  </View>
                  <Pressable 
                    style={styles.resolveButton}
                    onPress={() => router.push('/assistant/payments' as any)}
                  >
                    <Text style={styles.resolveButtonText}>Resolve</Text>
                  </Pressable>
                </View>
              </Animated.View>
            </View>
          )}
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
  
  backgroundLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.offWhite,
  },
  
  decorativePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  decorativeDot: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    opacity: 0.05,
  },
  
  content: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  
  floatingHeader: {
    marginBottom: 30,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: Colors.shadow?.medium || '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  
  headerGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    right: -50,
    height: 150,
    backgroundColor: Colors.primary,
    opacity: 0.1,
    borderRadius: 75,
  },
  
  headerContent: {
    padding: 24,
    borderRadius: 28,
    position: 'relative',
    overflow: 'hidden',
  },
  
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ skewX: '-20deg' }],
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
    gap: 12 
  },
  
  avatarContainer: {
    position: 'relative',
  },
  
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  
  avatarRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.secondary,
    borderRadius: 9,
    padding: 2,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  
  userDetails: {
    flex: 1,
  },
  
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  
  greetingText: { 
    fontSize: 14, 
    color: Colors.white, 
    opacity: 0.9,
    fontWeight: '500',
  },
  
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 2,
  },
  
  userName: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: Colors.white 
  },
  
  titleBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  
  titleText: { 
    fontSize: 11, 
    color: Colors.white, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  specialtyRow: {
    marginTop: 2,
  },
  
  specialtyMain: { 
    fontSize: 12, 
    color: Colors.white, 
    opacity: 0.8 
  },
  
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  logoutGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // ICONS ONLY - NO WHITE BACKGROUND
  iconsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  iconContainer: {
    alignItems: 'center',
    flex: 1,
  },
  
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  iconTextContainer: {
    alignItems: 'center',
  },
  
  iconValue: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: Colors.white,
    marginBottom: 2,
  },
  
  iconLabel: { 
    fontSize: 10, 
    color: Colors.white, 
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // Quick Actions
  quickActionsSection: {
    marginBottom: 30,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    flex: 1,
  },
  
  pendingTitle: {
    color: Colors.status?.error || '#FF3B30',
  },
  
  sectionCount: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  
  pendingCount: {
    backgroundColor: `${Colors.status?.error || '#FF3B30'}15`,
    borderColor: `${Colors.status?.error || '#FF3B30'}30`,
  },
  
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  
  actionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  actionTextContainer: {
    flex: 1,
  },
  
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  
  actionDescription: {
    fontSize: 11,
    color: Colors.text?.secondary || '#666',
    lineHeight: 14,
  },
  
  // Activities
  activitiesSection: {
    marginBottom: 30,
  },
  
  activitiesList: {
    gap: 12,
  },
  
  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  activityIconCompleted: {
    backgroundColor: Colors.primary,
  },
  
  activityIconSuccess: {
    backgroundColor: Colors.secondary,
  },
  
  activityIconPending: {
    backgroundColor: Colors.gold,
  },
  
  activityIconWarning: {
    backgroundColor: Colors.status?.error || '#FF3B30',
  },
  
  activityDetails: {
    flex: 1,
  },
  
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  
  activityTime: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  
  pendingBadge: {
    backgroundColor: `${Colors.gold}15`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: `${Colors.gold}30`,
  },
  
  pendingBadgeText: {
    fontSize: 10,
    color: Colors.gold,
    fontWeight: '700',
  },
  
  // Appointments
  appointmentsSection: {
    marginBottom: 30,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
    marginTop: 10,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  emptyIllustration: {
    position: 'relative',
    marginBottom: 16,
  },
  
  emptyPulse: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: `${Colors.primary}15`,
  },
  
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  
  emptySubtext: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  
  appointmentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  appointmentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  timeText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: Colors.text?.secondary || '#666' 
  },
  
  patientStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  
  statusDotEmergency: {
    backgroundColor: Colors.status?.error || '#FF3B30',
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  
  statusTextEmergency: {
    color: Colors.status?.error || '#FF3B30',
  },
  
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  patientAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  patientInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  
  patientDetails: {
    flex: 1,
  },
  
  patientName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  specialty: { 
    fontSize: 12, 
    color: Colors.text?.secondary || '#666',
  },
  
  separator: {
    width: 1,
    height: 10,
    backgroundColor: `${Colors.text?.secondary || '#666'}30`,
  },
  
  appointmentType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  
  // Payments Section
  paymentsSection: {
    marginBottom: 30,
  },
  
  pendingAlert: {
    backgroundColor: Colors.status?.error || '#FF3B30',
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.status?.error || '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  pendingAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  
  pendingAlertText: {
    flex: 1,
  },
  
  pendingAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  
  pendingAlertSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  
  resolveButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.status?.error || '#FF3B30',
  },
});