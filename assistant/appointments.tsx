import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MOCK_APPOINTMENTS } from '@/constants/mockData';

export default function AssistantAppointmentsPage() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Manage Appointments',
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        {MOCK_APPOINTMENTS.map((apt) => (
          <View key={apt.id} style={styles.appointmentCard}>
            <View style={styles.header}>
              <Calendar size={18} color={Colors.primary} />
              <Text style={styles.date}>
                {new Date(apt.date).toLocaleDateString()} at {apt.time}
              </Text>
            </View>
            <Text style={styles.patientName}>{apt.patientName}</Text>
            <Text style={styles.specialty}>{apt.specialty}</Text>
            <Text style={styles.doctor}>Dr. {apt.doctorName}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    padding: 20,
  },
  appointmentCard: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  date: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  doctor: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
});
