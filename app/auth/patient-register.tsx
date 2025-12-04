import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react-native';
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

export default function PatientRegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>(''); // ✅

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword || !age || !gender) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (isNaN(Number(age)) || Number(age) < 1) {
      Alert.alert('Error', 'Please enter a valid age');
      return;
    }

    const success = await register(name, email, password, phone, age, gender);

    if (success) {
      router.replace('/patient/dashboard' as any);
    } else {
      Alert.alert('Registration Failed', 'Please try again');
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[Colors.cream, Colors.mintLight, Colors.white]}
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
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              <View style={styles.iconContainer}>
                <User size={40} color={Colors.primary} strokeWidth={1.5} />
              </View>

              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join us for premium dermatological care</Text>

              <View style={styles.card}>
                {/* Name */}
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.text.light}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Email */}
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
                  />
                </View>

                {/* Phone */}
                <View style={styles.inputContainer}>
                  <Phone size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Phone Number"
                    placeholderTextColor={Colors.text.light}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                {/* Age */}
                <View style={styles.inputContainer}>
                  <User size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Age"
                    placeholderTextColor={Colors.text.light}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>

                {/* ✅ Gender Buttons */}
                <Text style={styles.genderLabel}>Select Gender</Text>

                <View style={styles.genderRow}>
                  <Pressable
                    onPress={() => setGender("male")}
                    style={[
                      styles.genderButton,
                      gender === "male" && styles.genderButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === "male" && styles.genderTextSelected,
                      ]}
                    >
                      Male
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setGender("female")}
                    style={[
                      styles.genderButton,
                      gender === "female" && styles.genderButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.genderText,
                        gender === "female" && styles.genderTextSelected,
                      ]}
                    >
                      Female
                    </Text>
                  </Pressable>
                </View>

                {/* Password */}
                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor={Colors.text.light}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>

                {/* Confirm Password */}
                <View style={styles.inputContainer}>
                  <Lock size={20} color={Colors.text.secondary} />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={Colors.text.light}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                </View>

                {/* Register Button */}
                <Pressable
                  style={({ pressed }) => [
                    styles.registerButton,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleRegister}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.registerButtonText}>
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                    <ArrowRight size={20} color={Colors.white} />
                  </LinearGradient>
                </Pressable>

                <View style={styles.divider} />

                <Pressable onPress={() => router.back()}>
                  <Text style={styles.linkText}>
                    Already have an account? <Text style={styles.linkBold}>Login</Text>
                  </Text>
                </Pressable>

              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 16,
  },
  input: { flex: 1, marginLeft: 12, fontSize: 16 },

  // ✅ Gender Styles
  genderLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 10,
    marginLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    backgroundColor: Colors.offWhite,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  genderButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  genderText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
  genderTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },

  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.9 },
  buttonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 20,
  },
  linkText: { textAlign: 'center' },
  linkBold: { fontWeight: '600' },
});
