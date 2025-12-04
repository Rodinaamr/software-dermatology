import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { User } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_PATIENTS = [
  { id: '1', name: 'Sarah Johnson', phone: '+1 234 567 8901', photo: 'https://cdn-icons-png.flaticon.com/512/4648/4648273.png' },
  { id: '2', name: 'Michael Chen', phone: '+1 234 567 8902', photo: 'https://i.pravatar.cc/150?img=3' },
];

export default function AssistantPatientsPage() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Patient List',
          headerStyle: { backgroundColor: Colors.secondary },
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
        {MOCK_PATIENTS.map((patient) => (
          <View key={patient.id} style={styles.patientCard}>
            <Image source={{ uri: patient.photo }} style={styles.avatar} />
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientPhone}>{patient.phone}</Text>
            </View>
            <User size={20} color={Colors.text.light} />
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
  patientCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  patientPhone: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});
4