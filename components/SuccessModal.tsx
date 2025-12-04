import React from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ visible, title, message, onClose }: SuccessModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={styles.blurFallback} />
        )}
        
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <View style={styles.iconContainer}>
              <CheckCircle size={48} color={Colors.status.success} strokeWidth={2} />
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>

            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Great!</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    padding: 20,
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.shadow.large,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${Colors.status.success}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: Colors.status.success,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: 140,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
    textAlign: 'center',
  },
});
