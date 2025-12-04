import Colors from '@/constants/colors';
import { addPrescription, MOCK_REPORTS, Prescription, Report } from '@/constants/mockData';
import { useAuth } from '@/contexts/AuthContext';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function MedicalPrescription() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<any>(null);

  const patients = Array.from(new Set(MOCK_REPORTS.map(r => r.patientName))).map(name => {
    const report = MOCK_REPORTS.find(r => r.patientName === name)!;
    return { id: report.patientId, name };
  });

  const reports = selectedPatientId
    ? MOCK_REPORTS.filter(r => r.patientId === selectedPatientId)
    : [];

  const selectedReport: Report | undefined = reports.find(r => r.id === selectedReportId);

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
    if (!result.canceled) {
      const picked = result.assets[0];
      setFile(picked);
    }
  };

  const toggleMed = (medId: string) => {
    setSelectedMeds(prev =>
      prev.includes(medId) ? prev.filter(id => id !== medId) : [...prev, medId]
    );
  };

  const savePrescription = () => {
    if (!selectedPatientId || !selectedReportId || selectedMeds.length === 0) {
      Alert.alert('Missing', 'Please select patient, case, and medications.');
      return;
    }

    const prescription: Prescription = {
      id: Date.now().toString(),
      doctorId: user?.id || 'doctor-1',
      doctorName: user?.name || 'Dr. Wahid Lotfy',
      patientId: selectedPatientId,
      patientName: patients.find(p => p.id === selectedPatientId)!.name,
      date: new Date().toISOString(),
      notes,
      attachment: file
        ? {
            uri: file.uri,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size,
          }
        : undefined,
    };

    addPrescription(prescription);
    Alert.alert('Saved ✅', 'Prescription added.');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Medical Prescription</Text>

      {/* Patient Selection */}
      <Text style={styles.label}>Select Patient</Text>
      <ScrollView horizontal style={styles.selectorRow}>
        {patients.map(p => (
          <Pressable
            key={p.id}
            style={[
              styles.selectorButton,
              selectedPatientId === p.id && styles.selectorButtonSelected,
            ]}
            onPress={() => {
              setSelectedPatientId(p.id);
              setSelectedReportId(null);
              setSelectedMeds([]);
            }}
          >
            <Text
              style={[
                styles.selectorText,
                selectedPatientId === p.id && styles.selectorTextSelected,
              ]}
            >
              {p.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Patient Case/Status Selection */}
      {reports.length > 0 && (
        <>
          <Text style={styles.label}>Select Case / Status</Text>
          <ScrollView horizontal style={styles.selectorRow}>
            {reports.map(r => (
              <Pressable
                key={r.id}
                style={[
                  styles.selectorButton,
                  selectedReportId === r.id && styles.selectorButtonSelected,
                ]}
                onPress={() => {
                  setSelectedReportId(r.id);
                  setSelectedMeds([]);
                }}
              >
                <Text
                  style={[
                    styles.selectorText,
                    selectedReportId === r.id && styles.selectorTextSelected,
                  ]}
                >
                  {r.diagnosis} ({r.date})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* Medications Selection */}
      {selectedReport && (
        <>
          <Text style={styles.label}>Medications</Text>
          <ScrollView horizontal style={styles.selectorRow}>
            {selectedReport.medications.map(med => (
              <Pressable
                key={med.id}
                style={[
                  styles.selectorButton,
                  selectedMeds.includes(med.id) && styles.selectorButtonSelected,
                ]}
                onPress={() => toggleMed(med.id)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    selectedMeds.includes(med.id) && styles.selectorTextSelected,
                  ]}
                >
                  {med.name} ({med.dosage})
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Before/After Progress */}
          {selectedReport.progressPhotos && selectedReport.progressPhotos.length > 0 && (
            <>
              <Text style={styles.label}>Progress Photos</Text>
              <ScrollView horizontal>
                {selectedReport.progressPhotos.map((p, i) => (
                  <View key={i} style={{ marginRight: 10 }}>
                    <Image source={{ uri: p.before }} style={styles.progressImage} />
                    {p.after && <Image source={{ uri: p.after }} style={styles.progressImage} />}
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </>
      )}

      {/* Notes Input */}
      <Text style={styles.label}>Prescription Notes</Text>
      <TextInput
        style={styles.input}
        multiline
        value={notes}
        onChangeText={setNotes}
        placeholder="Add additional instructions..."
      />

      {/* Upload Attachment */}
      <Text style={styles.label}>Upload Attachment</Text>
      <Pressable style={styles.uploadButton} onPress={pickFile}>
        <Text style={styles.uploadText}>{file ? 'Change File' : 'Pick File'}</Text>
      </Pressable>

      {/* File Preview */}
      {file && (
        <View style={styles.fileBox}>
          <Text style={styles.fileName}>{file.name}</Text>
          {file.mimeType?.includes('image') && (
            <Image source={{ uri: file.uri }} style={styles.previewImage} />
          )}
        </View>
      )}

      <Pressable style={styles.saveButton} onPress={savePrescription}>
        <Text style={styles.saveText}>Save Prescription</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: Colors.offWhite },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    minHeight: 100,
    padding: 14,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 20,
  },
  selectorRow: { marginBottom: 16 },
  selectorButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  selectorButtonSelected: { backgroundColor: Colors.primary },
  selectorText: { color: '#444' },
  selectorTextSelected: { color: '#fff', fontWeight: '600' },
  uploadButton: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadText: { color: '#fff', fontWeight: '600' },
  fileBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  fileName: { marginBottom: 10, color: '#444' },
  previewImage: { width: '100%', height: 200, borderRadius: 10 },
  progressImage: { width: 120, height: 120, borderRadius: 10, marginBottom: 5 },
  saveButton: {
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
