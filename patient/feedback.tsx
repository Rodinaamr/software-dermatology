import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, Send } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import SuccessModal from '@/components/SuccessModal';

export default function FeedbackPage() {
  const insets = useSafeAreaInsets();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating');
      return;
    }
    
    setShowSuccessModal(true);
    setRating(0);
    setComment('');
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Feedback',
          headerStyle: { backgroundColor: Colors.primaryLight },
          headerTintColor: Colors.white,
        }}
      />
      <SuccessModal
        visible={showSuccessModal}
        title="Thank You!"
        message="Your feedback has been submitted successfully. We appreciate you taking the time to help us improve our services."
        onClose={handleCloseSuccess}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Share Your Experience</Text>
          <Text style={styles.subtitle}>
            Your feedback helps us improve our services
          </Text>

          <Text style={styles.label}>Rating</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Star
                  size={40}
                  color={star <= rating ? Colors.gold : Colors.border.light}
                  fill={star <= rating ? Colors.gold : 'transparent'}
                  strokeWidth={1.5}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Comments</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell us about your experience..."
            placeholderTextColor={Colors.text.light}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
          >
            <LinearGradient
              colors={[Colors.primaryLight, Colors.primary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
              <Send size={18} color={Colors.white} />
            </LinearGradient>
          </Pressable>
        </View>
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  starButton: {
    padding: 4,
  },
  textArea: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 24,
    minHeight: 150,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.primaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});

