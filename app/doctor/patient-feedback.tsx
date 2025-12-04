import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Star, MessageSquare } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MOCK_FEEDBACK } from '@/constants/mockData';

export default function PatientFeedbackPage() {
  const insets = useSafeAreaInsets();

  const averageRating = MOCK_FEEDBACK.reduce((sum, f) => sum + f.rating, 0) / MOCK_FEEDBACK.length;

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Patient Feedback',
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
        <View style={styles.summaryCard}>
          <View style={styles.ratingContainer}>
            <Star size={32} color={Colors.gold} fill={Colors.gold} />
            <Text style={styles.averageRating}>
              {averageRating.toFixed(1)}
            </Text>
            <Text style={styles.ratingLabel}>Average Rating</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{MOCK_FEEDBACK.length}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {MOCK_FEEDBACK.filter(f => f.rating === 5).length}
              </Text>
              <Text style={styles.statLabel}>5 Stars</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Feedback</Text>
        
        {MOCK_FEEDBACK.map((feedback) => (
          <View key={feedback.id} style={styles.feedbackCard}>
            <View style={styles.feedbackHeader}>
              <View style={styles.patientInfo}>
                <MessageSquare size={18} color={Colors.primary} />
                <Text style={styles.patientName}>{feedback.patientName}</Text>
              </View>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={14}
                    color={star <= feedback.rating ? Colors.gold : Colors.border.light}
                    fill={star <= feedback.rating ? Colors.gold : 'transparent'}
                    strokeWidth={1.5}
                  />
                ))}
              </View>
            </View>
            <Text style={styles.feedbackComment}>{feedback.comment}</Text>
            <Text style={styles.feedbackDate}>
              {new Date(feedback.date).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
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
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginTop: 12,
  },
  ratingLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border.light,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  feedbackCard: {
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
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  feedbackComment: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
    marginBottom: 12,
  },
  feedbackDate: {
    fontSize: 12,
    color: Colors.text.light,
  },
});
