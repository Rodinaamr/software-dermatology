import Colors from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Mail, MapPin, Phone, Send } from 'lucide-react-native';
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

export default function ContactPage() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  const handleSubmit = () => {
    if (!name || !email || !message) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      return;
    }
    
    Alert.alert(
      'Message Sent! ✓',
      'We will get back to you soon',
      [{ text: 'OK' }]
    );
    
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Contact Us',
          headerStyle: { backgroundColor: Colors.status.success },
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
        <View style={styles.infoCard}>
          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoText}>
                123 Medical Plaza, Suite 100{'\n'}Cairo, Egypt
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Mail size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoText}>info@wahidlotfy.com</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.iconContainer}>
              <Phone size={20} color={Colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoText}>+20 123 456 7890</Text>
            </View>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Send us a message</Text>

          <TextInput
            style={styles.input}
            placeholder="Your Name"
            placeholderTextColor={Colors.text.light}
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Your Email"
            placeholderTextColor={Colors.text.light}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.textArea}
            placeholder="Your Message"
            placeholderTextColor={Colors.text.light}
            value={message}
            onChangeText={setMessage}
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
              colors={[Colors.status.success, Colors.primary]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.submitButtonText}>Send Message</Text>
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
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.mintLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  infoText: {
    fontSize: 15,
    color: Colors.text.primary,
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: Colors.shadow.medium,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginBottom: 20,
    minHeight: 120,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.status.success,
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
