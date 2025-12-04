import Colors from '@/constants/colors';
import { MOCK_REPORTS } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { FileText } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReportsPage() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const userReports = MOCK_REPORTS.filter(r => r.patientId === user?.id);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Reports',
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
        {userReports.length > 0 ? (
          userReports.map((report) => (
            <View key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <FileText size={24} color={Colors.secondary} />
                <View style={styles.reportInfo}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>
                    {new Date(report.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <Text style={styles.reportSummary}>{report.summary}</Text>
              <Text style={styles.reportDoctor}>Dr. {report.doctorName}</Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={Colors.border.medium} />
            <Text style={styles.emptyText}>No reports available</Text>
          </View>
        )}
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
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  reportDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reportSummary: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportDoctor: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '500' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 16,
  },
});
