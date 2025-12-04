import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  User,
  AlertCircle,
  Heart,
  Activity,
  Thermometer,
  X,
  Pill,
  Stethoscope,
  Plus,
  FileText,
  ArrowLeft,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { MOCK_REPORTS, Report } from '@/constants/mockData';

interface MedicalRecord extends Report {
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
  allergies: string[];
  bloodType: string;
}

const MOCK_MEDICAL_RECORDS: MedicalRecord[] = [
  {
    ...MOCK_REPORTS[0],
    vitals: {
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '65 kg',
    },
    allergies: ['Penicillin', 'Pollen'],
    bloodType: 'A+',
  },
  {
    id: 'rec-3',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Wahid Lotfy',
    date: '2025-08-10',
    title: 'Annual Skin Check',
    summary: 'Routine dermatological examination. No concerning lesions identified.',
    diagnosis: 'Normal skin examination',
    treatment: 'Continue preventive care. Annual follow-up recommended.',
    medications: [],
    vitals: {
      bloodPressure: '120/80',
      heartRate: '72 bpm',
      temperature: '98.6°F',
      weight: '65 kg',
    },
    allergies: ['Penicillin', 'Pollen'],
    bloodType: 'A+',
  },
  {
    id: 'rec-2',
    patientId: 'patient-2',
    patientName: 'Michael Chen',
    doctorId: 'doctor-1',
    doctorName: 'Dr. Wahid Lotfy',
    date: '2025-09-28',
    title: 'Laser Treatment Session',
    summary: 'Patient underwent first session of laser treatment for acne scarring. Tolerated procedure well.',
    diagnosis: 'Post-acne scarring (moderate)',
    treatment: 'Fractional CO2 laser resurfacing. Recommended 4-6 sessions with 4-week intervals.',
    medications: [
      {
        id: 'med-3',
        name: 'Hydrocortisone 1%',
        dosage: 'Apply twice daily for 5 days',
        type: 'cream',
        notes: 'Post-procedure care',
      },
      {
        id: 'med-4',
        name: 'Cephalexin 500mg',
        dosage: 'Take twice daily',
        type: 'tablet',
        notes: 'Prophylactic antibiotic for 7 days',
      },
    ],
    vitals: {
      bloodPressure: '118/76',
      heartRate: '68 bpm',
      temperature: '98.2°F',
      weight: '72 kg',
    },
    allergies: ['Sulfa drugs'],
    bloodType: 'O+',
  },
];

