import Colors from '@/constants/colors';
import { SPECIALTIES, Specialty, TIME_SLOTS } from '@/constants/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { AlertCircle, Calendar, Check, Clock, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WalkInBookingPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const handleConfirmBooking = () => {
    if (!patientName || !patientPhone || !selectedSpecialty || !selectedTime) {
      Alert.alert('Incomplete', 'Please fill in all required fields');
      return;
    }

    Alert.alert(
      'Walk-In Booking Confirmed! ✓',
      `Patient: ${patientName}\nSpecialty: ${selectedSpecialty}\nTime: ${selectedTime}\n\nBooking has been added to today's schedule.`,
      [
        {
          text: 'View Appointments',
          onPress: () => router.push('/assistant/appointments' as any),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );

    setPatientName('');
    setPatientPhone('');
    setSelectedSpecialty(null);
    setSelectedTime(null);
    setIsEmergency(false);
    setNotes('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Walk-In Booking',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: '600' as const,
          },
        }}
      />
      <ScrollView
        style={styles.container}
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
          <UserPlus size={48} color={Colors.primary} strokeWidth={1.5} />
          <Text style={styles.heroTitle}>Walk-In Patient</Text>
          <Text style={styles.heroSubtitle}>
            Quick booking for walk-in patients
          </Text>
        </LinearGradient>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Patient Name *"
            placeholderTextColor={Colors.text.light}
            value={patientName}
            onChangeText={setPatientName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            placeholderTextColor={Colors.text.light}
            value={patientPhone}
            onChangeText={setPatientPhone}
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          
          <View style={styles.dateInfoCard}>
            <Calendar size={18} color={Colors.primary} />
            <Text style={styles.dateInfoText}>
              Today: {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          <Text style={styles.label}>Select Specialty *</Text>
          <View style={styles.specialtyGrid}>
            {SPECIALTIES.slice(0, 6).map((specialty) => (
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
                  <Check size={16} color={Colors.white} strokeWidth={3} />
                )}
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Select Time Slot *</Text>
          <View style={styles.timeGrid}>
            {TIME_SLOTS.slice(0, 8).map((time) => {
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
                    size={14}
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
                <Text style={styles.emergencyTitle}>Mark as Emergency</Text>
              </View>
              <Text style={styles.emergencyText}>
                Will be prioritized in the queue
              </Text>
            </View>
          </Pressable>

          <Text style={styles.label}>Additional Notes (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any special notes about this patient..."
            placeholderTextColor={Colors.text.light}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
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
            <Text style={styles.confirmButtonText}>Confirm Walk-In Booking</Text>
            <Check size={20} color={Colors.white} strokeWidth={2.5} />
          </LinearGradient>
        </Pressable>
      </ScrollView>
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
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 12,
  },
  dateInfoCard: {
    backgroundColor: Colors.mintLight,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  dateInfoText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text.primary,
    flex: 1,
  },
  specialtyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
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
    marginBottom: 16,
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
  textArea: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    minHeight: 100,
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
