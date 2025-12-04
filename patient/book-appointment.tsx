import Colors from '@/constants/colors';
import { SPECIALTIES, Specialty, TIME_SLOTS } from '@/constants/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, Calendar, Check, Clock } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookAppointmentPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const availableDates = getNextDays(14);

  const handleConfirmBooking = () => {
    if (!selectedSpecialty || !selectedDate || !selectedTime) {
      Alert.alert('Incomplete', 'Please select specialty, date, and time');
      return;
    }

    Alert.alert(
      'Booking Confirmed! ✓',
      `Your appointment for ${selectedSpecialty} has been booked for ${new Date(
        selectedDate
      ).toLocaleDateString()} at ${selectedTime}.\n\nConfirmation sent via Email & SMS.`,
      [
        {
          text: 'View My Appointments',
          onPress: () => router.push('/patient/dashboard' as any),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Book Appointment',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }}
      />
      <Animated.ScrollView
        style={[styles.container, { opacity: fadeAnim }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[Colors.mintLight, Colors.white]}
          style={styles.heroSection}
        >
          <Calendar size={48} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.heroTitle}>Book Your Appointment</Text>
          <Text style={styles.heroSubtitle}>
            Choose your specialty and preferred time
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Specialty</Text>
          <View style={styles.specialtyGrid}>
            {SPECIALTIES.map((specialty) => (
              <Pressable
                key={specialty}
                style={[
                  styles.specialtyItem,
                  selectedSpecialty === specialty && styles.specialtyItemSelected,
                ]}
                onPress={() => setSelectedSpecialty(specialty)}
              >
                <Text
                  style={[
                    styles.specialtyText,
                    selectedSpecialty === specialty && styles.specialtyTextSelected,
                  ]}
                >
                  {specialty}
                </Text>
                {selectedSpecialty === specialty && (
                  <Check size={18} color={Colors.white} strokeWidth={3} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateScroll}
          >
            {availableDates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate === dateStr;
              return (
                <Pressable
                  key={dateStr}
                  style={[
                    styles.dateItem,
                    isSelected && styles.dateItemSelected,
                  ]}
                  onPress={() => setSelectedDate(dateStr)}
                >
                  <Text
                    style={[
                      styles.dateDay,
                      isSelected && styles.dateDaySelected,
                    ]}
                  >
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <Text
                    style={[
                      styles.dateNumber,
                      isSelected && styles.dateNumberSelected,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  <Text
                    style={[
                      styles.dateMonth,
                      isSelected && styles.dateMonthSelected,
                    ]}
                  >
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeItem,
                    isSelected && styles.timeItemSelected,
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Clock
                    size={16}
                    color={isSelected ? Colors.white : Colors.primary}
                  />
                  <Text
                    style={[
                      styles.timeText,
                      isSelected && styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Pressable
            style={styles.emergencyToggle}
            onPress={() => setIsEmergency(!isEmergency)}
          >
            <View style={[styles.checkbox, isEmergency && styles.checkboxChecked]}>
              {isEmergency && <Check size={16} color={Colors.white} strokeWidth={3} />}
            </View>
            <View style={styles.emergencyContent}>
              <View style={styles.emergencyHeader}>
                <AlertCircle size={18} color={Colors.status.error} />
                <Text style={styles.emergencyTitle}>Is this an emergency?</Text>
              </View>
              <Text style={styles.emergencyText}>
                We&apos;ll prioritize your appointment
              </Text>
            </View>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.confirmButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleConfirmBooking}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            <Check size={20} color={Colors.white} strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  scrollContent: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specialtyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  specialtyItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  specialtyTextSelected: {
    color: Colors.white,
  },
  dateScroll: {
    gap: 12,
    paddingRight: 20,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.border.light,
    minWidth: 70,
  },
  dateItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dateDay: {
    fontSize: 12,
    color: Colors.text.light,
    marginBottom: 4,
  },
  dateDaySelected: {
    color: Colors.white,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  dateNumberSelected: {
    color: Colors.white,
  },
  dateMonth: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  dateMonthSelected: {
    color: Colors.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.border.light,
  },
  timeItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
  },
  timeTextSelected: {
    color: Colors.white,
  },
  emergencyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.status.error,
    borderColor: Colors.status.error,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  emergencyText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: Colors.primary,
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
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    letterSpacing: 0.5,
  },
});
