import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { CreditCard } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MOCK_PAYMENTS } from '@/constants/mockData';

export default function AssistantPaymentsPage() {
  const insets = useSafeAreaInsets();

  const totalCollected = MOCK_PAYMENTS
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Payment Management',
          headerStyle: { backgroundColor: Colors.gold },
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
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Collected</Text>
          <Text style={styles.summaryAmount}>${totalCollected}</Text>
        </View>

        {MOCK_PAYMENTS.map((payment) => (
          <View key={payment.id} style={styles.paymentCard}>
            <View style={styles.header}>
              <CreditCard size={20} color={Colors.gold} />
              <View style={styles.paymentInfo}>
                <Text style={styles.patientName}>{payment.patientName}</Text>
                <Text style={styles.treatmentName}>{payment.treatmentName}</Text>
              </View>
            </View>
            <View style={styles.footer}>
              <Text style={styles.amount}>${payment.amount}</Text>
              <View
                style={[
                  styles.statusBadge,
                  payment.status === 'paid'
                    ? styles.statusPaid
                    : styles.statusPending,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    payment.status === 'paid'
                      ? styles.statusTextPaid
                      : styles.statusTextPending,
                  ]}
                >
                  {payment.status === 'paid' ? 'Paid' : 'Pending'}
                </Text>
              </View>
            </View>
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
  summaryCard: {
    backgroundColor: Colors.gold,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
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
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  treatmentName: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusPaid: {
    backgroundColor: `${Colors.status.success}20`,
  },
  statusPending: {
    backgroundColor: `${Colors.status.pending}20`,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  statusTextPaid: {
    color: Colors.status.success,
  },
  statusTextPending: {
    color: Colors.status.pending,
  },
});
