import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sparkles, Stethoscope, User } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim1 = useRef(new Animated.Value(0.8)).current;
  const scaleAnim2 = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') {
        router.replace('/patient/dashboard');
      } else if (user.role === 'doctor') {
        router.replace('/doctor/dashboard');
      } else if (user.role === 'assistant') {
        router.replace('/assistant/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim1, {
        toValue: 1,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim2, {
        toValue: 1,
        delay: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, scaleAnim1, scaleAnim2]);

  return (
    <LinearGradient
      colors={[Colors.cream, Colors.mintLight, Colors.white]}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Sparkles size={48} color={Colors.primary} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Dr. Wahid Lotfy Clinics</Text>
        <Text style={styles.subtitle}>
          Luxury Dermatology & Aesthetic Medicine Clinic
        </Text>

        <View style={styles.buttonsContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim1 }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.patientButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/auth/patient-login')}
            >
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <User size={24} color={Colors.white} strokeWidth={2} />
                <Text style={styles.buttonText}>Login as Patient</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: scaleAnim2 }] }}>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.staffButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/auth/staff-login')}
            >
              <LinearGradient
                colors={[Colors.secondary, Colors.goldLight]}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Stethoscope size={24} color={Colors.white} strokeWidth={2} />
                <Text style={styles.buttonText}>Login as Doctor/Assistant</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        </View>

        <Text style={styles.footerText}>
          Welcome to excellence in dermatological care
        </Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 16,
  },
  button: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  patientButton: {},
  staffButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
  footerText: {
    marginTop: 48,
    fontSize: 14,
    color: Colors.text.light,
    textAlign: 'center',
    fontStyle: 'italic' as const,
  },
});
