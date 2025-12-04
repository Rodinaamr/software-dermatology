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
import { LogOut, X } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface LogoutModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutModal({ visible, onConfirm, onCancel }: LogoutModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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
              <LogOut size={32} color={Colors.status.error} strokeWidth={2} />
            </View>
            
            <Text style={styles.title}>Logout</Text>
            <Text style={styles.message}>
              Are you sure you want to logout?{'\n'}
              You'll need to sign in again to access your account.
            </Text>

            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.cancelButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onCancel}
              >
                <X size={20} color={Colors.text.secondary} strokeWidth={2} />
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.confirmButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onConfirm}
              >
                <LogOut size={20} color={Colors.white} strokeWidth={2} />
                <Text style={styles.confirmButtonText}>Logout</Text>
              </Pressable>
            </View>
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
    padding: 28,
    alignItems: 'center',
    shadowColor: Colors.shadow.large,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.status.error}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cancelButton: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  confirmButton: {
    backgroundColor: Colors.status.error,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
