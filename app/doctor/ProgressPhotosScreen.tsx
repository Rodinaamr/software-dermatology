import Colors from '@/constants/colors';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    Calendar,
    ChevronLeft,
    Trash2,
    TrendingUp,
    Upload,
    User
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface ProgressPhoto {
  id: string;
  date: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  notes?: string;
  uploadedBy: string;
}

export default function ProgressPhotosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;
  const patientName = params.patientName as string;
  
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([
    // Initial data - in a real app, this would come from your state/context
    {
      id: 'p1',
      date: '2024-01-20',
      title: 'Psoriasis Treatment Progress',
      description: 'Initial treatment vs after 4 weeks',
      beforeImage: 'https://images.unsplash.com/photo-1556228578-9c360e1d8d34?w=400&h=300&fit=crop',
      afterImage: 'https://images.unsplash.com/photo-1556228578-5b3a5b3b3b3b?w=400&h=300&fit=crop',
      notes: 'Significant improvement in erythema and scaling',
      uploadedBy: 'Dr. Wahid Lotfy'
    }
  ]);
  
  const [newProgress, setNewProgress] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    beforeImage: '',
    afterImage: '',
  });
  
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  
  const uploadImage = async (type: 'before' | 'after') => {
    setUploadingImage(type);
    
    // Request permissions for media library only
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required', 
        'Sorry, we need photo library permissions to upload images.'
      );
      setUploadingImage(null);
      return;
    }
    
    // Launch image picker (file browser) only
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false, // Single file selection
    });
    
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      if (type === 'before') {
        setNewProgress(prev => ({ ...prev, beforeImage: imageUri }));
      } else {
        setNewProgress(prev => ({ ...prev, afterImage: imageUri }));
      }
    }
    
    setUploadingImage(null);
  };
  
  const removeImage = (type: 'before' | 'after') => {
    if (type === 'before') {
      setNewProgress(prev => ({ ...prev, beforeImage: '' }));
    } else {
      setNewProgress(prev => ({ ...prev, afterImage: '' }));
    }
  };
  
  const saveProgress = () => {
    if (!newProgress.title.trim() || !newProgress.description.trim()) {
      Alert.alert('Missing Information', 'Please provide title and description.');
      return;
    }
    
    if (!newProgress.beforeImage || !newProgress.afterImage) {
      Alert.alert('Missing Photos', 'Please upload both before and after photos.');
      return;
    }
    
    const newPhoto: ProgressPhoto = {
      id: `progress-${Date.now()}`,
      date: newProgress.date,
      title: newProgress.title,
      description: newProgress.description,
      beforeImage: newProgress.beforeImage,
      afterImage: newProgress.afterImage,
      notes: newProgress.notes.trim() || undefined,
      uploadedBy: 'Dr. Wahid Lotfy'
    };
    
    setProgressPhotos(prev => [newPhoto, ...prev]);
    
    // Reset form
    setNewProgress({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      notes: '',
      beforeImage: '',
      afterImage: '',
    });
    
    Alert.alert('Progress Saved', 'Progress photos have been saved to patient record.');
  };
  
  const deleteProgress = (id: string) => {
    Alert.alert(
      'Delete Progress',
      'Are you sure you want to delete this progress entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setProgressPhotos(prev => prev.filter(photo => photo.id !== id));
          }
        }
      ]
    );
  };
  
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Treatment Progress',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 16 }}>
              <ChevronLeft size={24} color={Colors.white} />
            </Pressable>
          ),
          headerStyle: { backgroundColor: Colors.secondary },
          headerTintColor: Colors.white,
        }}
      />
      
      <ScrollView style={styles.container}>
        {/* Patient Header */}
        <View style={styles.patientHeader}>
          <View style={styles.avatar}>
            <User size={24} color={Colors.white} />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientSubtitle}>Treatment Progress Tracking</Text>
          </View>
        </View>
        
        {/* Add New Progress Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add New Progress Entry</Text>
          
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={newProgress.title}
              onChangeText={text => setNewProgress(prev => ({ ...prev, title: text }))}
              placeholder="e.g., Psoriasis Treatment Week 4"
              placeholderTextColor={Colors.text?.secondary || '#666'}
            />
          </View>
          
          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newProgress.description}
              onChangeText={text => setNewProgress(prev => ({ ...prev, description: text }))}
              placeholder="Describe the treatment progress..."
              placeholderTextColor={Colors.text?.secondary || '#666'}
              multiline
              numberOfLines={3}
            />
          </View>
          
          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.dateInput}>
              <Calendar size={20} color={Colors.text?.secondary || '#666'} />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={newProgress.date}
                onChangeText={text => setNewProgress(prev => ({ ...prev, date: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>
          
          {/* Before Photo - FILE UPLOAD ONLY */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Before Treatment</Text>
            {newProgress.beforeImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: newProgress.beforeImage }} style={styles.previewImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.changeButton]}
                    onPress={() => uploadImage('before')}
                    disabled={uploadingImage === 'before'}
                  >
                    <Text style={styles.imageActionText}>
                      {uploadingImage === 'before' ? 'Uploading...' : 'Change File'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.removeButton]}
                    onPress={() => removeImage('before')}
                  >
                    <Text style={[styles.imageActionText, styles.removeText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => uploadImage('before')}
                disabled={uploadingImage === 'before'}
              >
                <Upload size={24} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {uploadingImage === 'before' ? 'Uploading...' : 'Upload File'}
                </Text>
                <Text style={styles.uploadSubtext}>Choose image from device storage</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* After Photo - FILE UPLOAD ONLY */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>After Treatment</Text>
            {newProgress.afterImage ? (
              <View style={styles.imagePreview}>
                <Image source={{ uri: newProgress.afterImage }} style={styles.previewImage} />
                <View style={styles.imageActions}>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.changeButton]}
                    onPress={() => uploadImage('after')}
                    disabled={uploadingImage === 'after'}
                  >
                    <Text style={styles.imageActionText}>
                      {uploadingImage === 'after' ? 'Uploading...' : 'Change File'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.imageActionButton, styles.removeButton]}
                    onPress={() => removeImage('after')}
                  >
                    <Text style={[styles.imageActionText, styles.removeText]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={() => uploadImage('after')}
                disabled={uploadingImage === 'after'}
              >
                <Upload size={24} color={Colors.primary} />
                <Text style={styles.uploadButtonText}>
                  {uploadingImage === 'after' ? 'Uploading...' : 'Upload File'}
                </Text>
                <Text style={styles.uploadSubtext}>Choose image from device storage</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newProgress.notes}
              onChangeText={text => setNewProgress(prev => ({ ...prev, notes: text }))}
              placeholder="Additional notes about the progress..."
              placeholderTextColor={Colors.text?.secondary || '#666'}
              multiline
              numberOfLines={4}
            />
          </View>
          
          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveProgress}
            disabled={uploadingImage !== null}
          >
            <TrendingUp size={20} color={Colors.white} />
            <Text style={styles.saveButtonText}>Save Progress Entry</Text>
          </TouchableOpacity>
        </View>
        
        {/* Existing Progress Entries */}
        {progressPhotos.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Progress History ({progressPhotos.length})</Text>
            {progressPhotos.map(photo => (
              <View key={photo.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <View>
                    <Text style={styles.progressTitle}>{photo.title}</Text>
                    <Text style={styles.progressDate}>{photo.date} • {photo.uploadedBy}</Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteProgress(photo.id)}>
                    <Trash2 size={20} color={Colors.status?.error || '#FF3B30'} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.progressDescription}>{photo.description}</Text>
                
                <View style={styles.comparisonContainer}>
                  <View style={styles.comparisonImage}>
                    <Text style={styles.comparisonLabel}>Before</Text>
                    <Image source={{ uri: photo.beforeImage }} style={styles.comparisonPhoto} />
                  </View>
                  <View style={styles.comparisonImage}>
                    <Text style={styles.comparisonLabel}>After</Text>
                    <Image source={{ uri: photo.afterImage }} style={styles.comparisonPhoto} />
                  </View>
                </View>
                
                {photo.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>Notes:</Text>
                    <Text style={styles.notesText}>{photo.notes}</Text>
                  </View>
                )}
              </View>
            ))}
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
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    padding: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  patientSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 16,
    marginTop: 8,
    padding: 20,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text?.primary || '#000',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // UPLOAD BUTTON STYLES
  uploadButton: {
    backgroundColor: Colors.offWhite,
    borderWidth: 2,
    borderColor: Colors.border?.light || '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
  },
  // IMAGE PREVIEW STYLES
  imagePreview: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  imageActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeButton: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.status?.error || '#FF3B30',
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
  },
  removeText: {
    color: Colors.status?.error || '#FF3B30',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  progressItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
    paddingVertical: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  progressDate: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  progressDescription: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    marginBottom: 16,
    lineHeight: 20,
  },
  comparisonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  comparisonImage: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  comparisonPhoto: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  notesContainer: {
    backgroundColor: `${Colors.primary}10`,
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    lineHeight: 20,
  },
});