export default function PatientMedicalHistory() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName: string;
  }>();

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRecord, setNewRecord] = useState({
    title: '',
    summary: '',
    diagnosis: '',
    treatment: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
  });

  const patientRecords = MOCK_MEDICAL_RECORDS.filter(
    (record) => record.patientId === patientId
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddRecord = () => {
    if (!newRecord.title || !newRecord.diagnosis) {
      Alert.alert('Error', 'Please fill in at least the title and diagnosis');
      return;
    }

    Alert.alert('Success', 'Medical record added successfully');
    setShowAddModal(false);
    setNewRecord({
      title: '',
      summary: '',
      diagnosis: '',
      treatment: '',
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      weight: '',
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: patientName || 'Patient Medical History',
          headerStyle: { backgroundColor: Colors.secondary },
          headerTintColor: Colors.white,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.white} />
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.patientHeader}>
          <View style={styles.patientInfo}>
            <View style={styles.avatarCircle}>
              <User size={28} color={Colors.white} />
            </View>
            <View>
              <Text style={styles.patientNameText}>{patientName}</Text>
              <Text style={styles.patientIdText}>ID: {patientId}</Text>
            </View>
          </View>
          <Pressable style={styles.addButton} onPress={() => setShowAddModal(true)}>
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Add Record</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>
            Medical History ({patientRecords.length} records)
          </Text>

          {patientRecords.length === 0 ? (
            <View style={styles.emptyState}>
              <FileText size={64} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>No medical records yet</Text>
              <Text style={styles.emptySubtext}>
                Add the first medical record for this patient
              </Text>
            </View>
          ) : (
            patientRecords.map((record) => (
              <Pressable
                key={record.id}
                style={styles.recordCard}
                onPress={() => setSelectedRecord(record)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.dateContainer}>
                    <Calendar size={14} color={Colors.text.secondary} />
                    <Text style={styles.dateText}>
                      {new Date(record.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  {record.allergies.length > 0 && (
                    <AlertCircle size={18} color={Colors.status.error} />
                  )}
                </View>

                <Text style={styles.recordTitle}>{record.title}</Text>
                
                <View style={styles.diagnosisRow}>
                  <Stethoscope size={16} color={Colors.primary} />
                  <Text style={styles.diagnosis}>{record.diagnosis}</Text>
                </View>

                <View style={styles.vitalsRow}>
                  <View style={styles.vitalItem}>
                    <Activity size={14} color={Colors.secondary} />
                    <Text style={styles.vitalText}>{record.vitals.bloodPressure}</Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Heart size={14} color={Colors.status.error} />
                    <Text style={styles.vitalText}>{record.vitals.heartRate}</Text>
                  </View>
                  <View style={styles.vitalItem}>
                    <Thermometer size={14} color={Colors.primary} />
                    <Text style={styles.vitalText}>{record.vitals.temperature}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.viewDetailsText}>Tap to view full details</Text>
                  <FileText size={16} color={Colors.secondary} />
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>

      <Modal
        visible={!!selectedRecord}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical Record Details</Text>
              <Pressable
                onPress={() => setSelectedRecord(null)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecord && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Patient Information</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{selectedRecord.patientName}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Blood Type</Text>
                        <Text style={styles.infoValue}>{selectedRecord.bloodType}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedRecord.date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Doctor</Text>
                        <Text style={styles.infoValue}>{selectedRecord.doctorName}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Vital Signs</Text>
                    <View style={styles.vitalsGrid}>
                      <View style={styles.vitalCard}>
                        <Activity size={24} color={Colors.secondary} />
                        <Text style={styles.vitalLabel}>Blood Pressure</Text>
                        <Text style={styles.vitalValue}>{selectedRecord.vitals.bloodPressure}</Text>
                      </View>
                      <View style={styles.vitalCard}>
                        <Heart size={24} color={Colors.status.error} />
                        <Text style={styles.vitalLabel}>Heart Rate</Text>
                        <Text style={styles.vitalValue}>{selectedRecord.vitals.heartRate}</Text>
                      </View>
                      <View style={styles.vitalCard}>
                        <Thermometer size={24} color={Colors.primary} />
                        <Text style={styles.vitalLabel}>Temperature</Text>
                        <Text style={styles.vitalValue}>{selectedRecord.vitals.temperature}</Text>
                      </View>
                      <View style={styles.vitalCard}>
                        <User size={24} color={Colors.secondary} />
                        <Text style={styles.vitalLabel}>Weight</Text>
                        <Text style={styles.vitalValue}>{selectedRecord.vitals.weight}</Text>
                      </View>
                    </View>
                  </View>

                  {selectedRecord.allergies.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>Allergies</Text>
                      <View style={styles.allergyList}>
                        {selectedRecord.allergies.map((allergy, index) => (
                          <View key={index} style={styles.allergyTag}>
                            <AlertCircle size={14} color={Colors.status.error} />
                            <Text style={styles.allergyTagText}>{allergy}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Summary</Text>
                    <Text style={styles.sectionText}>{selectedRecord.summary}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Diagnosis</Text>
                    <Text style={styles.diagnosisText}>{selectedRecord.diagnosis}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Treatment Plan</Text>
                    <Text style={styles.sectionText}>{selectedRecord.treatment}</Text>
                  </View>

                  {selectedRecord.medications.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>Medications</Text>
                      {selectedRecord.medications.map((med) => (
                        <View key={med.id} style={styles.medicationCard}>
                          <View style={styles.medicationHeader}>
                            <Pill size={18} color={Colors.secondary} />
                            <Text style={styles.medicationName}>{med.name}</Text>
                          </View>
                          <Text style={styles.medicationDosage}>{med.dosage}</Text>
                          {med.notes && (
                            <Text style={styles.medicationNotes}>{med.notes}</Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medical Record</Text>
              <Pressable
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Annual Skin Check"
                  value={newRecord.title}
                  onChangeText={(text) => setNewRecord({ ...newRecord, title: text })}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Diagnosis *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Patient diagnosis"
                  value={newRecord.diagnosis}
                  onChangeText={(text) => setNewRecord({ ...newRecord, diagnosis: text })}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Summary</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief summary of the visit"
                  value={newRecord.summary}
                  onChangeText={(text) => setNewRecord({ ...newRecord, summary: text })}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Treatment Plan</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Recommended treatment"
                  value={newRecord.treatment}
                  onChangeText={(text) => setNewRecord({ ...newRecord, treatment: text })}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>Vital Signs</Text>
                <View style={styles.vitalsInputGrid}>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Blood Pressure</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="120/80"
                      value={newRecord.bloodPressure}
                      onChangeText={(text) => setNewRecord({ ...newRecord, bloodPressure: text })}
                      placeholderTextColor={Colors.text.secondary}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Heart Rate</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="72 bpm"
                      value={newRecord.heartRate}
                      onChangeText={(text) => setNewRecord({ ...newRecord, heartRate: text })}
                      placeholderTextColor={Colors.text.secondary}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Temperature</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="98.6°F"
                      value={newRecord.temperature}
                      onChangeText={(text) => setNewRecord({ ...newRecord, temperature: text })}
                      placeholderTextColor={Colors.text.secondary}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="65 kg"
                      value={newRecord.weight}
                      onChangeText={(text) => setNewRecord({ ...newRecord, weight: text })}
                      placeholderTextColor={Colors.text.secondary}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Pressable style={styles.saveButton} onPress={handleAddRecord}>
                  <Text style={styles.saveButtonText}>Save Medical Record</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  backButton: {
    marginRight: 8,
  },
  patientHeader: {
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientNameText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  patientIdText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: Colors.white,
    borderRadius: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  recordCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  diagnosisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  diagnosis: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500' as const,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  viewDetailsText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    width: '47%',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalCard: {
    width: '47%',
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  vitalValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  allergyList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.status.error}15`,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${Colors.status.error}30`,
  },
  allergyTagText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.status.error,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: Colors.text.primary,
  },
  diagnosisText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  medicationCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  medicationName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  medicationDosage: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  medicationNotes: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontStyle: 'italic' as const,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  vitalsInputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  vitalsInputItem: {
    width: '47%',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
