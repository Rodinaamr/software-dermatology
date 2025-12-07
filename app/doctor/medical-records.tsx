import DrugSearchDropdown from '@/components/ui/drug-search-dropdown';
import Colors from '@/constants/colors';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import {
  AlertCircle,
  Brain,
  Calendar,
  Check,
  ChevronRight,
  Ear,
  FileText,
  History,
  Mic,
  MicOff,
  Pill,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  Type,
  Upload,
  User,
  UserPlus,
  Volume2,
  X
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ========== MOCK OCR/ACR/NLP SERVICES ==========
const extractPrescriptionText = async (imageUri: string): Promise<string> => {
  console.log('OCR: Extracting text from prescription image', imageUri);
  
  const prescriptions = [
    `PRESCRIPTION\nPatient: Sarah Johnson\nDate: ${new Date().toISOString().split('T')[0]}\nDoctor: Dr. Wahid Lotfy\nClinic: Skin & Laser Center\n\nMedications:\n1. Clindamycin ${Math.random() > 0.5 ? '1%' : '2%'} Gel\n   Apply thin layer twice daily\n\n2. Doxycycline ${Math.random() > 0.5 ? '100mg' : '50mg'}\n   Take ${Math.random() > 0.5 ? '1' : '2'} capsule daily with food\n\n3. ${Math.random() > 0.5 ? 'Adapalene' : 'Tretinoin'} ${Math.random() > 0.5 ? '0.1%' : '0.05%'} Gel\n   Apply at bedtime\n\nFollow up in ${Math.random() > 0.5 ? '4' : '6'} weeks\nSignature: Dr. Wahid Lotfy`,

    `PRESCRIPTION FORM\nPatient: Michael Chen\nDate: ${new Date().toISOString().split('T')[0]}\nDiagnosis: ${Math.random() > 0.5 ? 'Acne Vulgaris' : 'Psoriasis'}\n\nRx:\n- ${Math.random() > 0.5 ? 'Metronidazole' : 'Erythromycin'} ${Math.random() > 0.5 ? '0.75%' : '2%'} Cream\n  Apply to affected areas daily\n\n- ${Math.random() > 0.5 ? 'Isotretinoin' : 'Spironolactone'} ${Math.random() > 0.5 ? '20mg' : '50mg'}\n  Take with fatty meal\n\n- Sunscreen SPF ${Math.random() > 0.5 ? '30' : '50'}+\n  Apply every morning\n\nDr. Wahid Lotfy\nMED-LICENSE-12345`,

    `MEDICAL PRESCRIPTION\nPatient: Emma Wilson\nDate: ${new Date().toISOString().split('T')[0]}\n\nPrescribed:\n• ${Math.random() > 0.5 ? 'Hydrocortisone' : 'Betamethasone'} ${Math.random() > 0.5 ? '1%' : '2.5%'} Cream\n  Apply sparingly to affected area\n\n• ${Math.random() > 0.5 ? 'Cetirizine' : 'Loratadine'} ${Math.random() > 0.5 ? '10mg' : '5mg'}\n  Take once daily for itching\n\n• ${Math.random() > 0.5 ? 'Fusidic Acid' : 'Mupirocin'} Ointment\n  For secondary infection\n\nInstructions: ${Math.random() > 0.5 ? 'Avoid sun exposure' : 'Use moisturizer regularly'}\nFollow-up: ${Math.random() > 0.5 ? '2 weeks' : '1 month'}`
  ];
  
  return prescriptions[Math.floor(Math.random() * prescriptions.length)];
};

const parsePrescriptionData = (text: string) => {
  const medications: any[] = [];
  let doctorName = '';
  let date = '';
  let clinic = '';
  
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.includes('Doctor:')) {
      doctorName = line.replace('Doctor:', '').trim();
    } else if (line.includes('Dr.')) {
      doctorName = line.trim();
    }
    if (line.includes('Date:')) {
      date = line.replace('Date:', '').trim();
    }
    if (line.includes('Clinic:')) {
      clinic = line.replace('Clinic:', '').trim();
    }
    
    if (line.match(/\d+%|\d+mg|Cream|Gel|Ointment|Tablet|Capsule/)) {
      const parts = line.split(/\s+/);
      if (parts.length > 1) {
        const name = parts[0];
        const dosage = line.match(/\d+%|\d+mg/)?.[0] || '';
        medications.push({
          name,
          dosage,
          instructions: line.trim(),
          type: line.includes('Cream') || line.includes('Gel') || line.includes('Ointment') ? 'Topical' : 'Oral'
        });
      }
    }
  });
  
  return {
    doctorName: doctorName || 'Dr. Wahid Lotfy',
    clinic: clinic || 'Skin & Laser Center',
    date: date || new Date().toISOString().split('T')[0],
    medications,
    rawText: text
  };
};

const analyzePrescription = (text: string, patientAllergies: string[] = [], patientGender: string = '') => {
  const warnings: string[] = [];
  const medications: any[] = [];
  const recommendations: string[] = [];
  
  const medRegex = /(\b\w+\b)\s+(\d+%|\d+mg|\d+\s*mg)/gi;
  const matches = [...text.matchAll(medRegex)];
  
  matches.forEach(match => {
    medications.push({
      name: match[1],
      dosage: match[2],
      foundAt: match.index
    });
  });
  
  medications.forEach(med => {
    const medName = med.name.toLowerCase();
    
    patientAllergies.forEach(allergy => {
      const allergyLower = allergy.toLowerCase();
      if (allergyLower.includes('penicillin') && medName.includes('penicillin')) {
        warnings.push(`⚠️ ${med.name} contraindicated - Patient has Penicillin allergy`);
      }
      if (allergyLower.includes('sulfa') && medName.includes('sulfa')) {
        warnings.push(`⚠️ ${med.name} contraindicated - Patient has Sulfa allergy`);
      }
      if ((allergyLower.includes('tetracycline') || allergyLower.includes('doxycycline')) && 
          (medName.includes('doxycycline') || medName.includes('tetracycline'))) {
        warnings.push(`⚠️ ${med.name} contraindicated - Patient has Tetracycline allergy`);
      }
    });
    
    if (medName.includes('isotretinoin') || medName.includes('accutane')) {
      warnings.push('⚠️ Isotretinoin requires monthly pregnancy tests');
      warnings.push('⚠️ Avoid pregnancy for 1 month after treatment');
      warnings.push('⚠️ Monitor liver function monthly');
      recommendations.push('Baseline lipid profile required');
    }
    
    if (medName.includes('doxycycline') || medName.includes('tetracycline') || medName.includes('minocycline')) {
      warnings.push('☀️ Severe photosensitivity risk - Use SPF 50+ sunscreen');
      warnings.push('💊 Take with food to prevent nausea');
      if (text.toLowerCase().includes('30') || text.toLowerCase().includes('long')) {
        warnings.push('⚠️ Long-term use requires liver function monitoring');
      }
    }
    
    if (medName.includes('tretinoin') || medName.includes('retinoid') || medName.includes('adapalene')) {
      warnings.push('☀️ Increases sun sensitivity - Daily sunscreen mandatory');
      warnings.push('⚠️ Initial redness and peeling expected');
      recommendations.push('Start with every other day application');
    }
    
    if (medName.includes('spironolactone')) {
      warnings.push('⚠️ Monitor potassium levels regularly');
      warnings.push('⚠️ Contraindicated in pregnancy');
      if (patientGender.toLowerCase().includes('male')) {
        warnings.push('⚠️ May cause gynecomastia in males');
      }
    }
    
    if (medName.includes('clindamycin') || medName.includes('erythromycin')) {
      warnings.push('💊 Complete full course even if symptoms improve');
      if (text.toLowerCase().includes('gel') || text.toLowerCase().includes('cream')) {
        recommendations.push('Apply to clean, dry skin');
      }
    }
  });
  
  const durationMatch = text.match(/(\d+)\s*(week|day|month)/i);
  if (durationMatch) {
    const num = parseInt(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    
    if (unit === 'week' && num > 8) {
      warnings.push(`📅 Extended ${num}-week treatment - Monitor for side effects`);
    }
    if (unit === 'month' && num > 2) {
      warnings.push(`📅 ${num}-month regimen - Regular follow-up needed`);
    }
  }
  
  const hasSunWarning = text.toLowerCase().includes('sun') || 
                       text.toLowerCase().includes('uv') || 
                       medications.some(m => 
                         ['doxycycline', 'tetracycline', 'tretinoin', 'isotretinoin'].includes(m.name.toLowerCase())
                       );
  
  if (hasSunWarning) {
    warnings.push('☀️ Sun protection advised with current medications');
  }
  
  if (patientGender.toLowerCase().includes('female') || 
      patientGender.toLowerCase().includes('woman')) {
    const teratogenicMeds = medications.filter(m => 
      ['isotretinoin', 'spironolactone', 'methotrexate'].includes(m.name.toLowerCase())
    );
    teratogenicMeds.forEach(med => {
      warnings.push(`⚠️ ${med.name} is teratogenic - Pregnancy test required before starting`);
    });
  }
  
  const randomWarnings = [
    '💧 Maintain adequate hydration',
    '🍽️ Take with meals if GI upset occurs',
    '📊 Monitor for symptom improvement after 2 weeks',
    '🔄 Rotate application sites for topical medications',
    '🧴 Use fragrance-free moisturizer'
  ];
  
  if (Math.random() > 0.5 && recommendations.length < 3) {
    recommendations.push(randomWarnings[Math.floor(Math.random() * randomWarnings.length)]);
  }
  
  return {
    warnings: [...new Set(warnings)],
    medications,
    recommendations: [...new Set(recommendations)],
    severity: warnings.length > 3 ? 'HIGH' : warnings.length > 1 ? 'MEDIUM' : 'LOW',
    confidence: 0.75 + (Math.random() * 0.2),
    summary: `Found ${medications.length} medication(s)`,
    requiresMonitoring: warnings.length > 0,
    extractedFrom: `${text.split('\n').length} lines of text`
  };
};

const validateMedicalDocument = async (imageUri: string): Promise<any> => {
  console.log('ACR: Validating medical document', imageUri);
  
  const documentTypes = [
    { type: 'prescription', confidence: 0.9 },
    { type: 'doctor_note', confidence: 0.8 },
    { type: 'lab_result', confidence: 0.85 },
    { type: 'referral', confidence: 0.75 }
  ];
  
  const randomType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
  
  const hasSignature = Math.random() > 0.3;
  const hasDate = Math.random() > 0.2;
  const hasDoctorInfo = Math.random() > 0.1;
  const hasPatientInfo = Math.random() > 0.25;
  
  const clarityScore = Math.floor(Math.random() * 4) + 6;
  const confidence = randomType.confidence + (Math.random() * 0.1 - 0.05);

  const recommendations: string[] = [];
  if (hasSignature) recommendations.push('✓ Doctor signature present');
  else recommendations.push('✗ Missing doctor signature');
  
  if (hasDate) recommendations.push('✓ Date included');
  else recommendations.push('✗ Missing date');
  
  if (hasDoctorInfo) recommendations.push('✓ Doctor information complete');
  else recommendations.push('✗ Incomplete doctor information');
  
  if (hasPatientInfo) recommendations.push('✓ Patient information found');
  else recommendations.push('✗ Missing patient details');
  
  if (clarityScore >= 8) recommendations.push('✓ Excellent document clarity');
  else if (clarityScore >= 6) recommendations.push('⚠️ Acceptable clarity');
  else recommendations.push('⚠️ Poor clarity - consider rescanning');
  
  return {
    isValid: hasSignature && hasDate && hasDoctorInfo && hasPatientInfo,
    documentType: randomType.type,
    hasSignature,
    hasDate,
    hasDoctorInfo,
    hasPatientInfo,
    clarityScore,
    confidence: Math.min(0.99, confidence),
    recommendations,
    validationScore: Math.floor(
      (hasSignature ? 25 : 0) + 
      (hasDate ? 25 : 0) + 
      (hasDoctorInfo ? 25 : 0) + 
      (hasPatientInfo ? 25 : 0)
    )
  };
};

// ========== TYPES ==========
interface Drug {
  activeingredient: string;
  tradename: string;
  company: string;
  form: string;
  new_price: string;
  id: string;
  pharmacology?: string;
  route?: string;
  group?: string;
  created?: string;
  updated?: string;
}

interface PrescriptionDrug {
  drug: Drug;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  isNewPatient: boolean;
}

interface MedicalHistory {
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
  lastUpdated: string;
}

interface VisitRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
}

