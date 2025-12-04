import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ArrowRight, Lock, Mail, Stethoscope } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StaffLoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'assistant'>('doctor');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    const success = await login(email, password);

    if (success) {
      if (selectedRole === 'doctor') {
        router.replace('/doctor/dashboard' as any);
      } else {
        router.replace('/assistant/dashboard' as any);
      }
    } else {
      Alert.alert(
        'Login Failed',
        `Invalid credentials. Try:\nDoctor: doctor@clinic.com / doctor123\nAssistant: assistant@clinic.com / assistant123`
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.cream, Colors.secondaryLight, Colors.white]}
        style={styles.container}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
            ]}
            showsVerticalScrollIndicator={false}
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
                <Stethoscope size={40} color={Colors.secondary} strokeWidth={1.5} />
              </View>

              <Text style={styles.title}>Staff Login</Text>
              <Text style={styles.subtitle}>
                Healthcare professionals entrance
              </Text>

              <View style={styles.card}>
                <View style={styles.roleSelector}>
                  <Pressable
                    style={[
                      styles.roleButton,
                      selectedRole === 'doctor' && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole('doctor')}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        selectedRole === 'doctor' && styles.roleButtonTextActive,
                      ]}
                    >
                      Doctor
                    </Text>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.roleButton,
                      selectedRole === 'assistant' && styles.roleButtonActive,
                    ]}
                    onPress={() => setSelectedRole('assistant')}
                  >
                    <Text
                      style={[
                        styles.roleButtonText,
                        selectedRole === 'assistant' && styles.roleButtonTextActive,
                      ]}
                    >
                      Assistant
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.inputContainer}>
                  <Mail size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={Colors.text.light}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.text.light}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.loginButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.secondary, Colors.goldLight]}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? 'Logging in...' : 'Login'}
                    </Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </LinearGradient>
                </Pressable>

                <View style={styles.divider} />

                <Pressable onPress={() => router.push('/auth/patient-login' as any)}>
                  <Text style={styles.linkText}>
                    Are you a patient?{' '}
                    <Text style={styles.linkBold}>Login here</Text>
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.demoText}>
                Demo Doctor: doctor@clinic.com / doctor123{'\n'}
                Demo Assistant: assistant@clinic.com / assistant123
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.white,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.light,
  },
  roleButtonTextActive: {
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 20,
  },
  linkText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  linkBold: {
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  demoText: {
    fontSize: 12,
    color: Colors.text.light,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic' as const,
    lineHeight: 18,
  },
});
