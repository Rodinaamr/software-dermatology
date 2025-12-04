import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { FileText } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MOCK_REPORTS } from '@/constants/mockData';

export default function AssistantReportsPage() {
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Reports Management',
          headerStyle: { backgroundColor: Colors.primaryLight },
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
        {MOCK_REPORTS.map((report) => (
          <View key={report.id} style={styles.reportCard}>
            <View style={styles.header}>
              <FileText size={20} color={Colors.primaryLight} />
              <View style={styles.reportInfo}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <Text style={styles.reportDate}>
                  {new Date(report.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
            <Text style={styles.patientName}>{report.patientName}</Text>
            <Text style={styles.doctor}>Dr. {report.doctorName}</Text>
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
  reportCard: {
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
    gap: 12,
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  patientName: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  doctor: {
    fontSize: 13,
    color: Colors.primaryLight,
    fontWeight: '500' as const,
  },
});