interface MedicalRecord {
  id: string;
  date: string;
  symptoms: string[];
  symptomsOther?: string;
  findings: string[];
  findingsOther?: string;
  diagnosis: string[];
  diagnosisOther?: string;
  prescription: string[];
  prescriptionOther?: string;
  prescribedDrugs?: PrescriptionDrug[];
}

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

// ========== STATE MANAGEMENT ==========
type AppState = {
  patients: Patient[];
  medicalHistories: Record<string, MedicalHistory>;
  visitRecords: Record<string, VisitRecord[]>;
  medicalRecords: Record<string, MedicalRecord[]>;
  patientProgress: Record<string, ProgressPhoto[]>;
};

// ========== INITIAL DATA ==========
const INITIAL_STATE: AppState = {
  patients: [
    { id: '1', name: 'Sarah Johnson', age: 32, gender: 'Female', bloodType: 'A+', isNewPatient: false },
    { id: '2', name: 'Michael Chen', age: 45, gender: 'Male', bloodType: 'O+', isNewPatient: false },
    { id: '3', name: 'Emma Wilson', age: 28, gender: 'Female', bloodType: 'B+', isNewPatient: true },
    { id: '4', name: 'David Brown', age: 52, gender: 'Male', bloodType: 'AB+', isNewPatient: true },
  ],
  medicalHistories: {
    '1': {
      medicalHistory: ['Hypertension', 'Seasonal Allergies'],
      medicalHistoryOther: '',
      familyHistory: ['Psoriasis (Mother)', 'Melanoma (Father)'],
      familyHistoryOther: '',
      allergies: ['Penicillin', 'Latex'],
      allergiesOther: '',
      pastSurgeries: [],
      pastSurgeriesOther: '',
      drugHistory: ['Lisinopril 10mg daily'],
      drugHistoryOther: '',
      lifestyle: ['Non-smoker', 'Regular exercise'],
      lifestyleOther: '',
      lastUpdated: '2024-01-20',
    },
    '2': {
      medicalHistory: ['Type 2 Diabetes'],
      medicalHistoryOther: '',
      familyHistory: ['Diabetes (Both parents)'],
      familyHistoryOther: '',
      allergies: ['Sulfa drugs'],
      allergiesOther: '',
      pastSurgeries: [],
      pastSurgeriesOther: '',
      drugHistory: ['Metformin 500mg'],
      drugHistoryOther: '',
      lifestyle: ['Ex-smoker (quit 2018)'],
      lifestyleOther: '',
      lastUpdated: '2024-01-18',
    },
  },
  visitRecords: {
    '1': [
      { id: 'v1', date: '2024-01-20', diagnosis: 'Psoriasis', treatment: 'Topical steroids' },
      { id: 'v2', date: '2023-11-15', diagnosis: 'Acne', treatment: 'Topical retinoid' },
    ],
    '2': [
      { id: 'v3', date: '2024-01-18', diagnosis: 'Alopecia', treatment: 'Steroid injections' },
    ],
    '3': [],
    '4': [],
  },
  medicalRecords: {
    '1': [
      { 
        id: 'm1', 
        date: '2024-01-20', 
        symptoms: ['Itching', 'Redness'], 
        symptomsOther: '',
        findings: ['Erythema', 'Scales'], 
        findingsOther: '',
        diagnosis: ['Psoriasis'], 
        diagnosisOther: '',
        prescription: ['Topical cream', 'Follow-up 2w'], 
        prescriptionOther: '',
      },
    ],
    '2': [
      { 
        id: 'm2', 
        date: '2024-01-18', 
        symptoms: ['Hair loss'], 
        symptomsOther: '',
        findings: ['Circular patches'], 
        findingsOther: '',
        diagnosis: ['Alopecia'], 
        diagnosisOther: '',
        prescription: ['Steroid injections'], 
        prescriptionOther: '',
      },
    ],
    '3': [],
    '4': [],
  },
  patientProgress: {
    '1': [
      {
        id: 'p1',
        date: '2024-01-20',
        title: 'Psoriasis Treatment Progress',
        description: 'Initial treatment vs after 4 weeks',
        beforeImage: 'https://example.com/before.jpg',
        afterImage: 'https://example.com/after.jpg',
        notes: 'Significant improvement in erythema and scaling',
        uploadedBy: 'Dr. Wahid Lotfy'
      }
    ]
  }
};

// ========== OPTIONS ==========
const MEDICAL_HISTORY_OPTIONS = {
  medicalHistory: ['Hypertension', 'Diabetes', 'Asthma', 'Thyroid', 'Heart Disease', 'Autoimmune', 'None', 'Other'],
  allergies: ['Penicillin', 'Sulfa', 'Latex', 'Iodine', 'NSAIDs', 'Food', 'Cosmetics', 'None', 'Other'],
  drugHistory: ['Steroids', 'Antibiotics', 'Accutane', 'Methotrexate', 'Biologics', 'None', 'Other'],
  familyHistory: ['Psoriasis', 'Eczema', 'Skin Cancer', 'Melanoma', 'Alopecia', 'None', 'Other'],
  pastSurgeries: ['Cosmetic', 'Laser', 'Biopsy', 'Skin graft', 'None', 'Other'],
  lifestyle: ['Smoking', 'Alcohol', 'Sun Exposure', 'Stress', 'Poor Diet', 'None', 'Other'],
};

const MEDICAL_RECORD_OPTIONS = {
  symptoms: ['Itching', 'Pain', 'Redness', 'Swelling', 'Acne', 'Hair loss', 'Dryness', 'Rash', 'Other'],
  findings: ['Erythema', 'Papules', 'Plaques', 'Scales', 'Ulcers', 'Normal', 'Pustules', 'Comedones', 'Other'],
  diagnosis: ['Acne Vulgaris', 'Eczema', 'Psoriasis', 'Rosacea', 'Melasma', 'Alopecia', 'Vitiligo', 'Fungal', 'Other'],
  prescription: ['Topical cream', 'Oral meds', 'Laser', 'Biopsy', 'Follow-up 2w', 'Follow-up 1m', 'No treatment', 'Other'],
};

// ========== ASR CONSTANTS ==========
const ASR_LANGUAGES = [
  
  { code: 'en-GB', name: 'English (UK)', icon: '🇬🇧' },
  { code: 'ar-SA', name: 'Arabic', icon: '🇸🇦' },
  
];

const MEDICAL_PHRASES = [
  "Prescribe Clindamycin 1% gel",
  "Apply twice daily",
  "Take Doxycycline 100mg",
  "Once daily with food",
  "Use sunscreen SPF 50",
  "Avoid sun exposure",
  "Follow up in 4 weeks",
  "Apply thin layer",
  "Take with meals",
  "Use moisturizer",
  "Avoid alcohol",
  "Drink plenty of water",
  "Monitor for side effects",
  "Discontinue if rash occurs",
  "Apply to affected area",
  "Do not use on broken skin",
  "Store at room temperature",
  "Refrigerate if needed",
  "Shake well before use",
  "Take before bedtime",
  "Apply morning and night",
  "Use as directed",
  "Continue for 7 days",
  "Stop if irritation occurs",
  "Wash hands after application",
  "Keep away from eyes",
  "Use protective clothing",
  "Avoid waxing procedures",
  "Use lip balm regularly",
  "Monthly blood tests required"
];

