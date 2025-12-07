declare const window: any;

import LogoutModal from '@/components/LogoutModal';
import Colors from '@/constants/colors';
import { MOCK_APPOINTMENTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import {
  Activity,
  AlertCircle,
  Brain,
  Calendar,
  Clock,
  FileText,
  FolderOpen,
  Heart,
  LogOut,
  MessageSquare,
  Shield,
  Stethoscope,
  Thermometer,
  Users
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PubMedWidget from '../../components/PubMedWidget';

export default function DoctorDashboard() {
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
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -6,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
          }),
        ])
      ),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin),
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
          easing: Easing.linear,
        })
      ),
    ]).start();
  }, []);

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
        if (typeof window !== 'undefined') {
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

  // Create shimmer interpolation
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  // Render medical pattern manually
  const renderMedicalPattern = () => (
    <View style={styles.medicalPatternContainer}>
      {[...Array(6)].map((_, i) => (
        <View key={i} style={styles.patternSegment}>
          <View style={styles.patternNode} />
          <View style={styles.patternConnection} />
          <View style={[styles.patternNode, styles.patternNodeRight]} />
        </View>
      ))}
    </View>
  );

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
            {[...Array(12)].map((_, i) => (
              <View key={i} style={[styles.decorativeDot, { 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.03 + Math.random() * 0.07,
              }]} />
            ))}
          </View>
          
          {/* Medical Pattern */}
          <Animated.View style={[styles.patternAnimationContainer, { transform: [{ translateY: floatAnim }] }]}>
            {renderMedicalPattern()}
          </Animated.View>
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
              colors={[Colors.secondary, Colors.goldLight]}
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
                    <Image 
                      source={{ uri: user?.photo || '' }} 
                      style={styles.avatar} 
                    />
                    <View style={styles.avatarRing}>
                      <View style={styles.avatarRingInner} />
                    </View>
                    <Shield size={16} color={Colors.white} style={styles.verifiedBadge} />
                  </Animated.View>

                  <View style={styles.userDetails}>
                    <View style={styles.greetingRow}>
                      <Heart size={14} color={Colors.white} />
                      <Text style={styles.greetingText}>{getGreeting()},</Text>
                      <Activity size={14} color={Colors.white} style={styles.activityIcon} />
                    </View>

                    <View style={styles.nameContainer}>
                      <Text style={styles.userName}>Dr. Wahid Lotfy</Text>
                      <View style={styles.titleBadge}>
                        <Text style={styles.titleText}>Dermatology</Text>
                      </View>
                    </View>

                    <View style={styles.specialtyRow}>
                      <Brain size={12} color={Colors.white} />
                      <Text style={styles.specialtyMain}>& Aesthetic Medicine</Text>
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

              {/* ENHANCED STATS - KEEPING YOUR COLOR PALETTE */}
              <View style={styles.statsContainer}>
                {/* Scheduled - Circular Progress */}
                <Pressable 
                  style={styles.statItem}
                  onPress={() => router.push('/doctor/appointments?filter=scheduled')}
                >
                  <View style={styles.statCircle}>
                    <LinearGradient
                      colors={[Colors.primary, Colors.secondary]}
                      style={styles.statCircleGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Calendar size={18} color={Colors.white} />
                    </LinearGradient>
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>{todayAppointments.length}</Text>
                    <Text style={styles.statLabel}>Scheduled</Text>
                    <Text style={styles.statSub}>Today</Text>
                  </View>
                </Pressable>

                {/* Emergency - Pulsing Alert */}
                <Pressable 
                  style={styles.statItem}
                  onPress={() => router.push('/doctor/appointments?filter=emergency')}
                >
                  <Animated.View style={[
                    styles.emergencyPulse,
                    { transform: [{ scale: pulseAnim }] }
                  ]}>
                    <View style={styles.emergencyCore}>
                      <AlertCircle size={18} color={Colors.white} />
                    </View>
                    {emergencyCases > 0 && (
                      <View style={styles.emergencyAlert}>
                        <Text style={styles.emergencyAlertText}>!</Text>
                      </View>
                    )}
                  </Animated.View>
                  <View style={styles.statInfo}>
                    <Text style={[styles.statNumber, styles.emergencyNumber]}>
                      {emergencyCases}
                    </Text>
                    <Text style={[styles.statLabel, styles.emergencyLabel]}>
                      Emergency
                    </Text>
                    {emergencyCases > 0 && (
                      <Text style={styles.emergencyStatus}>Immediate</Text>
                    )}
                  </View>
                </Pressable>

                {/* Completed - Stack Visualization */}
                <Pressable 
                  style={styles.statItem}
                  onPress={() => router.push('/doctor/appointments?filter=completed')}
                >
                  <View style={styles.completedStack}>
                    {[...Array(3)].map((_, i) => (
                      <View key={i} style={[styles.stackLayer, { top: i * -4 }]} />
                    ))}
                    <View style={styles.stackIcon}>
                      <Users size={18} color={Colors.white} />
                    </View>
                  </View>
                  <View style={styles.statInfo}>
                    <Text style={styles.statNumber}>
                      {MOCK_APPOINTMENTS.filter(apt => apt.status === 'completed').length}
                    </Text>
                    <Text style={styles.statLabel}>Completed</Text>
                    <Text style={styles.statSub}>This Month</Text>
                  </View>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* TODAY'S APPOINTMENTS - ENHANCED CARDS */}
          <View style={styles.appointmentsSection}>
            <View style={styles.sectionHeader}>
              <Stethoscope size={20} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Today's Appointments</Text>
              <View style={styles.sectionCount}>
                <Text style={styles.sectionCountText}>{todayAppointments.length}</Text>
              </View>
            </View>

            {todayAppointments.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIllustration}>
                  <Calendar size={48} color={Colors.text.secondary} />
                  <Animated.View style={[
                    styles.emptyPulse,
                    { transform: [{ scale: pulseAnim }] }
                  ]} />
                </View>
                <Text style={styles.emptyText}>No appointments for today</Text>
                <Text style={styles.emptySubtext}>Your schedule is clear</Text>
              </View>
            ) : (
              todayAppointments.map(apt => (
                <Animated.View
                  key={apt.id}
                  style={[
                    styles.appointmentCard,
                    { opacity: fadeAnim }
                  ]}
                >
                  <LinearGradient
                    colors={apt.isEmergency 
                      ? [`${Colors.status.error}20`, `${Colors.status.error}10`] 
                      : [Colors.white, Colors.offWhite]
                    }
                    style={styles.appointmentGradient}
                  >
                    <View style={styles.appointmentHeader}>
                      <View style={styles.appointmentTime}>
                        <Clock size={14} color={Colors.text.secondary} />
                        <Text style={styles.timeText}>{apt.time}</Text>
                        {apt.isEmergency && (
                          <View style={styles.emergencyIndicator}>
                            <View style={styles.emergencyPulseSmall} />
                            <Thermometer size={10} color={Colors.white} />
                          </View>
                        )}
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
                  </LinearGradient>
                </Animated.View>
              ))
            )}
          </View>

          {/* QUICK ACTIONS - ENHANCED BUT KEEPING YOUR STYLE */}
          <View style={styles.quickActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/appointments')}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.primary]}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FileText size={22} color={Colors.white} />
              </LinearGradient>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>View All Appointments</Text>
                <Text style={styles.actionSubtext}>Schedule & History</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/medical-records')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.secondary]}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <FolderOpen size={22} color={Colors.white} />
              </LinearGradient>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>Medical Records</Text>
                <Text style={styles.actionSubtext}>Patient Files</Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => router.push('/doctor/patient-feedback')}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.goldLight]}
                style={styles.actionIconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MessageSquare size={22} color={Colors.white} />
              </LinearGradient>
              <View style={styles.actionTextContainer}>
                <Text style={styles.actionText}>Patient Feedback</Text>
                <Text style={styles.actionSubtext}>Reviews & Ratings</Text>
              </View>
            </Pressable>
          </View>

          <PubMedWidget />
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
  
  patternAnimationContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    opacity: 0.1,
  },
  
  medicalPatternContainer: {
    alignItems: 'center',
  },
  
  patternSegment: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  
  patternNode: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  
  patternNodeRight: {
    marginLeft: 40,
  },
  
  patternConnection: {
    position: 'absolute',
    width: 40,
    height: 2,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    left: 8,
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
    shadowColor: Colors.shadow.medium,
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
    backgroundColor: Colors.secondary,
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
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  
  userInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    flex: 1,
  },
  
  avatarContainer: {
    position: 'relative',
  },
  
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  avatarRing: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  avatarRingInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
    gap: 8,
    marginBottom: 6,
  },
  
  greetingText: { 
    fontSize: 14, 
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
  },
  
  activityIcon: {
    marginLeft: 'auto',
  },
  
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  
  userName: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: Colors.white,
  },
  
  titleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  titleText: { 
    fontSize: 11, 
    color: Colors.white, 
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  specialtyMain: { 
    fontSize: 14, 
    color: Colors.white, 
    opacity: 0.8,
    fontWeight: '400',
  },
  
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  
  logoutGradient: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  statCircleGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emergencyPulse: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${Colors.status.error}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: Colors.status.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  emergencyCore: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emergencyAlert: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.status.error,
  },
  
  emergencyAlertText: {
    color: Colors.status.error,
    fontSize: 10,
    fontWeight: '900',
  },
  
  completedStack: {
    width: 60,
    height: 60,
    marginBottom: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  stackLayer: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: `${Colors.primary}15`,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  
  stackIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  statInfo: {
    alignItems: 'center',
  },
  
  statNumber: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: Colors.white,
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  emergencyNumber: {
    color: Colors.white,
  },
  
  statLabel: { 
    fontSize: 12, 
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '600',
    marginBottom: 2,
  },
  
  emergencyLabel: {
    color: Colors.white,
  },
  
  statSub: {
    fontSize: 10,
    color: Colors.white,
    opacity: 0.7,
    fontWeight: '500',
  },
  
  emergencyStatus: {
    fontSize: 9,
    color: Colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  
  appointmentsSection: {
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
    color: Colors.text.primary,
    flex: 1,
  },
  
  sectionCount: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${Colors.primary}30`,
  },
  
  sectionCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${Colors.primary}15`,
    marginTop: 10,
    shadowColor: Colors.shadow.small,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  emptySubtext: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  
  appointmentCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  
  appointmentGradient: {
    padding: 20,
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
    color: Colors.text.primary,
  },
  
  emergencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.status.error,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  
  emergencyPulseSmall: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.status.error,
  },
  
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  
  statusTextEmergency: {
    color: Colors.status.error,
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
    color: Colors.text.primary,
    marginBottom: 4,
  },
  
  patientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  specialty: { 
    fontSize: 12, 
    color: Colors.text.secondary,
  },
  
  separator: {
    width: 1,
    height: 10,
    backgroundColor: `${Colors.text.secondary}30`,
  },
  
  appointmentType: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
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
  
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  actionTextContainer: {
    flex: 1,
  },
  
  actionText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: Colors.text.primary,
    marginBottom: 2,
  },
  
  actionSubtext: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});