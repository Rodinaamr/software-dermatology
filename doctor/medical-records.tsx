import Colors from '@/constants/colors';
import { MOCK_REPORTS, Report } from '@/constants/mockData';
import { Stack } from 'expo-router';
import {
  Activity,
  AlertCircle,
  Calendar,
  FileText,
  Heart,
  Pill,
  Search,
  Stethoscope,
  Thermometer,
  User,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const MOCK_MEDICAL_RECORDS: MedicalRecord[] = MOCK_REPORTS.map((report) => ({
  ...report,
  vitals: {
    bloodPressure: '120/80',
    heartRate: '72 bpm',
    temperature: '98.6°F',
    weight: '65 kg',
  },
  allergies: ['Penicillin', 'Pollen'],
  bloodType: 'A+',
}));

const ADDITIONAL_RECORDS: MedicalRecord[] = [
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
];

const ALL_RECORDS = [...MOCK_MEDICAL_RECORDS, ...ADDITIONAL_RECORDS];

export default function MedicalRecordsPage() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  const filteredRecords = ALL_RECORDS.filter((record) =>
    record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Medical Records',
          headerStyle: { backgroundColor: Colors.secondary },
          headerTintColor: Colors.white,
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient, diagnosis, or title..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultCount}>
            {filteredRecords.length} {filteredRecords.length === 1 ? 'Record' : 'Records'}
          </Text>

          {filteredRecords.map((record) => (
            <Pressable
              key={record.id}
              style={styles.recordCard}
              onPress={() => setSelectedRecord(record)}
            >
              <View style={styles.cardHeader}>
                <View style={styles.patientInfo}>
                  <View style={styles.iconCircle}>
                    <User size={20} color={Colors.secondary} />
                  </View>
                  <View>
                    <Text style={styles.patientName}>{record.patientName}</Text>
                    <Text style={styles.bloodType}>Blood Type: {record.bloodType}</Text>
                  </View>
                </View>
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
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <View style={styles.diagnosisRow}>
                  <Stethoscope size={16} color={Colors.primary} />
                  <Text style={styles.diagnosis}>{record.diagnosis}</Text>
                </View>

                {record.allergies.length > 0 && (
                  <View style={styles.allergiesContainer}>
                    <AlertCircle size={14} color={Colors.status.error} />
                    <Text style={styles.allergiesText}>
                      Allergies: {record.allergies.join(', ')}
                    </Text>
                  </View>
                )}

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
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.viewDetailsText}>Tap to view full details</Text>
                <FileText size={16} color={Colors.secondary} />
              </View>
            </Pressable>
          ))}

          {filteredRecords.length === 0 && (
            <View style={styles.emptyState}>
              <FileText size={64} color={Colors.text.secondary} />
              <Text style={styles.emptyText}>No medical records found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search query
              </Text>
            </View>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.secondary,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${Colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  bloodType: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginBottom: 16,
  },
  cardBody: {
    gap: 12,
  },
  recordTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  diagnosisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagnosis: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500' as const,
  },
  allergiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: `${Colors.status.error}10`,
    padding: 8,
    borderRadius: 8,
  },
  allergiesText: {
    fontSize: 12,
    color: Colors.status.error,
    fontWeight: '500' as const,
  },
  vitalsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
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
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  viewDetailsText: {
    fontSize: 13,
    color: Colors.secondary,
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
});