// ========== MAIN COMPONENT ==========
export default function MedicalRecordsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'history' | 'medicalHistory' | 'record'>('list');
  
  const [appState, setAppState] = useState<AppState>(INITIAL_STATE);
  
  const [medicalHistoryForm, setMedicalHistoryForm] = useState<MedicalHistory>({
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
    lastUpdated: new Date().toISOString().split('T')[0],
  });
  
  const [recordForm, setRecordForm] = useState({
    symptoms: [] as string[],
    symptomsOther: '',
    findings: [] as string[],
    findingsOther: '',
    diagnosis: [] as string[],
    diagnosisOther: '',
    prescription: [] as string[],
    prescriptionOther: '',
  });

  const [prescriptionDrugs, setPrescriptionDrugs] = useState<PrescriptionDrug[]>([]);
  const [prescriptionImage, setPrescriptionImage] = useState<string>('');
  const [isProcessingPrescription, setIsProcessingPrescription] = useState(false);
  const [prescriptionAnalysis, setPrescriptionAnalysis] = useState<any>(null);

  // ========== ASR STATE ==========
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recordingPermission, setRecordingPermission] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showASRModal, setShowASRModal] = useState(false);
  const [asrNotes, setAsrNotes] = useState('');
  const [isProcessingSpeech, setIsProcessingSpeech] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [recordingQuality, setRecordingQuality] = useState<'good' | 'fair' | 'poor'>('good');
  const [speechConfidence, setSpeechConfidence] = useState(0.85);
  
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // ========== ASR FUNCTIONS ==========
  const startWaveAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const requestRecordingPermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        setRecordingPermission(true);
        return true;
      } else {
        Alert.alert(
          'Microphone Permission Required',
          'Please enable microphone access to use speech recognition.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {} }
          ]
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting recording permission:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      if (!recordingPermission) {
        const hasPermission = await requestRecordingPermission();
        if (!hasPermission) return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
      setIsListening(true);
      
      
      startWaveAnimation();
      startPulseAnimation();
      
      simulateSpeechRecognition();
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }

      setIsRecording(false);
      setIsListening(false);
      
      waveAnimation.stopAnimation();
      pulseAnimation.stopAnimation();
      
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      await processRecordedAudio();
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const simulateSpeechRecognition = () => {
    const prescriptionPhrases = [
      "I'm prescribing",
      "The patient should",
      "Please take",
      "Apply to",
      "Use as directed",
      "Take one tablet",
      "Apply twice daily",
      "Use morning and night",
      "Continue for",
      "Stop if"
    ];

    let simulatedText = '';
    let wordIndex = 0;

    const addWords = () => {
      if (!isListening) return;

      const randomTerm = MEDICAL_PHRASES[Math.floor(Math.random() * MEDICAL_PHRASES.length)];
      const randomPhrase = prescriptionPhrases[Math.floor(Math.random() * prescriptionPhrases.length)];
      
      if (wordIndex % 5 === 0) {
        simulatedText += randomPhrase + ' ';
      }
      
      simulatedText += randomTerm + '. ';
      setTranscribedText(simulatedText.trim());
      
      wordIndex++;
      
      if (isListening) {
        setTimeout(addWords, 1500 + Math.random() * 1000);
      }
    };

    setTimeout(addWords, 1000);
  };

  const processRecordedAudio = async () => {
    setIsProcessingSpeech(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = [
      "Prescribe Clindamycin 1% gel. Apply thin layer to affected areas twice daily. Take Doxycycline 100mg once daily with food. Use sunscreen SPF 50 daily. Follow up in 4 weeks.",
      "Patient should use Adapalene 0.1% gel at bedtime. Apply sparingly. Take Cetirizine 10mg once daily for itching. Use moisturizer regularly. Avoid sun exposure.",
      "Rx: Metronidazole 0.75% cream. Apply to affected areas once daily. Take Spironolactone 50mg daily. Monitor potassium levels. Use gentle cleanser.",
      "Prescribed Isotretinoin 20mg daily with fatty meal. Monthly pregnancy tests required. Use lip balm regularly. Avoid waxing procedures. Follow up monthly.",
      "Use Hydrocortisone 1% cream for itching. Apply as needed. Take Loratadine 10mg once daily. Use fragrance-free products. Drink plenty of water."
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    let finalResult = randomResult;
    if (selectedPatient) {
      const patientName = selectedPatient.name.split(' ')[0];
      finalResult = `For ${patientName}: ${randomResult}`;
    }
    
    setTranscribedText(finalResult);
    setAsrNotes(finalResult);
    setIsProcessingSpeech(false);
    
    const quality = Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'fair' : 'poor';
    setRecordingQuality(quality);
    setSpeechConfidence(0.7 + Math.random() * 0.3);
    
    Alert.alert(
      '✅ Speech Transcribed',
      'Your prescription has been transcribed successfully. Review and edit if needed.',
      [{ text: 'OK' }]
    );
  };

  const applyASRToPrescription = () => {
    if (transcribedText.trim()) {
      const lines = transcribedText.split('.');
      const medicationsFound: any[] = [];
      
      lines.forEach(line => {
        const medMatch = line.match(/(prescribe|use|take|rx:?)\s+(\w+)\s+(\d+%|\d+mg)/i);
        if (medMatch) {
          const name = medMatch[2];
          const dosage = medMatch[3];
          const instructions = line.trim();
          
          medicationsFound.push({
            name,
            dosage,
            instructions,
            type: line.toLowerCase().includes('cream') || 
                  line.toLowerCase().includes('gel') || 
                  line.toLowerCase().includes('ointment') ? 'Topical' : 'Oral'
          });
        }
      });
      
      if (medicationsFound.length > 0) {
        medicationsFound.forEach((med, index) => {
          const mockDrug: Drug = {
            id: `asr-${Date.now()}-${index}`,
            activeingredient: med.name,
            tradename: med.name,
            company: med.name.includes('Clindamycin') ? 'Pfizer' : 
                    med.name.includes('Doxycycline') ? 'GSK' : 
                    med.name.includes('Adapalene') ? 'Galderma' :
                    med.name.includes('Tretinoin') ? 'Johnson & Johnson' :
                    med.name.includes('Isotretinoin') ? 'Roche' : 'Generic Pharma',
            form: med.type === 'Topical' ? 'Cream/Gel' : 'Tablet/Capsule',
            new_price: `${Math.floor(Math.random() * 40) + 15} EGP`,
            pharmacology: 'As prescribed',
            route: med.type,
            group: 'Prescription Medication'
          };
          
          const prescriptionDrug: PrescriptionDrug = {
            drug: mockDrug,
            dosage: med.dosage,
            frequency: med.instructions.toLowerCase().includes('twice') ? 'Twice daily' :
                      med.instructions.toLowerCase().includes('three times') ? 'Three times daily' :
                      med.instructions.toLowerCase().includes('daily') ? 'Once daily' :
                      'As directed',
            duration: '4 weeks',
            notes: med.instructions
          };
          
          setPrescriptionDrugs(prev => [...prev, prescriptionDrug]);
        });
        
        Alert.alert(
          '✅ Medications Added',
          `Added ${medicationsFound.length} medication(s) from speech transcription.`
        );
      }
      
      setShowASRModal(false);
      setTranscribedText('');
      setAsrNotes('');
    }
  };

  const clearASR = () => {
    setTranscribedText('');
    setAsrNotes('');
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
    if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
    }
    setIsRecording(false);
    setIsListening(false);
    setRecordingTime(0);
    waveAnimation.stopAnimation();
    pulseAnimation.stopAnimation();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
      }
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // ========== HANDLERS ==========
  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    
    if (patient.isNewPatient) {
      setMedicalHistoryForm({
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
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      setViewMode('medicalHistory');
    } else {
      setViewMode('history');
    }
  };

  const handleSaveMedicalHistory = () => {
    if (!selectedPatient) return;
    
    if (
      (medicalHistoryForm.medicalHistory.includes('Other') && !medicalHistoryForm.medicalHistoryOther?.trim()) ||
      (medicalHistoryForm.familyHistory.includes('Other') && !medicalHistoryForm.familyHistoryOther?.trim()) ||
      (medicalHistoryForm.allergies.includes('Other') && !medicalHistoryForm.allergiesOther?.trim()) ||
      (medicalHistoryForm.pastSurgeries.includes('Other') && !medicalHistoryForm.pastSurgeriesOther?.trim()) ||
      (medicalHistoryForm.drugHistory.includes('Other') && !medicalHistoryForm.drugHistoryOther?.trim()) ||
      (medicalHistoryForm.lifestyle.includes('Other') && !medicalHistoryForm.lifestyleOther?.trim())
    ) {
      Alert.alert('Missing Information', 'Please specify the "Other" details.');
      return;
    }
    
    const updatedPatients = appState.patients.map(p => 
      p.id === selectedPatient.id ? { ...p, isNewPatient: false } : p
    );
    
    const updatedMedicalHistories = {
      ...appState.medicalHistories,
      [selectedPatient.id]: {
        medicalHistory: medicalHistoryForm.medicalHistory.filter(item => item !== 'Other'),
        medicalHistoryOther: medicalHistoryForm.medicalHistoryOther?.trim() || undefined,
        familyHistory: medicalHistoryForm.familyHistory.filter(item => item !== 'Other'),
        familyHistoryOther: medicalHistoryForm.familyHistoryOther?.trim() || undefined,
        allergies: medicalHistoryForm.allergies.filter(item => item !== 'Other'),
        allergiesOther: medicalHistoryForm.allergiesOther?.trim() || undefined,
        pastSurgeries: medicalHistoryForm.pastSurgeries.filter(item => item !== 'Other'),
        pastSurgeriesOther: medicalHistoryForm.pastSurgeriesOther?.trim() || undefined,
        drugHistory: medicalHistoryForm.drugHistory.filter(item => item !== 'Other'),
        drugHistoryOther: medicalHistoryForm.drugHistoryOther?.trim() || undefined,
        lifestyle: medicalHistoryForm.lifestyle.filter(item => item !== 'Other'),
        lifestyleOther: medicalHistoryForm.lifestyleOther?.trim() || undefined,
        lastUpdated: new Date().toISOString().split('T')[0],
      }
    };
    
    setAppState(prev => ({
      ...prev,
      patients: updatedPatients,
      medicalHistories: updatedMedicalHistories
    }));
    
    setMedicalHistoryForm({
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
      lastUpdated: new Date().toISOString().split('T')[0],
    });
    
    setViewMode('record');
    
    Alert.alert(
      '✅ Medical History Saved',
      'Medical history has been saved successfully. Now add the first medical record.',
      [{ text: 'OK' }]
    );
  };

  const handleSelectDrug = (drug: Drug) => {
    const newPrescriptionDrug: PrescriptionDrug = {
      drug,
      dosage: '',
      frequency: 'Once daily',
      duration: '7 days',
      notes: ''
    };
    setPrescriptionDrugs(prev => [...prev, newPrescriptionDrug]);
  };

  const handleUpdateDrug = (index: number, field: keyof PrescriptionDrug, value: string) => {
    const updatedDrugs = [...prescriptionDrugs];
    updatedDrugs[index] = {
      ...updatedDrugs[index],
      [field]: value
    };
    setPrescriptionDrugs(updatedDrugs);
  };

  const handleRemoveDrug = (index: number) => {
    const updatedDrugs = prescriptionDrugs.filter((_, i) => i !== index);
    setPrescriptionDrugs(updatedDrugs);
  };

  const uploadPrescription = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setPrescriptionImage(imageUri);
        
        await processPrescriptionWithAI(imageUri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload prescription');
    }
  };

  const processPrescriptionWithAI = async (imageUri: string) => {
    setIsProcessingPrescription(true);
    setPrescriptionAnalysis(null);
    
    try {
      const patientAllergies = selectedPatient 
        ? appState.medicalHistories[selectedPatient.id]?.allergies || []
        : [];
      
      const patientGender = selectedPatient?.gender || '';
      
      const extractedText = await extractPrescriptionText(imageUri);
      const parsedData = parsePrescriptionData(extractedText);
      const nlpAnalysis = analyzePrescription(extractedText, patientAllergies, patientGender);
      const acrValidation = await validateMedicalDocument(imageUri);
      
      const analysis = {
        extractedText,
        parsedData,
        nlpAnalysis,
        acrValidation,
        patientContext: {
          allergies: patientAllergies,
          gender: patientGender,
          name: selectedPatient?.name
        },
        timestamp: new Date().toISOString()
      };
      
      setPrescriptionAnalysis(analysis);
      
      if (parsedData.medications.length > 0) {
        const newDrugs: PrescriptionDrug[] = [];
        
        parsedData.medications.forEach((med: any, index: number) => {
          const mockDrug: Drug = {
            id: `ai-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
            activeingredient: med.name,
            tradename: med.name,
            company: med.name.includes('Clindamycin') ? 'Pfizer' : 
                    med.name.includes('Doxycycline') ? 'GSK' : 
                    med.name.includes('Adapalene') ? 'Galderma' :
                    med.name.includes('Tretinoin') ? 'Johnson & Johnson' :
                    med.name.includes('Isotretinoin') ? 'Roche' : 'Generic Pharma',
            form: med.type === 'Topical' ? 'Cream/Gel' : 'Tablet/Capsule',
            new_price: `${Math.floor(Math.random() * 40) + 15} EGP`,
            pharmacology: 'As prescribed',
            route: med.type,
            group: 'Prescription Medication'
          };
          
          const prescriptionDrug: PrescriptionDrug = {
            drug: mockDrug,
            dosage: med.dosage,
            frequency: med.instructions?.toLowerCase().includes('twice') ? 'Twice daily' :
                      med.instructions?.toLowerCase().includes('three times') ? 'Three times daily' :
                      med.instructions?.toLowerCase().includes('daily') ? 'Once daily' :
                      'As directed',
            duration: extractedText.match(/(\d+)\s*(week|day|month)/i) 
              ? `${RegExp.$1} ${RegExp.$2}s` 
              : '4 weeks',
            notes: med.instructions || 'As prescribed'
          };
          
          newDrugs.push(prescriptionDrug);
        });
        
        setPrescriptionDrugs(prev => [...prev, ...newDrugs]);
      }
      
      if (nlpAnalysis.warnings.length > 0) {
        Alert.alert(
          nlpAnalysis.severity === 'HIGH' ? '🚨 Critical Warnings Found' : '⚠️ Prescription Analysis',
          `AI found ${parsedData.medications.length} medications with ${nlpAnalysis.warnings.length} warnings.`,
          [{ text: 'Review Analysis', onPress: () => {} }, { text: 'OK' }]
        );
      } else {
        Alert.alert(
          '✅ Prescription Analyzed',
          `Successfully extracted ${parsedData.medications.length} medications.`
        );
      }
      
    } catch (error) {
      console.error('AI Processing Error:', error);
      Alert.alert('Analysis Error', 'Could not process prescription. Please try again.');
    } finally {
      setIsProcessingPrescription(false);
    }
  };

  const handleSaveRecord = () => {
    if (!selectedPatient) return;
    
    if (
      (recordForm.symptoms.includes('Other') && !recordForm.symptomsOther.trim()) ||
      (recordForm.findings.includes('Other') && !recordForm.findingsOther.trim()) ||
      (recordForm.diagnosis.includes('Other') && !recordForm.diagnosisOther.trim()) ||
      (recordForm.prescription.includes('Other') && !recordForm.prescriptionOther.trim())
    ) {
      Alert.alert('Missing Information', 'Please specify the "Other" details.');
      return;
    }
    
    let prescriptionText = recordForm.prescription.filter(item => item !== 'Other').join(', ');
    
    if (recordForm.prescriptionOther) {
      prescriptionText = prescriptionText 
        ? `${prescriptionText}, Other: ${recordForm.prescriptionOther}`
        : `Other: ${recordForm.prescriptionOther}`;
    }
    
    if (prescriptionDrugs.length > 0) {
      const drugsText = prescriptionDrugs.map((item, index) => 
        `${index + 1}. ${item.drug.tradename} (${item.dosage}) - ${item.frequency} for ${item.duration}`
      ).join('\n');
      
      prescriptionText = prescriptionText 
        ? `${prescriptionText}\n\nPrescribed Medications:\n${drugsText}`
        : `Prescribed Medications:\n${drugsText}`;
    }
    
    let symptomsText = recordForm.symptoms.filter(item => item !== 'Other').join(', ');
    if (recordForm.symptomsOther) {
      symptomsText = symptomsText 
        ? `${symptomsText}, Other: ${recordForm.symptomsOther}`
        : `Other: ${recordForm.symptomsOther}`;
    }
    
    let findingsText = recordForm.findings.filter(item => item !== 'Other').join(', ');
    if (recordForm.findingsOther) {
      findingsText = findingsText 
        ? `${findingsText}, Other: ${recordForm.findingsOther}`
        : `Other: ${recordForm.findingsOther}`;
    }
    
    let diagnosisText = recordForm.diagnosis.filter(item => item !== 'Other').join(', ');
    if (recordForm.diagnosisOther) {
      diagnosisText = diagnosisText 
        ? `${diagnosisText}, Other: ${recordForm.diagnosisOther}`
        : `Other: ${recordForm.diagnosisOther}`;
    }
    
    const newMedicalRecord: MedicalRecord = {
      id: `record-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      symptoms: recordForm.symptoms.filter(item => item !== 'Other'),
      symptomsOther: recordForm.symptomsOther.trim() || undefined,
      findings: recordForm.findings.filter(item => item !== 'Other'),
      findingsOther: recordForm.findingsOther.trim() || undefined,
      diagnosis: recordForm.diagnosis.filter(item => item !== 'Other'),
      diagnosisOther: recordForm.diagnosisOther.trim() || undefined,
      prescription: recordForm.prescription.filter(item => item !== 'Other'),
      prescriptionOther: recordForm.prescriptionOther.trim() || undefined,
      prescribedDrugs: prescriptionDrugs.length > 0 ? prescriptionDrugs : undefined
    };
    
    const newVisitRecord: VisitRecord = {
      id: `visit-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      diagnosis: diagnosisText,
      treatment: prescriptionText,
    };
    
    setAppState(prev => {
      const currentMedicalRecords = prev.medicalRecords[selectedPatient.id] || [];
      const currentVisitRecords = prev.visitRecords[selectedPatient.id] || [];
      
      return {
        ...prev,
        medicalRecords: {
          ...prev.medicalRecords,
          [selectedPatient.id]: [newMedicalRecord, ...currentMedicalRecords]
        },
        visitRecords: {
          ...prev.visitRecords,
          [selectedPatient.id]: [newVisitRecord, ...currentVisitRecords]
        }
      };
    });
    
    Alert.alert(
      '✅ Medical Record Saved',
      `Medical record saved for ${selectedPatient.name}\nPrescribed ${prescriptionDrugs.length} medications\n\nDr. Wahid Lotfy`,
      [
        {
          text: 'View Patient History',
          onPress: () => {
            setRecordForm({ 
              symptoms: [], 
              symptomsOther: '',
              findings: [], 
              findingsOther: '',
              diagnosis: [], 
              diagnosisOther: '',
              prescription: [], 
              prescriptionOther: '',
            });
            setPrescriptionDrugs([]);
            setPrescriptionImage('');
            setPrescriptionAnalysis(null);
            setViewMode('history');
          }
        },
        {
          text: 'Back to Patients',
          style: 'default',
          onPress: () => {
            setViewMode('list');
            setSelectedPatient(null);
            setRecordForm({ 
              symptoms: [], 
              symptomsOther: '',
              findings: [], 
              findingsOther: '',
              diagnosis: [], 
              diagnosisOther: '',
              prescription: [], 
              prescriptionOther: '',
            });
            setPrescriptionDrugs([]);
            setPrescriptionImage('');
            setPrescriptionAnalysis(null);
          }
        }
      ]
    );
  };

  const toggleMedicalHistorySelection = (category: keyof Omit<MedicalHistory, 'lastUpdated'>, item: string) => {
    setMedicalHistoryForm(prev => {
      let currentArray: string[];
      
      switch (category) {
        case 'medicalHistory':
          currentArray = prev.medicalHistory;
          break;
        case 'allergies':
          currentArray = prev.allergies;
          break;
        case 'drugHistory':
          currentArray = prev.drugHistory;
          break;
        case 'familyHistory':
          currentArray = prev.familyHistory;
          break;
        case 'pastSurgeries':
          currentArray = prev.pastSurgeries;
          break;
        case 'lifestyle':
          currentArray = prev.lifestyle;
          break;
        default:
          currentArray = [];
      }
      
      const newArray = currentArray.includes(item)
        ? currentArray.filter(i => i !== item)
        : [...currentArray, item];
      
      return {
        ...prev,
        [category]: newArray
      };
    });
  };

  const toggleRecordSelection = (category: keyof typeof recordForm, item: string) => {
    setRecordForm(prev => {
      if (category === 'symptoms' || category === 'findings' || 
          category === 'diagnosis' || category === 'prescription') {
        const currentArray = prev[category] as string[];
        const newArray = currentArray.includes(item)
          ? currentArray.filter(i => i !== item)
          : [...currentArray, item];
        
        return {
          ...prev,
          [category]: newArray
        };
      }
      return prev;
    });
  };

  // ========== RENDER FUNCTIONS ==========
  const renderPatientList = () => (
    <ScrollView style={styles.listContainer}>
      <View style={styles.headerSection}>
        <Text style={styles.sectionTitle}>Patients</Text>
        <Text style={styles.clinicInfo}>Dr. Wahid Lotfy Clinic</Text>
      </View>
      
      {appState.patients.map(patient => (
        <Pressable
          key={patient.id}
          style={styles.patientCard}
          onPress={() => handleSelectPatient(patient)}
        >
          <View style={styles.patientInfo}>
            <View style={[
              styles.avatar,
              patient.isNewPatient && styles.newPatientAvatar
            ]}>
              {patient.isNewPatient ? (
                <UserPlus size={24} color={Colors.primary} />
              ) : (
                <User size={24} color={Colors.primary} />
              )}
            </View>
            <View style={styles.patientDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{patient.name}</Text>
                {patient.isNewPatient && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
              <Text style={styles.patientMeta}>
                {patient.age}y • {patient.gender} • {patient.bloodType}
              </Text>
              <Text style={styles.lastVisit}>
                {patient.isNewPatient ? 'Needs medical history' : 'Has medical history'}
                {!patient.isNewPatient && ` • ${appState.visitRecords[patient.id]?.length || 0} visits`}
              </Text>
            </View>
          </View>
          <ChevronRight size={20} color={Colors.text?.secondary || '#666'} />
        </Pressable>
      ))}
    </ScrollView>
  );

  const renderMedicalHistoryForm = () => {
    if (!selectedPatient) return null;

    return (
      <ScrollView style={styles.formContainer}>
        <View style={styles.formHeader}>
          <Pressable onPress={() => setViewMode('list')} style={styles.backButton}>
            <ChevronRight size={20} color={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={styles.backText}>Back to Patients</Text>
          </Pressable>
          <Text style={styles.formTitle}>Medical History</Text>
          <Text style={styles.formSubtitle}>New Patient: {selectedPatient.name}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Medical History</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.medicalHistory.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.medicalHistory.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('medicalHistory', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.medicalHistory.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.medicalHistory.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.medicalHistory.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other medical history..."
                value={medicalHistoryForm.medicalHistoryOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, medicalHistoryOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Family History</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.familyHistory.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.familyHistory.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('familyHistory', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.familyHistory.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.familyHistory.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.familyHistory.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other family history..."
                value={medicalHistoryForm.familyHistoryOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, familyHistoryOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Allergies</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.allergies.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.allergies.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('allergies', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.allergies.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.allergies.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.allergies.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other allergies..."
                value={medicalHistoryForm.allergiesOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, allergiesOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Past Surgeries</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.pastSurgeries.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.pastSurgeries.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('pastSurgeries', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.pastSurgeries.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.pastSurgeries.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.pastSurgeries.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other past surgeries..."
                value={medicalHistoryForm.pastSurgeriesOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, pastSurgeriesOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Drug History</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.drugHistory.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.drugHistory.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('drugHistory', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.drugHistory.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.drugHistory.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.drugHistory.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other drug history..."
                value={medicalHistoryForm.drugHistoryOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, drugHistoryOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitleSmall}>Lifestyle Factors</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.choiceGrid}>
            {MEDICAL_HISTORY_OPTIONS.lifestyle.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  medicalHistoryForm.lifestyle.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleMedicalHistorySelection('lifestyle', item)}
              >
                <Text style={[
                  styles.choiceText,
                  medicalHistoryForm.lifestyle.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {medicalHistoryForm.lifestyle.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          {medicalHistoryForm.lifestyle.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other lifestyle factors..."
                value={medicalHistoryForm.lifestyleOther}
                onChangeText={(t) => setMedicalHistoryForm(prev => ({ ...prev, lifestyleOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.saveSection}>
          <Pressable 
            style={styles.saveButton}
            onPress={handleSaveMedicalHistory}
          >
            <Text style={styles.saveButtonText}>Save Medical History</Text>
          </Pressable>
          <Text style={styles.saveNote}>
            After saving, you'll be directed to create the first medical record
          </Text>
        </View>
      </ScrollView>
    );
  };

  const renderPatientHistory = () => {
    if (!selectedPatient) return null;
    
    const history = appState.medicalHistories[selectedPatient.id];
    const visits = appState.visitRecords[selectedPatient.id] || [];
    const medicalRecords = appState.medicalRecords[selectedPatient.id] || [];

    return (
      <ScrollView style={styles.historyContainer}>
        <View style={styles.patientHeader}>
          <Pressable onPress={() => setViewMode('list')} style={styles.backButton}>
            <ChevronRight size={20} color={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={styles.backText}>Back to Patients</Text>
          </Pressable>
          
          <View style={styles.patientHeaderContent}>
            <View style={styles.avatarLarge}>
              <User size={28} color={Colors.white} />
            </View>
            <View style={styles.patientHeaderInfo}>
              <Text style={styles.patientHeaderName}>{selectedPatient.name}</Text>
              <Text style={styles.patientHeaderDetails}>
                {selectedPatient.age}y • {selectedPatient.gender} • {selectedPatient.bloodType}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <History size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Medical History</Text>
            {history && (
              <Text style={styles.updatedDate}>Updated: {history.lastUpdated}</Text>
            )}
          </View>
          
          {history ? (
            <>
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Medical History</Text>
                <View style={styles.tags}>
                  {history.medicalHistory.map((condition, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{condition}</Text>
                    </View>
                  ))}
                  {history.medicalHistoryOther && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Other: {history.medicalHistoryOther}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Family History</Text>
                <View style={styles.tags}>
                  {history.familyHistory.map((familyHistory, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{familyHistory}</Text>
                    </View>
                  ))}
                  {history.familyHistoryOther && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Other: {history.familyHistoryOther}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Allergies</Text>
                <View style={styles.tags}>
                  {history.allergies.map((allergy, idx) => (
                    <View key={idx} style={[styles.tag, styles.allergyTag]}>
                      <AlertCircle size={12} color={Colors.status?.error || '#FF3B30'} />
                      <Text style={[styles.tagText, styles.allergyText]}>{allergy}</Text>
                    </View>
                  ))}
                  {history.allergiesOther && (
                    <View style={[styles.tag, styles.allergyTag]}>
                      <AlertCircle size={12} color={Colors.status?.error || '#FF3B30'} />
                      <Text style={[styles.tagText, styles.allergyText]}>Other: {history.allergiesOther}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Past Surgeries</Text>
                <View style={styles.tags}>
                  {history.pastSurgeries.map((surgery, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{surgery}</Text>
                    </View>
                  ))}
                  {history.pastSurgeriesOther && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Other: {history.pastSurgeriesOther}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Drug History</Text>
                <View style={styles.tags}>
                  {history.drugHistory.map((drug, idx) => (
                    <View key={idx} style={[styles.tag, styles.medicationTag]}>
                      <Pill size={12} color={Colors.secondary} />
                      <Text style={styles.tagText}>{drug}</Text>
                    </View>
                  ))}
                  {history.drugHistoryOther && (
                    <View style={[styles.tag, styles.medicationTag]}>
                      <Pill size={12} color={Colors.secondary} />
                      <Text style={styles.tagText}>Other: {history.drugHistoryOther}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              <View style={styles.historySection}>
                <Text style={styles.sectionLabel}>Lifestyle</Text>
                <View style={styles.tags}>
                  {history.lifestyle.map((habit, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{habit}</Text>
                    </View>
                  ))}
                  {history.lifestyleOther && (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>Other: {history.lifestyleOther}</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.emptyText}>No medical history recorded</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Medical Records</Text>
            <Text style={styles.visitCount}>{visits.length} records</Text>
          </View>
          
          {medicalRecords.map(record => (
            <View key={record.id} style={styles.recordItem}>
              <View style={styles.recordDate}>
                <Text style={styles.recordDateText}>{record.date}</Text>
                <Text style={styles.recordDoctor}>Dr. Wahid Lotfy</Text>
              </View>
              
              <View style={styles.recordDetails}>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Symptoms:</Text>
                  <Text style={styles.recordValue}>
                    {record.symptoms.join(', ')}
                    {record.symptomsOther && `, Other: ${record.symptomsOther}`}
                  </Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Findings:</Text>
                  <Text style={styles.recordValue}>
                    {record.findings.join(', ')}
                    {record.findingsOther && `, Other: ${record.findingsOther}`}
                  </Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Diagnosis:</Text>
                  <Text style={styles.recordValue}>
                    {record.diagnosis.join(', ')}
                    {record.diagnosisOther && `, Other: ${record.diagnosisOther}`}
                  </Text>
                </View>
                <View style={styles.recordRow}>
                  <Text style={styles.recordLabel}>Prescription:</Text>
                  <Text style={styles.recordValue}>
                    {record.prescription.join(', ')}
                    {record.prescriptionOther && `, Other: ${record.prescriptionOther}`}
                    {record.prescribedDrugs && record.prescribedDrugs.length > 0 && (
                      <Text style={styles.drugsInfo}>
                        {'\n'}Medications: {record.prescribedDrugs.length} prescribed
                      </Text>
                    )}
                  </Text>
                </View>
              </View>
            </View>
          ))}
          
          {medicalRecords.length === 0 && (
            <View style={styles.emptyState}>
              <FileText size={32} color={Colors.text?.secondary || '#666'} />
              <Text style={styles.emptyText}>No medical records yet</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <Pressable 
            style={styles.progressButton}
            onPress={() => {
              router.push({
                pathname: '/doctor/ProgressPhotosScreen',
                params: {
                  patientId: selectedPatient.id,
                  patientName: selectedPatient.name
                }
              });
            }}
          >
            <TrendingUp size={20} color={Colors.white} />
            <Text style={styles.progressButtonText}>Progress</Text>
          </Pressable>
          
          <Pressable 
            style={styles.addRecordButton}
            onPress={() => setViewMode('record')}
          >
            <Plus size={20} color={Colors.white} />
            <Text style={styles.addRecordText}>Add New Medical Record</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  const renderRecordForm = () => {
    if (!selectedPatient) return null;

    return (
      <ScrollView style={styles.recordContainer}>
        <View style={styles.formHeader}>
          <Pressable 
            onPress={() => {
              const hasRecords = appState.medicalRecords[selectedPatient.id]?.length > 0;
              setViewMode(hasRecords ? 'history' : 'list');
            }} 
            style={styles.backButton}
          >
            <ChevronRight size={20} color={Colors.white} style={{ transform: [{ rotate: '180deg' }] }} />
            <Text style={styles.backText}>Back to Patient</Text>
          </Pressable>
          <Text style={styles.formTitle}>Add Medical Record</Text>
          <Text style={styles.formSubtitle}>
            Patient: {selectedPatient.name} • Doctor: Dr. Wahid Lotfy
          </Text>
        </View>

        <View style={styles.recordSection}>
          <View style={styles.recordHeader}>
            <User size={24} color={Colors.primary} />
            <View style={styles.recordHeaderText}>
              <Text style={styles.recordTitle}>PATIENT SYMPTOMS</Text>
              <Text style={styles.recordSubtitle}>What the patient reports</Text>
            </View>
          </View>
          
          <View style={styles.choiceGrid}>
            {MEDICAL_RECORD_OPTIONS.symptoms.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  recordForm.symptoms.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleRecordSelection('symptoms', item)}
              >
                <Text style={[
                  styles.choiceText,
                  recordForm.symptoms.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {recordForm.symptoms.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          
          {recordForm.symptoms.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other symptoms..."
                value={recordForm.symptomsOther}
                onChangeText={(t) => setRecordForm(prev => ({ ...prev, symptomsOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.recordSection}>
          <View style={styles.recordHeader}>
            <Search size={24} color={Colors.primary} />
            <View style={styles.recordHeaderText}>
              <Text style={styles.recordTitle}>EXAMINATION FINDINGS</Text>
              <Text style={styles.recordSubtitle}>Clinical observations</Text>
            </View>
          </View>
          
          <View style={styles.choiceGrid}>
            {MEDICAL_RECORD_OPTIONS.findings.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  recordForm.findings.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleRecordSelection('findings', item)}
              >
                <Text style={[
                  styles.choiceText,
                  recordForm.findings.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {recordForm.findings.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          
          {recordForm.findings.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other findings..."
                value={recordForm.findingsOther}
                onChangeText={(t) => setRecordForm(prev => ({ ...prev, findingsOther: t }))}
              />
            </View>
          )}
        </View>

        <View style={styles.recordSection}>
          <View style={styles.recordHeader}>
            <FileText size={24} color={Colors.primary} />
            <View style={styles.recordHeaderText}>
              <Text style={styles.recordTitle}>DIAGNOSIS</Text>
              <Text style={styles.recordSubtitle}>Medical assessment</Text>
            </View>
          </View>
          
          <View style={styles.choiceGrid}>
            {MEDICAL_RECORD_OPTIONS.diagnosis.map(item => (
              <Pressable
                key={item}
                style={[
                  styles.choiceButton,
                  recordForm.diagnosis.includes(item) && styles.choiceSelected
                ]}
                onPress={() => toggleRecordSelection('diagnosis', item)}
              >
                <Text style={[
                  styles.choiceText,
                  recordForm.diagnosis.includes(item) && styles.choiceTextSelected
                ]}>
                  {item}
                </Text>
                {recordForm.diagnosis.includes(item) && (
                  <Check size={14} color={Colors.white} />
                )}
              </Pressable>
            ))}
          </View>
          
          {recordForm.diagnosis.includes('Other') && (
            <View style={{ marginTop: 12 }}>
              <TextInput
                style={styles.input}
                placeholder="Specify other diagnosis..."
                value={recordForm.diagnosisOther}
                onChangeText={(t) => setRecordForm(prev => ({ ...prev, diagnosisOther: t }))}
              />
            </View>
          )}
        </View>

        {/* ========== AI PRESCRIPTION SECTION ========== */}
        <View style={styles.recordSection}>
          <View style={styles.recordHeader}>
            <Brain size={24} color={Colors.primary} />
            <View style={styles.recordHeaderText}>
              <Text style={styles.recordTitle}>AI PRESCRIPTION ASSISTANT</Text>
              <Text style={styles.recordSubtitle}>Upload or dictate prescription for AI analysis</Text>
            </View>
          </View>
          
          <View style={styles.aiActionButtons}>
            <TouchableOpacity 
              style={styles.aiActionButton}
              onPress={uploadPrescription}
              disabled={isProcessingPrescription}
            >
              <Upload size={20} color={Colors.white} />
              <Text style={styles.aiActionButtonText}>
                {isProcessingPrescription ? 'Processing...' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.aiActionButton, styles.asrButton]}
              onPress={() => setShowASRModal(true)}
            >
              <Mic size={20} color={Colors.white} />
              <Text style={styles.aiActionButtonText}>Dictate Prescription</Text>
            </TouchableOpacity>
          </View>
          
          {prescriptionImage ? (
            <View style={styles.prescriptionPreview}>
              <View style={styles.previewHeader}>
                <FileText size={20} color={Colors.primary} />
                <Text style={styles.previewTitle}>Prescription Uploaded</Text>
                {prescriptionAnalysis?.acrValidation.isValid && (
                  <View style={styles.validBadge}>
                    <Text style={styles.validBadgeText}>✓ Valid Document</Text>
                  </View>
                )}
              </View>
              
              {isProcessingPrescription ? (
                <View style={styles.processingContainer}>
                  <View style={styles.spinner} />
                  <Text style={styles.processingText}>AI is analyzing prescription...</Text>
                  <Text style={styles.processingSubtext}>Extracting medications and checking for warnings</Text>
                </View>
              ) : prescriptionAnalysis && (
                <View style={styles.analysisResults}>
                  <View style={styles.analysisHeader}>
                    <Brain size={20} color={Colors.secondary} />
                    <Text style={styles.analysisTitle}>AI Analysis Results</Text>
                    <View style={styles.confidenceBadge}>
                      <Text style={styles.confidenceText}>
                        {Math.round(prescriptionAnalysis.nlpAnalysis.confidence * 100)}% confidence
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.validationContainer}>
                    <Text style={styles.validationTitle}>📄 Document Analysis:</Text>
                    <View style={styles.validationGrid}>
                      <View style={styles.validationItem}>
                        <Text style={styles.validationLabel}>Type</Text>
                        <Text style={[
                          styles.validationValue,
                          prescriptionAnalysis.acrValidation.documentType === 'prescription' && styles.valueGood,
                          prescriptionAnalysis.acrValidation.documentType === 'doctor_note' && styles.valueWarning
                        ]}>
                          {prescriptionAnalysis.acrValidation.documentType.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.validationItem}>
                        <Text style={styles.validationLabel}>Clarity</Text>
                        <Text style={[
                          styles.validationValue,
                          prescriptionAnalysis.acrValidation.clarityScore >= 8 && styles.valueGood,
                          prescriptionAnalysis.acrValidation.clarityScore >= 6 && styles.valueWarning,
                          prescriptionAnalysis.acrValidation.clarityScore < 6 && styles.valueError
                        ]}>
                          {prescriptionAnalysis.acrValidation.clarityScore}/10
                        </Text>
                      </View>
                      <View style={styles.validationItem}>
                        <Text style={styles.validationLabel}>Signature</Text>
                        <Text style={[
                          styles.validationValue,
                          prescriptionAnalysis.acrValidation.hasSignature && styles.valueGood,
                          !prescriptionAnalysis.acrValidation.hasSignature && styles.valueError
                        ]}>
                          {prescriptionAnalysis.acrValidation.hasSignature ? '✓' : '✗'}
                        </Text>
                      </View>
                      <View style={styles.validationItem}>
                        <Text style={styles.validationLabel}>Score</Text>
                        <Text style={[
                          styles.validationValue,
                          prescriptionAnalysis.acrValidation.validationScore >= 75 && styles.valueGood,
                          prescriptionAnalysis.acrValidation.validationScore >= 50 && styles.valueWarning,
                          prescriptionAnalysis.acrValidation.validationScore < 50 && styles.valueError
                        ]}>
                          {prescriptionAnalysis.acrValidation.validationScore}%
                        </Text>
                      </View>
                    </View>
                    
                    {prescriptionAnalysis.acrValidation.recommendations.map((rec: string, idx: number) => (
                      <Text key={idx} style={styles.recommendationText}>
                        {rec.startsWith('✓') ? '✅ ' : rec.startsWith('✗') ? '❌ ' : '⚠️ '}
                        {rec.replace(/^[✓✗⚠️]\s*/, '')}
                      </Text>
                    ))}
                  </View>
                  
                  {prescriptionAnalysis.nlpAnalysis.warnings.length > 0 && (
                    <View style={[
                      styles.warningsContainer,
                      prescriptionAnalysis.nlpAnalysis.severity === 'HIGH' && styles.warningsHigh,
                      prescriptionAnalysis.nlpAnalysis.severity === 'MEDIUM' && styles.warningsMedium,
                      prescriptionAnalysis.nlpAnalysis.severity === 'LOW' && styles.warningsLow
                    ]}>
                      <View style={styles.warningsHeader}>
                        <AlertCircle size={18} color="#FFFFFF" />
                        <Text style={styles.warningsTitle}>
                          {prescriptionAnalysis.nlpAnalysis.severity === 'HIGH' ? '🚨 CRITICAL WARNINGS' :
                           prescriptionAnalysis.nlpAnalysis.severity === 'MEDIUM' ? '⚠️ IMPORTANT WARNINGS' :
                           'ℹ️ RECOMMENDATIONS'}
                        </Text>
                        <View style={styles.warningsCount}>
                          <Text style={styles.warningsCountText}>{prescriptionAnalysis.nlpAnalysis.warnings.length}</Text>
                        </View>
                      </View>
                      {prescriptionAnalysis.nlpAnalysis.warnings.map((warning: string, idx: number) => (
                        <View key={idx} style={styles.warningItem}>
                          <Text style={styles.warningText}>• {warning}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.medicationsSummary}>
                    <Text style={styles.summaryTitle}>💊 Extracted Medications:</Text>
                    <Text style={styles.summaryText}>
                      {prescriptionAnalysis.parsedData.medications.length} medication(s) found
                    </Text>
                    {prescriptionAnalysis.parsedData.medications.map((med: any, idx: number) => (
                      <View key={idx} style={styles.medicationItem}>
                        <Text style={styles.medicationName}>{med.name} {med.dosage}</Text>
                        <Text style={styles.medicationType}>{med.type}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.reuploadButton}
                    onPress={uploadPrescription}
                  >
                    <Upload size={16} color={Colors.primary} />
                    <Text style={styles.reuploadText}>Scan Another Prescription</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.uploadPrompt}>
              <Text style={styles.uploadPromptText}>
                Upload a prescription image or use voice dictation for AI-powered analysis
              </Text>
            </View>
          )}
        </View>

        <View style={styles.recordSection}>
          <View style={styles.recordHeader}>
            <Pill size={24} color={Colors.primary} />
            <View style={styles.recordHeaderText}>
              <Text style={styles.recordTitle}>PRESCRIBED MEDICATIONS</Text>
              <Text style={styles.recordSubtitle}>
                {prescriptionDrugs.length > 0 
                  ? `${prescriptionDrugs.length} medication(s) added`
                  : 'Search and add medications from database'
                }
              </Text>
            </View>
          </View>
          
          <DrugSearchDropdown
            onSelectDrug={handleSelectDrug}
            placeholder="Search for medication to add..."
            selectedDrugs={prescriptionDrugs.map(pd => pd.drug)}
          />
          
          {prescriptionDrugs.length > 0 && (
            <View style={styles.selectedDrugsContainer}>
              <Text style={styles.selectedDrugsTitle}>
                Added Medications ({prescriptionDrugs.length})
              </Text>
              
              {prescriptionDrugs.map((item, index) => (
                <View key={index} style={styles.drugCard}>
                  <View style={styles.drugCardHeader}>
                    <View style={styles.drugCardTitle}>
                      <Pill size={16} color={Colors.primary} />
                      <Text style={styles.drugName}>{item.drug.tradename}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveDrug(index)}
                      style={styles.removeButton}
                    >
                      <Trash2 size={16} color={Colors.status?.error || '#FF3B30'} />
                    </TouchableOpacity>
                  </View>
                  
                  <Text style={styles.drugDetails}>{item.drug.activeingredient}</Text>
                  
                  <View style={styles.drugFields}>
                    <View style={styles.drugField}>
                      <Text style={styles.fieldLabel}>Dosage</Text>
                      <TextInput
                        style={styles.fieldInput}
                        value={item.dosage}
                        onChangeText={(text) => handleUpdateDrug(index, 'dosage', text)}
                        placeholder="e.g., 1 tablet, 500mg"
                        placeholderTextColor={Colors.text?.secondary || '#666'}
                      />
                    </View>
                    
                    <View style={styles.drugField}>
                      <Text style={styles.fieldLabel}>Frequency</Text>
                      <View style={styles.frequencyButtons}>
                        {['Once daily', 'Twice daily', 'Three times daily', 'As needed'].map(freq => (
                          <TouchableOpacity
                            key={freq}
                            style={[
                              styles.freqButton,
                              item.frequency === freq && styles.freqButtonSelected
                            ]}
                            onPress={() => handleUpdateDrug(index, 'frequency', freq)}
                          >
                            <Text style={[
                              styles.freqButtonText,
                              item.frequency === freq && styles.freqButtonTextSelected
                            ]}>
                              {freq}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.drugField}>
                      <Text style={styles.fieldLabel}>Duration</Text>
                      <View style={styles.durationButtons}>
                        {['3 days', '7 days', '10 days', '14 days', '1 month'].map(dur => (
                          <TouchableOpacity
                            key={dur}
                            style={[
                              styles.durationButton,
                              item.duration === dur && styles.durationButtonSelected
                            ]}
                            onPress={() => handleUpdateDrug(index, 'duration', dur)}
                          >
                            <Text style={[
                              styles.durationButtonText,
                              item.duration === dur && styles.durationButtonTextSelected
                            ]}>
                              {dur}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.drugField}>
                      <Text style={styles.fieldLabel}>Notes</Text>
                      <TextInput
                        style={[styles.fieldInput, styles.notesInput]}
                        value={item.notes}
                        onChangeText={(text) => handleUpdateDrug(index, 'notes', text)}
                        placeholder="Additional notes..."
                        placeholderTextColor={Colors.text?.secondary || '#666'}
                        multiline
                      />
                    </View>
                  </View>
                  
                  <View style={styles.drugFooter}>
                    <Text style={styles.drugCompany}>{item.drug.company}</Text>
                    <Text style={styles.drugPrice}>{item.drug.new_price}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Pressable 
            style={[styles.saveButton, recordForm.diagnosis.length === 0 && styles.saveButtonDisabled]}
            onPress={handleSaveRecord}
            disabled={recordForm.diagnosis.length === 0}
          >
            <Text style={styles.saveButtonText}>
              {recordForm.diagnosis.length === 0 ? 'Select Diagnosis' : 'Save Medical Record'}
            </Text>
          </Pressable>
        </View>

        {/* ASR MODAL */}
        <Modal
          visible={showASRModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowASRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Ear size={24} color={Colors.primary} />
                  <Text style={styles.modalTitle}>Voice Prescription Dictation</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowASRModal(false)}
                  style={styles.closeButton}
                >
                  <X size={24} color={Colors.text?.secondary || '#666'} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.asrContainer}>
                <View style={styles.languageSelector}>
                  <Text style={styles.languageLabel}>Language:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.languageScroll}>
                    {ASR_LANGUAGES.map(lang => (
                      <TouchableOpacity
                        key={lang.code}
                        style={[
                          styles.languageButton,
                          selectedLanguage === lang.code && styles.languageButtonSelected
                        ]}
                        onPress={() => setSelectedLanguage(lang.code)}
                      >
                        <Text style={styles.languageIcon}>{lang.icon}</Text>
                        <Text style={[
                          styles.languageName,
                          selectedLanguage === lang.code && styles.languageNameSelected
                        ]}>
                          {lang.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.recordingStatus}>
                  {isRecording ? (
                    <Animated.View style={[
                      styles.recordingActive,
                      { transform: [{ scale: pulseAnimation }] }
                    ]}>
                      <View style={styles.recordingIndicator}>
                        <View style={styles.recordingDot} />
                        <Text style={styles.recordingText}>LIVE RECORDING</Text>
                      </View>
                      <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
                      <View style={styles.waveformVisualizer}>
                        {[...Array(5)].map((_, i) => (
                          <Animated.View
                            key={i}
                            style={[
                              styles.waveformBar,
                              {
                                transform: [{
                                  scaleY: waveAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5 + i * 0.1, 1 + i * 0.2]
                                  })
                                }]
                              }
                            ]}
                          />
                        ))}
                      </View>
                    </Animated.View>
                  ) : (
                    <View style={styles.readyState}>
                      <Mic size={48} color={Colors.primary} />
                      <Text style={styles.readyText}>Ready to dictate prescription</Text>
                      <Text style={styles.readySubtext}>Press the button below to start speaking</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.transcriptionContainer}>
                  <View style={styles.transcriptionHeader}>
                    <Text style={styles.transcriptionLabel}>Transcription</Text>
                    {transcribedText && !isProcessingSpeech && (
                      <View style={styles.qualityBadge}>
                        <Text style={styles.qualityText}>
                          {recordingQuality === 'good' ? '✅ Good Quality' :
                           recordingQuality === 'fair' ? '⚠️ Fair Quality' : '❌ Poor Quality'}
                        </Text>
                        <Text style={styles.confidenceText}>
                          {Math.round(speechConfidence * 100)}% confidence
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.transcriptionBox}>
                    {isProcessingSpeech ? (
                      <View style={styles.processingSpeech}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.processingSpeechText}>Processing your speech...</Text>
                        <Text style={styles.processingSpeechSubtext}>Analyzing medical terminology</Text>
                      </View>
                    ) : transcribedText ? (
                      <ScrollView>
                        <Text style={styles.transcriptionText}>{transcribedText}</Text>
                      </ScrollView>
                    ) : (
                      <View style={styles.emptyTranscription}>
                        <Type size={32} color={Colors.text?.secondary || '#666'} />
                        <Text style={styles.emptyTranscriptionText}>
                          Your transcribed prescription will appear here
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {transcribedText && !isProcessingSpeech && (
                    <View style={styles.transcriptionEdit}>
                      <Text style={styles.editLabel}>Edit if needed:</Text>
                      <TextInput
                        style={styles.editInput}
                        value={asrNotes}
                        onChangeText={setAsrNotes}
                        multiline
                        numberOfLines={4}
                        placeholder="Make any corrections to the transcription..."
                      />
                    </View>
                  )}
                </View>
                
                <View style={styles.medicalPhrases}>
                  <Text style={styles.phrasesTitle}>💡 Medical Phrases to Use:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.phrasesScroll}>
                    {MEDICAL_PHRASES.slice(0, 10).map((phrase, idx) => (
                      <View key={idx} style={styles.phraseChip}>
                        <Text style={styles.phraseText}>{phrase}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                
                <View style={styles.controlButtons}>
                  <View style={styles.primaryControls}>
                    {!isRecording ? (
                      <TouchableOpacity 
                        style={styles.recordButton}
                        onPress={startRecording}
                      >
                        <Mic size={24} color={Colors.white} />
                        <Text style={styles.recordButtonText}>Start Dictation</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity 
                        style={styles.stopButton}
                        onPress={stopRecording}
                      >
                        <MicOff size={24} color={Colors.white} />
                        <Text style={styles.stopButtonText}>Stop Recording</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {transcribedText && !isProcessingSpeech && (
                    <View style={styles.secondaryControls}>
                      <TouchableOpacity 
                        style={styles.applyButton}
                        onPress={applyASRToPrescription}
                      >
                        <Check size={20} color={Colors.white} />
                        <Text style={styles.applyButtonText}>Apply to Prescription</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.clearButton}
                        onPress={clearASR}
                      >
                        <Trash2 size={20} color={Colors.white} />
                        <Text style={styles.clearButtonText}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                
                <View style={styles.tipsContainer}>
                  <Text style={styles.tipsTitle}>🎤 Dictation Tips:</Text>
                  <View style={styles.tipsGrid}>
                    <View style={styles.tipItem}>
                      <Volume2 size={16} color={Colors.primary} />
                      <Text style={styles.tipText}>Speak clearly at normal pace</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Pill size={16} color={Colors.primary} />
                      <Text style={styles.tipText}>Include dosage and frequency</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <Calendar size={16} color={Colors.primary} />
                      <Text style={styles.tipText}>Mention duration clearly</Text>
                    </View>
                    <View style={styles.tipItem}>
                      <AlertCircle size={16} color={Colors.primary} />
                      <Text style={styles.tipText}>State warnings and precautions</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Medical Records',
          headerStyle: { backgroundColor: Colors.secondary },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontSize: 18,
          },
        }}
      />

      <View style={styles.container}>
        {viewMode === 'list' && (
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.text?.secondary || '#666'} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search patients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.text?.secondary || '#666'}
            />
          </View>
        )}

        {viewMode === 'list' && renderPatientList()}
        {viewMode === 'medicalHistory' && renderMedicalHistoryForm()}
        {viewMode === 'history' && renderPatientHistory()}
        {viewMode === 'record' && renderRecordForm()}
      </View>
    </>
  );
}

// ========== STYLES ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text?.primary || '#000',
    marginLeft: 12,
  },
  
  headerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
  },
  clinicInfo: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginTop: 4,
  },
  
  listContainer: {
    flex: 1,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  newPatientAvatar: {
    backgroundColor: `${Colors.status?.warning || '#FF9500'}15`,
  },
  patientDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginRight: 8,
  },
  newBadge: {
    backgroundColor: Colors.status?.warning || '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  patientMeta: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginBottom: 2,
  },
  lastVisit: {
    fontSize: 13,
    color: Colors.text?.secondary || '#666',
  },
  
  formHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    color: Colors.white,
    fontSize: 16,
    marginLeft: 8,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  
  formContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  historyContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  recordContainer: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  
  formSection: {
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
  sectionTitleSmall: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginBottom: 16,
  },
  
  patientHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  patientHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  patientHeaderInfo: {
    flex: 1,
  },
  patientHeaderName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  patientHeaderDetails: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    padding: 20,
    shadowColor: Colors.shadow?.small || '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginLeft: 12,
    flex: 1,
  },
  updatedDate: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  visitCount: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    fontWeight: '600',
  },
  
  historySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 12,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  allergyTag: {
    backgroundColor: `${Colors.status?.error || '#FF3B30'}10`,
    borderColor: `${Colors.status?.error || '#FF3B30'}30`,
  },
  medicationTag: {
    backgroundColor: `${Colors.secondary}10`,
    borderColor: `${Colors.secondary}30`,
  },
  tagText: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    marginLeft: 6,
  },
  allergyText: {
    color: Colors.status?.error || '#FF3B30',
  },
  
  recordItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
    paddingVertical: 16,
  },
  recordDate: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
  },
  recordDoctor: {
    fontSize: 13,
    color: Colors.text?.secondary || '#666',
  },
  recordDetails: {
    marginLeft: 8,
  },
  recordRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    width: 100,
  },
  recordValue: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    flex: 1,
  },
  drugsInfo: {
    fontSize: 12,
    color: Colors.secondary,
    fontStyle: 'italic',
  },
  
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginTop: 8,
  },
  
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginVertical: 24,
  },
  progressButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  progressButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  addRecordButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addRecordText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  
  recordSection: {
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
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recordHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
  },
  recordSubtitle: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginTop: 2,
  },
  
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: '48%',
    flexGrow: 1,
  },
  choiceSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  choiceText: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    flex: 1,
  },
  choiceTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  
  selectedDrugsContainer: {
    marginTop: 20,
  },
  selectedDrugsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 16,
  },
  drugCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  drugCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  drugCardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drugName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginLeft: 8,
  },
  removeButton: {
    padding: 4,
  },
  drugDetails: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    marginBottom: 16,
  },
  drugFields: {
    gap: 12,
  },
  drugField: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text?.primary || '#000',
  },
  notesInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  frequencyButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  freqButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.offWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  freqButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  freqButtonText: {
    fontSize: 12,
    color: Colors.text?.primary || '#000',
  },
  freqButtonTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.offWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  durationButtonSelected: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  durationButtonText: {
    fontSize: 12,
    color: Colors.text?.primary || '#000',
  },
  durationButtonTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  drugFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border?.light || '#E0E0E0',
  },
  drugCompany: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  drugPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  
  saveSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  saveNote: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 40,
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: Colors.text?.secondary || '#666',
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
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

  // ========== AI OCR/ACR/NLP STYLES ==========
  prescriptionPreview: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginLeft: 8,
    flex: 1,
  },
  validBadge: {
    backgroundColor: Colors.status?.success || '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  validBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  processingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderTopColor: 'transparent',
    marginBottom: 12,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 4,
  },
  processingSubtext: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
  },
  analysisResults: {
    marginTop: 8,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginLeft: 8,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confidenceText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  validationContainer: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 12,
  },
  validationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  validationItem: {
    flex: 1,
    minWidth: '45%',
  },
  validationLabel: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    marginBottom: 4,
  },
  validationValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  valueGood: {
    color: Colors.status?.success || '#34C759',
  },
  valueWarning: {
    color: Colors.status?.warning || '#FF9500',
  },
  valueError: {
    color: Colors.status?.error || '#FF3B30',
  },
  recommendationText: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    marginTop: 2,
  },
  warningsContainer: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  warningsHigh: {
    backgroundColor: '#FF3B30',
  },
  warningsMedium: {
    backgroundColor: '#FF9500',
  },
  warningsLow: {
    backgroundColor: '#FFCC00',
  },
  warningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  warningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
    marginLeft: 8,
    flex: 1,
  },
  warningsCount: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningsCountText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  warningItem: {
    marginBottom: 6,
  },
  warningText: {
    fontSize: 13,
    color: Colors.white,
    lineHeight: 18,
  },
  medicationsSummary: {
    backgroundColor: Colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 13,
    color: Colors.text?.secondary || '#666',
    marginBottom: 8,
  },
  medicationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
  },
  medicationName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
  },
  medicationType: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reuploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.offWhite,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  reuploadText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  aiActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  aiActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  asrButton: {
    backgroundColor: Colors.secondary,
  },
  aiActionButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  uploadPrompt: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  uploadPromptText: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
  },

  // ========== ASR MODAL STYLES ==========
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border?.light || '#E0E0E0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
  },
  closeButton: {
    padding: 4,
  },
  
  asrContainer: {
    padding: 20,
  },
  
  languageSelector: {
    marginBottom: 20,
  },
  languageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.secondary || '#666',
    marginBottom: 8,
  },
  languageScroll: {
    flexDirection: 'row',
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  languageButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  languageIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  languageName: {
    fontSize: 12,
    color: Colors.text?.primary || '#000',
    fontWeight: '600',
  },
  languageNameSelected: {
    color: Colors.white,
  },
  
  recordingStatus: {
    marginBottom: 20,
  },
  recordingActive: {
    backgroundColor: '#FF3B3010',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B30',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF3B30',
  },
  recordingTime: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 16,
  },
  waveformVisualizer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 4,
  },
  waveformBar: {
    width: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    height: 20,
  },
  
  readyState: {
    alignItems: 'center',
    padding: 20,
  },
  readyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  readySubtext: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
  },
  
  transcriptionContainer: {
    marginBottom: 20,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text?.secondary || '#666',
  },
  
  transcriptionBox: {
    backgroundColor: Colors.offWhite,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    marginBottom: 12,
  },
  processingSpeech: {
    alignItems: 'center',
    padding: 20,
  },
  processingSpeechText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginTop: 12,
    marginBottom: 4,
  },
  processingSpeechSubtext: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
  },
  
  transcriptionText: {
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    lineHeight: 20,
  },
  
  emptyTranscription: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTranscriptionText: {
    fontSize: 14,
    color: Colors.text?.secondary || '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  
  transcriptionEdit: {
    marginTop: 12,
  },
  editLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text?.primary || '#000',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.text?.primary || '#000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  medicalPhrases: {
    marginBottom: 20,
  },
  phrasesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 12,
  },
  phrasesScroll: {
    flexDirection: 'row',
  },
  phraseChip: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  phraseText: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
  },
  
  controlButtons: {
    marginBottom: 20,
  },
  primaryControls: {
    marginBottom: 12,
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  recordButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  stopButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  
  secondaryControls: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.status?.success || '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.text?.secondary || '#666',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  clearButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  
  tipsContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text?.primary || '#000',
    marginBottom: 12,
  },
  tipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    minWidth: '48%',
    borderWidth: 1,
    borderColor: Colors.border?.light || '#E0E0E0',
  },
  tipText: {
    fontSize: 12,
    color: Colors.text?.secondary || '#666',
    marginLeft: 8,
    flex: 1,
  },
});