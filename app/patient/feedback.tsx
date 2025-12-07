import Colors from '@/constants/colors';
import { Stack } from 'expo-router';
import { Calendar, MessageSquare, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock feedback data - NO PATIENT NAMES
const MOCK_FEEDBACK = [
  {
    id: '1',
    rating: 5,
    comment: 'Exceptional service! The doctor was very thorough and explained everything clearly.',
    date: 'October 16, 2025',
    category: 'Consultation',
  },
  {
    id: '2',
    rating: 4,
    comment: 'Good experience overall, but the waiting time could be improved.',
    date: 'October 15, 2025',
    category: 'Follow-up',
  },
  {
    id: '3',
    rating: 5,
    comment: 'Very professional and caring. Felt listened to and well taken care of.',
    date: 'October 14, 2025',
    category: 'Consultation',
  },
  {
    id: '4',
    rating: 3,
    comment: 'Average experience. Could have been more attentive to my concerns.',
    date: 'October 13, 2025',
    category: 'Emergency',
  },
  {
    id: '5',
    rating: 5,
    comment: 'Outstanding care! Would highly recommend to anyone.',
    date: 'October 12, 2025',
    category: 'Consultation',
  },
];

export default function DoctorFeedbackView() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

  // Calculate average rating
  const totalReviews = MOCK_FEEDBACK.length;
  const averageRating = MOCK_FEEDBACK.reduce((sum, feedback) => sum + feedback.rating, 0) / totalReviews;
  const positiveReviews = MOCK_FEEDBACK.filter(f => f.rating >= 4).length;
  const fiveStarReviews = MOCK_FEEDBACK.filter(f => f.rating === 5).length;
  
  // Filter feedback based on selection
  const filteredFeedback = MOCK_FEEDBACK.filter(feedback => {
    if (filter === 'all') return true;
    if (filter === 'positive') return feedback.rating >= 4;
    return feedback.rating <= 3;
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Patient Feedback',
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
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Feedback Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{averageRating.toFixed(1)}</Text>
              <Text style={styles.summaryLabel}>Average Rating</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{totalReviews}</Text>
              <Text style={styles.summaryLabel}>Total Reviews</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>{fiveStarReviews}</Text>
              <Text style={styles.summaryLabel}>5 Stars</Text>
            </View>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <Pressable
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All Feedback
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'positive' && styles.filterButtonActive]}
            onPress={() => setFilter('positive')}
          >
            <Text style={[styles.filterText, filter === 'positive' && styles.filterTextActive]}>
              Positive (4+)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterButton, filter === 'negative' && styles.filterButtonActive]}
            onPress={() => setFilter('negative')}
          >
            <Text style={[styles.filterText, filter === 'negative' && styles.filterTextActive]}>
              Needs Improvement
            </Text>
          </Pressable>
        </View>

        {/* Feedback List */}
        <Text style={styles.sectionTitle}>Recent Feedback</Text>
        
        {filteredFeedback.length === 0 ? (
          <View style={styles.emptyState}>
            <MessageSquare size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>No feedback available</Text>
          </View>
        ) : (
          filteredFeedback.map(feedback => (
            <View key={feedback.id} style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                {/* Rating stars */}
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={20}
                      color={star <= feedback.rating ? Colors.gold : Colors.border.light}
                      fill={star <= feedback.rating ? Colors.gold : 'transparent'}
                    />
                  ))}
                  <Text style={styles.ratingText}>{feedback.rating.toFixed(1)}</Text>
                </View>
                
                {/* Date and category - NO PATIENT NAME */}
                <View style={styles.feedbackMeta}>
                  <View style={styles.metaItem}>
                    <Calendar size={14} color={Colors.text.secondary} />
                    <Text style={styles.metaText}>{feedback.date}</Text>
                  </View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{feedback.category}</Text>
                  </View>
                </View>
              </View>

              {/* Comment only - NO PATIENT NAME */}
              <Text style={styles.comment}>{feedback.comment}</Text>
              
              {/* Separator line */}
              <View style={styles.separator} />
            </View>
          ))
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
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  filterTextActive: {
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  feedbackCard: {
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
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginLeft: 4,
  },
  feedbackMeta: {
    alignItems: 'flex-end',
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  categoryBadge: {
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  comment: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginTop: 12,
  },
});