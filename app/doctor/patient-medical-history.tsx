import Colors from '@/constants/colors';
import { Appointment, MOCK_APPOINTMENTS, MOCK_REPORTS, Report } from '@/constants/mockData';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Heart,
  Pill,
  Plus,
  Search,
  Stethoscope,
  Thermometer,
  User,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
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

/* Medical history model with choice-based arrays */
interface PatientMedicalHistory {
  patientId: string;
  medicalHistory: string[];
  medicalHistoryOther?: string;
  familyHistory: string[];
  familyHistoryOther?: string;
  allergies: string[];
  allergiesOther?: string;
  pastSurgeries: string[];
  pastSurgeriesOther?: string;
  drugHistory: string[];
  drugHistoryOther?: string;
  lifestyle: string[];
  lifestyleOther?: string;
  createdAt: string;
  updatedAt?: string;
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

const getAllPatients = () => {
  const uniquePatients = new Map<string, { patientId: string; patientName: string; recordCount: number }>();
  MOCK_MEDICAL_RECORDS.forEach((r) => {
    if (!uniquePatients.has(r.patientId)) {
      uniquePatients.set(r.patientId, { patientId: r.patientId, patientName: r.patientName, recordCount: 0 });
    }
    uniquePatients.get(r.patientId)!.recordCount += 1;
  });
  return Array.from(uniquePatients.values());
};

const getReportsForAppointment = (apt: Appointment, records: MedicalRecord[]) => {
  return records.filter((r) => r.patientId === apt.patientId && r.date === apt.date);
};

export default function PatientMedicalHistory() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { patientId, patientName } = useLocalSearchParams<{ patientId: string; patientName: string }>();

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [showPatientSelector, setShowPatientSelector] = useState<boolean>(!patientId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<{ patientId: string; patientName: string } | null>(
    patientId && patientName ? { patientId, patientName } : null
  );

  // Medical history store (mock, in-memory)
  const [medicalHistories, setMedicalHistories] = useState<Record<string, PatientMedicalHistory>>({});

  // Modals
  const [showAddHistoryModal, setShowAddHistoryModal] = useState(false);
  const [showSOAPModal, setShowSOAPModal] = useState(false);

  // Medical history form state (choice-based)
  const [historyForm, setHistoryForm] = useState({
    medicalHistory: [] as string[],
    medicalHistoryOther: '',
    familyHistory: [] as string[],
    familyHistoryOther: '',
    allergies: [] as string[],
    allergiesOther: '',
    pastSurgeries: [] as string[],
    pastSurgeriesOther: '',
    drugHistory: [] as string[],
    drugHistoryOther: '',
    lifestyle: [] as string[],
    lifestyleOther: '',
  });

  // SOAP form state (Subjective / Objective / Assessment / Plan)
  const [soapForm, setSoapForm] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    weight: '',
    notes: '',
  });

  // Option arrays with "Other" option
  const medicalHistoryOptions = [
    'diabetes',
    'hypertension',
    'thyroid disorder',
    'skin allergies',
    'autoimmune conditions',
    'none',
    'Other',
  ];
  const familyHistoryOptions = ['acne', 'alopecia', 'psoriasis', 'eczema', 'vitiligo', 'none', 'Other'];
  const allergyOptions = ['drugs', 'food', 'cosmetics', 'latex', 'none', 'Other'];
  const pastSurgeriesOptions = ['cosmetic procedures', 'laser surgeries', 'biopsies', 'none', 'Other'];
  const drugHistoryOptions = ['steroids', 'isotretinoin (Roaccutane)', 'antibiotics', 'none', 'Other'];
  const lifestyleOptions = ['smoking', 'sun exposure', 'stress', 'poor sleep', 'none', 'Other'];

  const patients = getAllPatients();
  const filteredPatients = patients.filter((p) => p.patientName.toLowerCase().includes(searchQuery.toLowerCase()));

  // All records for selected patient, newest first
  const patientRecords = selectedPatient
    ? MOCK_MEDICAL_RECORDS.filter((r) => r.patientId === selectedPatient.patientId).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  // All appointments for selected patient, newest first
  const patientAppointments = selectedPatient
    ? MOCK_APPOINTMENTS.filter((apt) => apt.patientId === selectedPatient.patientId).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    : [];

  const handleSelectPatient = (p: typeof patients[0]) => {
    setSelectedPatient({ patientId: p.patientId, patientName: p.patientName });
    setShowPatientSelector(false);
    setSearchQuery('');
  };

  // Helper to toggle selection
  const toggleSelection = (arr: string[], opt: string) => {
    if (arr.includes(opt)) return arr.filter((s) => s !== opt);
    return [...arr, opt];
  };

  // Handle toggle for medical history with "Other" logic
  const handleMedicalHistoryToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.medicalHistory, opt);
      return {
        ...prev,
        medicalHistory: newArray,
      };
    });
  };

  // Handle toggle for family history with "Other" logic
  const handleFamilyHistoryToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.familyHistory, opt);
      return {
        ...prev,
        familyHistory: newArray,
      };
    });
  };

  // Handle toggle for allergies with "Other" logic
  const handleAllergiesToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.allergies, opt);
      return {
        ...prev,
        allergies: newArray,
      };
    });
  };

  // Handle toggle for past surgeries with "Other" logic
  const handlePastSurgeriesToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.pastSurgeries, opt);
      return {
        ...prev,
        pastSurgeries: newArray,
      };
    });
  };

  // Handle toggle for drug history with "Other" logic
  const handleDrugHistoryToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.drugHistory, opt);
      return {
        ...prev,
        drugHistory: newArray,
      };
    });
  };

  // Handle toggle for lifestyle with "Other" logic
  const handleLifestyleToggle = (opt: string) => {
    setHistoryForm(prev => {
      const newArray = toggleSelection(prev.lifestyle, opt);
      return {
        ...prev,
        lifestyle: newArray,
      };
    });
  };

  // Simple MultiChoiceList component
  const MultiChoiceList = ({
    options,
    selected,
    onToggle,
  }: {
    options: string[];
    selected: string[];
    onToggle: (opt: string) => void;
  }) => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <Pressable
              key={opt}
              onPress={() => onToggle(opt)}
              style={[styles.choiceItem, isSelected && styles.choiceItemSelected]}
            >
              <Text style={[styles.choiceText, isSelected && styles.choiceTextSelected]}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  // When pressing "Add Medical Record"
  const onAddMedicalRecordPress = () => {
    if (!selectedPatient) {
      Alert.alert('No patient selected', 'Please select a patient first.');
      return;
    }
    
    // ALWAYS show the Add Medical History modal first
    setShowAddHistoryModal(true);
    
    // Clear form when opening
    setHistoryForm({
      medicalHistory: [],
      medicalHistoryOther: '',
      familyHistory: [],
      familyHistoryOther: '',
      allergies: [],
      allergiesOther: '',
      pastSurgeries: [],
      pastSurgeriesOther: '',
      drugHistory: [],
      drugHistoryOther: '',
      lifestyle: [],
      lifestyleOther: '',
    });
  };

  // Save medical history then open SOAP form
  const handleSaveMedicalHistory = () => {
    if (!selectedPatient) return;

    // Check if "Other" is selected but text is empty
    if (
      (historyForm.medicalHistory.includes('Other') && !historyForm.medicalHistoryOther.trim()) ||
      (historyForm.familyHistory.includes('Other') && !historyForm.familyHistoryOther.trim()) ||
      (historyForm.allergies.includes('Other') && !historyForm.allergiesOther.trim()) ||
      (historyForm.pastSurgeries.includes('Other') && !historyForm.pastSurgeriesOther.trim()) ||
      (historyForm.drugHistory.includes('Other') && !historyForm.drugHistoryOther.trim()) ||
      (historyForm.lifestyle.includes('Other') && !historyForm.lifestyleOther.trim())
    ) {
      Alert.alert('Missing Information', 'Please specify the "Other" details.');
      return;
    }

    const anySelected =
      historyForm.medicalHistory.length > 0 ||
      historyForm.familyHistory.length > 0 ||
      historyForm.allergies.length > 0 ||
      historyForm.pastSurgeries.length > 0 ||
      historyForm.drugHistory.length > 0 ||
      historyForm.lifestyle.length > 0;

    if (!anySelected) {
      Alert.alert('Empty', 'Please select at least one option for medical history.');
      return;
    }

    const newHistory: PatientMedicalHistory = {
      patientId: selectedPatient.patientId,
      medicalHistory: historyForm.medicalHistory.filter(item => item !== 'Other'),
      medicalHistoryOther: historyForm.medicalHistoryOther.trim() || undefined,
      familyHistory: historyForm.familyHistory.filter(item => item !== 'Other'),
      familyHistoryOther: historyForm.familyHistoryOther.trim() || undefined,
      allergies: historyForm.allergies.filter(item => item !== 'Other'),
      allergiesOther: historyForm.allergiesOther.trim() || undefined,
      pastSurgeries: historyForm.pastSurgeries.filter(item => item !== 'Other'),
      pastSurgeriesOther: historyForm.pastSurgeriesOther.trim() || undefined,
      drugHistory: historyForm.drugHistory.filter(item => item !== 'Other'),
      drugHistoryOther: historyForm.drugHistoryOther.trim() || undefined,
      lifestyle: historyForm.lifestyle.filter(item => item !== 'Other'),
      lifestyleOther: historyForm.lifestyleOther.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    setMedicalHistories((prev) => ({ ...prev, [selectedPatient.patientId]: newHistory }));
    setShowAddHistoryModal(false);

    // Ask if they want to add a SOAP record
    Alert.alert(
      'Success',
      'Medical history saved successfully. Would you like to add a medical record (SOAP) now?',
      [
        { text: 'Not Now', style: 'cancel' },
        { 
          text: 'Add SOAP Record', 
          onPress: () => {
            setSoapForm({
              subjective: '',
              objective: '',
              assessment: '',
              plan: '',
              bloodPressure: '',
              heartRate: '',
              temperature: '',
              weight: '',
              notes: '',
            });
            setShowSOAPModal(true);
          }
        },
      ]
    );
  };

  // Save SOAP medical record
  const handleSaveSOAPRecord = () => {
    if (!selectedPatient) {
      Alert.alert('No patient selected', 'Please select a patient first.');
      return;
    }
    if (!soapForm.subjective || !soapForm.assessment || !soapForm.plan) {
      Alert.alert('Missing fields', 'Please fill Subjective, Assessment (diagnosis) and Plan.');
      return;
    }

    const id = `rec-${Math.random().toString(36).substr(2, 9)}`;
    const date = new Date().toISOString().split('T')[0];
    const newRec: MedicalRecord = {
      id,
      patientId: selectedPatient.patientId,
      patientName: selectedPatient.patientName,
      doctorId: 'doctor-1',
      doctorName: 'Dr. Demo',
      date,
      title: soapForm.assessment || 'Visit',
      summary: soapForm.subjective + (soapForm.notes ? `\nNotes: ${soapForm.notes}` : ''),
      diagnosis: soapForm.assessment,
      treatment: soapForm.plan,
      medications: [],
      progressPhotos: [],
      vitals: {
        bloodPressure: soapForm.bloodPressure || '',
        heartRate: soapForm.heartRate || '',
        temperature: soapForm.temperature || '',
        weight: soapForm.weight || '',
      },
      allergies: medicalHistories[selectedPatient.patientId]?.allergies || [],
      bloodType: 'Unknown',
    };

    MOCK_MEDICAL_RECORDS.push(newRec);

    setShowSOAPModal(false);
    Alert.alert('Success', 'Medical record saved (mock).');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: selectedPatient ? `${selectedPatient.patientName}'s Medical History` : 'Patient Medical History',
          headerStyle: { backgroundColor: Colors.secondary },
          headerTintColor: Colors.white,
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (selectedPatient) {
                  setSelectedPatient(null);
                  setShowPatientSelector(true);
                } else {
                  router.back();
                }
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={Colors.white} />
            </Pressable>
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable onPress={() => {
                if (!selectedPatient) {
                  Alert.alert('No patient selected', 'Please select a patient first.');
                  return;
                }
                setSoapForm({
                  subjective: '',
                  objective: '',
                  assessment: '',
                  plan: '',
                  bloodPressure: '',
                  heartRate: '',
                  temperature: '',
                  weight: '',
                  notes: '',
                });
                setShowSOAPModal(true);
              }} style={[styles.headerRightButton, { backgroundColor: Colors.secondary }]}>
                <FileText size={18} color={Colors.white} />
                <Text style={styles.headerRightText}>Add SOAP</Text>
              </Pressable>
              
              <Pressable onPress={onAddMedicalRecordPress} style={styles.headerRightButton}>
                <Plus size={18} color={Colors.white} />
                <Text style={styles.headerRightText}>Add Record</Text>
              </Pressable>
            </View>
          ),
        }}
      />

      <View style={styles.container}>
        {selectedPatient && (
          <>
            <View style={styles.patientHeader}>
              <View style={styles.patientInfo}>
                <View style={styles.avatarCircle}>
                  <User size={28} color={Colors.white} />
                </View>
                <View>
                  <Text style={styles.patientNameText}>{selectedPatient.patientName}</Text>
                  <Text style={styles.patientIdText}>ID: {selectedPatient.patientId}</Text>
                </View>
              </View>
              <Pressable style={styles.addButton} onPress={onAddMedicalRecordPress}>
                <Plus size={20} color={Colors.white} />
                <Text style={styles.addButtonText}>Add Medical Record</Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.content}
              contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionTitle}>Medical History ({patientRecords.length} records)</Text>

              {patientRecords.length === 0 ? (
                <View style={styles.emptyState}>
                  <FileText size={64} color={Colors.text.secondary} />
                  <Text style={styles.emptyText}>No medical records yet</Text>
                  <Text style={styles.emptySubtext}>Add the first medical record for this patient</Text>
                </View>
              ) : (
                patientRecords.map((rec) => (
                  <Pressable key={rec.id} style={styles.recordCard} onPress={() => setSelectedRecord(rec)}>
                    <View style={styles.cardHeader}>
                      <View style={styles.dateContainer}>
                        <Calendar size={14} color={Colors.text.secondary} />
                        <Text style={styles.dateText}>
                          {new Date(rec.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                      {rec.allergies?.length > 0 && <AlertCircle size={18} color={Colors.status.error} />}
                    </View>

                    <Text style={styles.recordTitle}>{rec.title}</Text>

                    <View style={styles.diagnosisRow}>
                      <Stethoscope size={16} color={Colors.primary} />
                      <Text style={styles.diagnosis}>{rec.diagnosis}</Text>
                    </View>

                    <View style={styles.vitalsRow}>
                      <View style={styles.vitalItem}>
                        <Activity size={14} color={Colors.secondary} />
                        <Text style={styles.vitalText}>{rec.vitals.bloodPressure}</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Heart size={14} color={Colors.status.error} />
                        <Text style={styles.vitalText}>{rec.vitals.heartRate}</Text>
                      </View>
                      <View style={styles.vitalItem}>
                        <Thermometer size={14} color={Colors.primary} />
                        <Text style={styles.vitalText}>{rec.vitals.temperature}</Text>
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
          </>
        )}
      </View>

      {/* Patient selector */}
      <Modal
        visible={showPatientSelector}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPatientSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Patient</Text>
              <Pressable
                onPress={() => {
                  setShowPatientSelector(false);
                  router.back();
                }}
                style={styles.closeButton}
              >
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <View style={styles.modalSection}>
              <View style={styles.searchContainer}>
                <Search size={20} color={Colors.text.secondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search patient name..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={Colors.text.secondary}
                />
              </View>
            </View>

            <FlatList
              data={filteredPatients}
              keyExtractor={(item) => item.patientId}
              contentContainerStyle={styles.patientListContent}
              renderItem={({ item }) => (
                <Pressable style={styles.patientCard} onPress={() => handleSelectPatient(item)}>
                  <View style={styles.patientCardContent}>
                    <View style={styles.patientCardAvatar}>
                      <User size={24} color={Colors.white} />
                    </View>
                    <View style={styles.patientCardInfo}>
                      <Text style={styles.patientCardName}>{item.patientName}</Text>
                      <Text style={styles.patientCardId}>{item.patientId}</Text>
                    </View>
                  </View>
                  <View style={styles.recordCountBadge}>
                    <Text style={styles.recordCountText}>{item.recordCount}</Text>
                  </View>
                </Pressable>
              )}
              ListEmptyComponent={
                <View style={styles.emptySearchState}>
                  <User size={48} color={Colors.text.secondary} />
                  <Text style={styles.emptySearchText}>No patients found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>

      {/* Selected record modal */}
      <Modal visible={!!selectedRecord} animationType="slide" transparent onRequestClose={() => setSelectedRecord(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Medical Record Details</Text>
              <Pressable onPress={() => setSelectedRecord(null)} style={styles.closeButton}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecord && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Selected Visit</Text>
                    <View style={styles.infoGrid}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Date</Text>
                        <Text style={styles.infoValue}>{new Date(selectedRecord.date).toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Doctor</Text>
                        <Text style={styles.infoValue}>{selectedRecord.doctorName}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Diagnosis</Text>
                        <Text style={styles.infoValue}>{selectedRecord.diagnosis}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Blood Type</Text>
                        <Text style={styles.infoValue}>{selectedRecord.bloodType}</Text>
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

                  {selectedRecord.allergies?.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>Allergies</Text>
                      <View style={styles.allergyList}>
                        {selectedRecord.allergies.map((a, i) => (
                          <View key={i} style={styles.allergyTag}>
                            <AlertCircle size={14} color={Colors.status.error} />
                            <Text style={styles.allergyTagText}>{a}</Text>
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
                    <Text style={styles.sectionLabel}>Treatment Plan</Text>
                    <Text style={styles.sectionText}>{selectedRecord.treatment}</Text>
                  </View>

                  {selectedRecord.medications?.length > 0 && (
                    <View style={styles.modalSection}>
                      <Text style={styles.sectionLabel}>Medications</Text>
                      {selectedRecord.medications.map((m) => (
                        <View key={m.id} style={styles.medicationCard}>
                          <View style={styles.medicationHeader}>
                            <Pill size={18} color={Colors.secondary} />
                            <Text style={styles.medicationName}>{m.name}</Text>
                          </View>
                          <Text style={styles.medicationDosage}>{m.dosage}</Text>
                          {m.notes && <Text style={styles.medicationNotes}>{m.notes}</Text>}
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Previous Appointments + their linked report(s) */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>Previous Appointments</Text>
                    {patientAppointments.length === 0 ? (
                      <Text style={styles.sectionText}>No appointments found for this patient.</Text>
                    ) : (
                      patientAppointments.map((apt) => {
                        const reportsForApt = getReportsForAppointment(apt, patientRecords);
                        return (
                          <View key={apt.id} style={styles.appointmentCard}>
                            <View style={styles.cardHeader}>
                              <Text style={styles.patientCardName}>{apt.patientName}</Text>
                              <Text style={styles.dateText}>
                                {new Date(apt.date).toLocaleDateString()} · {apt.time}
                              </Text>
                            </View>
                            <Text style={styles.sectionText}>
                              <Text style={{ fontWeight: '700' }}>Specialty: </Text>
                              {apt.specialty}
                            </Text>
                            <Text style={styles.sectionText}>
                              <Text style={{ fontWeight: '700' }}>Status: </Text>
                              {apt.status}
                            </Text>
                            {apt.notes && (
                              <Text style={styles.sectionText}>
                                <Text style={{ fontWeight: '700' }}>Notes: </Text>
                                {apt.notes}
                              </Text>
                            )}

                            {/* Linked report(s) for this appointment */}
                            <View style={{ marginTop: 8 }}>
                              {reportsForApt.length === 0 ? (
                                <Text style={[styles.sectionText, { fontStyle: 'italic' as const }]}>
                                  No report for this appointment.
                                </Text>
                              ) : (
                                reportsForApt.map((r) => (
                                  <View key={r.id} style={styles.recordSummaryCard}>
                                    <Text style={styles.recordSummaryTitle}>
                                      {r.title} — {new Date(r.date).toLocaleDateString()}
                                    </Text>
                                    <Text style={styles.sectionText}>
                                      <Text style={{ fontWeight: '700' }}>Diagnosis: </Text>
                                      {r.diagnosis}
                                    </Text>
                                    <Text style={styles.sectionText}>
                                      <Text style={{ fontWeight: '700' }}>Treatment: </Text>
                                      {r.treatment}
                                    </Text>
                                    {r.medications?.length > 0 && (
                                      <View style={{ marginTop: 8 }}>
                                        <Text style={[styles.sectionLabel, { marginBottom: 8, textTransform: 'none' as const }]}>
                                          Medications
                                        </Text>
                                        {r.medications.map((m) => (
                                          <Text key={m.id} style={styles.sectionText}>
                                            • {m.name} — {m.dosage}
                                            {m.notes ? ` (${m.notes})` : ''}
                                          </Text>
                                        ))}
                                      </View>
                                    )}
                                    {r.allergies?.length > 0 && (
                                      <View style={{ marginTop: 8 }}>
                                        <Text
                                          style={[
                                            styles.sectionLabel,
                                            { marginBottom: 8, textTransform: 'none' as const },
                                          ]}
                                        >
                                          Allergies
                                        </Text>
                                        <Text style={styles.sectionText}>{r.allergies.join(', ')}</Text>
                                      </View>
                                    )}
                                  </View>
                                ))
                              )}
                            </View>
                          </View>
                        );
                      })
                    )}
                  </View>

                  {/* All Visits (full history) */}
                  <View style={styles.modalSection}>
                    <Text style={styles.sectionLabel}>All Visits (full history)</Text>
                    {patientRecords.map((r) => (
                      <View key={r.id} style={styles.recordSummaryCard}>
                        <View style={styles.cardHeader}>
                          <Text style={styles.recordSummaryTitle}>{r.title}</Text>
                          <Text style={styles.dateText}>{new Date(r.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.sectionText}>
                          <Text style={{ fontWeight: '700' }}>Diagnosis: </Text>
                          {r.diagnosis}
                        </Text>
                        <Text style={styles.sectionText}>
                          <Text style={{ fontWeight: '700' }}>Treatment: </Text>
                          {r.treatment}
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Medical History modal - now with choice-based options */}
      <Modal
        visible={showAddHistoryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddHistoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20, maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Medical History</Text>
              <Pressable onPress={() => setShowAddHistoryModal(false)} style={styles.closeButton}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Medical History Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Medical History</Text>
                <MultiChoiceList
                  options={medicalHistoryOptions}
                  selected={historyForm.medicalHistory}
                  onToggle={handleMedicalHistoryToggle}
                />
                {historyForm.medicalHistory.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Medical History</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.medicalHistoryOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, medicalHistoryOther: t }))}
                      autoFocus
                    />
                  </View>
                )}
              </View>

              {/* Family History Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Family History</Text>
                <MultiChoiceList
                  options={familyHistoryOptions}
                  selected={historyForm.familyHistory}
                  onToggle={handleFamilyHistoryToggle}
                />
                {historyForm.familyHistory.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Family History</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.familyHistoryOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, familyHistoryOther: t }))}
                    />
                  </View>
                )}
              </View>

              {/* Allergies Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Allergies</Text>
                <MultiChoiceList
                  options={allergyOptions}
                  selected={historyForm.allergies}
                  onToggle={handleAllergiesToggle}
                />
                {historyForm.allergies.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Allergies</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.allergiesOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, allergiesOther: t }))}
                    />
                  </View>
                )}
              </View>

              {/* Past Surgeries Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Past Surgeries</Text>
                <MultiChoiceList
                  options={pastSurgeriesOptions}
                  selected={historyForm.pastSurgeries}
                  onToggle={handlePastSurgeriesToggle}
                />
                {historyForm.pastSurgeries.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Past Surgeries</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.pastSurgeriesOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, pastSurgeriesOther: t }))}
                    />
                  </View>
                )}
              </View>

              {/* Drug History Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Drug History</Text>
                <MultiChoiceList
                  options={drugHistoryOptions}
                  selected={historyForm.drugHistory}
                  onToggle={handleDrugHistoryToggle}
                />
                {historyForm.drugHistory.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Drug History</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.drugHistoryOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, drugHistoryOther: t }))}
                    />
                  </View>
                )}
              </View>

              {/* Lifestyle Section */}
              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Lifestyle</Text>
                <MultiChoiceList
                  options={lifestyleOptions}
                  selected={historyForm.lifestyle}
                  onToggle={handleLifestyleToggle}
                />
                {historyForm.lifestyle.includes('Other') && (
                  <View style={{ marginTop: 16 }}>
                    <Text style={[styles.inputLabel, { color: Colors.primary }]}>Other Lifestyle Details</Text>
                    <TextInput
                      style={[styles.input, { borderColor: Colors.primary }]}
                      placeholder="Please specify..."
                      value={historyForm.lifestyleOther}
                      onChangeText={(t) => setHistoryForm((p) => ({ ...p, lifestyleOther: t }))}
                    />
                  </View>
                )}
              </View>

              <View style={styles.modalSection}>
                <Pressable style={styles.saveButton} onPress={handleSaveMedicalHistory}>
                  <Text style={styles.saveButtonText}>Save Medical History</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SOAP Medical Record modal */}
      <Modal visible={showSOAPModal} animationType="slide" transparent onRequestClose={() => setShowSOAPModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medical Record (SOAP)</Text>
              <Pressable onPress={() => setShowSOAPModal(false)} style={styles.closeButton}>
                <X size={24} color={Colors.text.primary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>S — Subjective</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Patient complaints, duration, symptoms"
                  value={soapForm.subjective}
                  onChangeText={(t) => setSoapForm({ ...soapForm, subjective: t })}
                  multiline
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>O — Objective</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Examination findings, visuals, tests"
                  value={soapForm.objective}
                  onChangeText={(t) => setSoapForm({ ...soapForm, objective: t })}
                  multiline
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>A — Assessment</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Diagnosis"
                  value={soapForm.assessment}
                  onChangeText={(t) => setSoapForm({ ...soapForm, assessment: t })}
                />
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionLabel}>P — Plan</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Treatment plan, procedures, follow-up notes"
                  value={soapForm.plan}
                  onChangeText={(t) => setSoapForm({ ...soapForm, plan: t })}
                  multiline
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
                      value={soapForm.bloodPressure}
                      onChangeText={(t) => setSoapForm({ ...soapForm, bloodPressure: t })}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Heart Rate</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="72 bpm"
                      value={soapForm.heartRate}
                      onChangeText={(t) => setSoapForm({ ...soapForm, heartRate: t })}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Temperature</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="98.6°F"
                      value={soapForm.temperature}
                      onChangeText={(t) => setSoapForm({ ...soapForm, temperature: t })}
                    />
                  </View>
                  <View style={styles.vitalsInputItem}>
                    <Text style={styles.inputLabel}>Weight</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="65 kg"
                      value={soapForm.weight}
                      onChangeText={(t) => setSoapForm({ ...soapForm, weight: t })}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.inputLabel}>Optional Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Any extra notes..."
                  value={soapForm.notes}
                  onChangeText={(t) => setSoapForm({ ...soapForm, notes: t })}
                  multiline
                />
              </View>

              <View style={styles.modalSection}>
                <Pressable style={styles.saveButton} onPress={handleSaveSOAPRecord}>
                  <Text style={styles.saveButtonText}>Save SOAP Record</Text>
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
  container: { flex: 1, backgroundColor: Colors.offWhite },
  backButton: { marginRight: 8 },
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
  patientInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientNameText: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.primary },
  patientIdText: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addButtonText: { color: Colors.white, fontSize: 14, fontWeight: '600' as const },
  content: { flex: 1 },
  scrollContent: { padding: 20 },
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
  emptyText: { fontSize: 18, fontWeight: '600' as const, color: Colors.text.primary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Colors.text.secondary, marginTop: 4 },
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
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '600' as const },
  recordTitle: { fontSize: 16, fontWeight: '700' as const, color: Colors.text.primary, marginBottom: 8 },
  diagnosisRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  diagnosis: { fontSize: 14, color: Colors.primary, fontWeight: '600' as const },
  vitalsRow: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  vitalItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vitalText: { fontSize: 12, color: Colors.text.secondary, fontWeight: '500' as const },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  viewDetailsText: { fontSize: 13, color: Colors.secondary, fontWeight: '600' as const },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
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
  modalTitle: { fontSize: 20, fontWeight: '700' as const, color: Colors.text.primary },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSection: { paddingHorizontal: 20, paddingTop: 20 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoItem: { width: '47%' },
  infoLabel: { fontSize: 12, color: Colors.text.secondary, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600' as const, color: Colors.text.primary },
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalCard: {
    width: '47%',
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  vitalLabel: { fontSize: 12, color: Colors.text.secondary, textAlign: 'center' },
  vitalValue: { fontSize: 15, fontWeight: '700' as const, color: Colors.text.primary },
  allergyList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  allergyTagText: { fontSize: 13, fontWeight: '600' as const, color: Colors.status.error },
  sectionText: { fontSize: 15, lineHeight: 22, color: Colors.text.primary },
  medicationCard: { backgroundColor: Colors.offWhite, borderRadius: 12, padding: 16, marginBottom: 12 },
  medicationHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  medicationName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text.primary },
  medicationDosage: { fontSize: 14, color: Colors.text.primary, marginBottom: 4 },
  medicationNotes: { fontSize: 13, color: Colors.text.secondary, fontStyle: 'italic' as const },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text.primary },
  patientListContent: { paddingHorizontal: 20, paddingVertical: 16 },
  patientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow.small,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  patientCardContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  patientCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientCardInfo: { flex: 1 },
  patientCardName: { fontSize: 15, fontWeight: '700' as const, color: Colors.text.primary },
  patientCardId: { fontSize: 12, color: Colors.text.secondary, marginTop: 2 },
  recordCountBadge: { backgroundColor: Colors.secondary, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  recordCountText: { fontSize: 13, fontWeight: '700' as const, color: Colors.white },
  emptySearchState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptySearchText: { fontSize: 16, fontWeight: '600' as const, color: Colors.text.secondary, marginTop: 16 },
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
  textArea: { minHeight: 100, textAlignVertical: 'top' as const },
  vitalsInputGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalsInputItem: { width: '47%' },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: Colors.white, fontSize: 16, fontWeight: '700' as const },
  recordSummaryCard: { backgroundColor: Colors.offWhite, borderRadius: 12, padding: 12, marginBottom: 12 },
  recordSummaryTitle: { fontSize: 15, fontWeight: '700' as const, color: Colors.text.primary },
  appointmentCard: { backgroundColor: Colors.offWhite, borderRadius: 12, padding: 12, marginBottom: 12 },

  /* Choice styles */
  choiceItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border.light,
    marginRight: 8,
    marginBottom: 8,
  },
  choiceItemSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  choiceText: {
    color: Colors.text.primary,
    fontSize: 14,
  },
  choiceTextSelected: {
    color: Colors.white,
  },

  /* Header button styles */
  headerRightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    marginRight: 8,
  },
  headerRightText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
});