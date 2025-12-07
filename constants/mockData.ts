export interface Medication {
  id: string;
  name: string;
  dosage: string;
  type: 'tablet' | 'cream' | 'injection' | 'syrup';
  notes?: string;
}

export interface PrescriptionAttachment {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  notes: string;
  attachment?: PrescriptionAttachment;
}

export const MOCK_PRESCRIPTIONS: Prescription[] = [];

export function addPrescription(p: Prescription) {
  MOCK_PRESCRIPTIONS.push(p);
}

export const SPECIALTIES = [
  'Dermatology',
  'Cosmetic Dermatology',
  'Laser Treatment',
  'Skin Allergy',
  'Autoimmune Skin Diseases',
  'Venereal Diseases',
  'Andrology',
  'Sexual Health',
  'Male Infertility',
] as const;

export type Specialty = typeof SPECIALTIES[number];

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  specialty: Specialty;
  date: string;
  time: string;
  status: 'reserved' | 'completed' | 'canceled';
  isEmergency: boolean;
  notes?: string;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  title: string;
  summary: string;
  diagnosis: string; // patient status/case
  treatment: string;
  medications: Medication[];
  progressPhotos?: { before: string; after?: string }[];
}

export interface Payment {
  id: string;
  patientId: string;
  patientName: string;
  treatmentName: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
}

export interface Feedback {
  id: string;
  patientId: string;
  patientName: string;  // This property still exists in the interface
  rating: number;
  comment: string;
  date: string;
}

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: 'doctor-1',
    doctorName: ' Wahid Lotfy',
    specialty: 'Dermatology',
    date: getTodayDate(),
    time: '11:00',
    status: 'reserved',
    isEmergency: false,
  },
  {
    id: 'apt-2',
    patientId: 'patient-2',
    patientName: 'Michael Chen',
    doctorId: 'doctor-1',
    doctorName: ' Wahid Lotfy',
    specialty: 'Laser Treatment',
    date: getTodayDate(),
    time: '14:00',
    status: 'reserved',
    isEmergency: false,
  },
  {
    id: 'apt-4',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: 'doctor-1',
    doctorName: ' Wahid Lotfy',
    specialty: 'Skin Allergy',
    date: getTodayDate(),
    time: '09:30',
    status: 'reserved',
    isEmergency: true,
  },
  {
    id: 'apt-3',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: 'doctor-1',
    doctorName: 'Wahid Lotfy',
    specialty: 'Cosmetic Dermatology',
    date: '2025-10-15',
    time: '10:30',
    status: 'completed',
    isEmergency: false,
    notes: 'Completed successfully.',
  },
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rep-1',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    doctorId: 'doctor-1',
    doctorName: ' Wahid Lotfy',
    date: '2025-10-15',
    title: 'Acne Treatment',
    summary: 'Moderate acne on cheeks.',
    diagnosis: 'Acne',
    treatment: 'Tretinoin + Clindamycin',
    medications: [
      { id: 'med-1', name: 'Tretinoin 0.025%', dosage: 'Apply at night', type: 'cream' },
      { id: 'med-2', name: 'Clindamycin 1%', dosage: 'Apply twice daily', type: 'cream' },
    ],
    progressPhotos: [
      { before: '/images/acne_before_1.jpg', after: '/images/acne_after_1.jpg' },
      { before: '/images/acne_before_2.jpg' },
    ],
  },
  {
    id: 'rep-2',
    patientId: 'patient-2',
    patientName: 'Michael Chen',
    doctorId: 'doctor-1',
    doctorName: ' Wahid Lotfy',
    date: '2025-10-16',
    title: 'Skin Allergy Treatment',
    summary: 'Red rash on arms and back.',
    diagnosis: 'Skin Allergy',
    treatment: 'Hydrocortisone Cream',
    medications: [
      { id: 'med-3', name: 'Hydrocortisone 1%', dosage: 'Apply twice daily', type: 'cream' },
    ],
    progressPhotos: [
      { before: '/images/allergy_before.jpg', after: '/images/allergy_after.jpg' },
    ],
  },
];

export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    patientId: 'patient-1',
    patientName: 'Sarah Johnson',
    treatmentName: 'Consultation',
    amount: 350,
    date: '2025-10-15',
    status: 'paid',
  },
];

// UPDATED: Removed patient names from feedback
export const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    patientId: 'patient-1',
    patientName: 'Anonymous',  // Changed from 'Sarah Johnson' to 'Anonymous'
    rating: 5,
    comment: 'Exceptional service!',
    date: '2025-10-16',
  },
  {
    id: 'fb-2',
    patientId: 'patient-2',
    patientName: 'Anonymous',  // Changed to anonymous
    rating: 4,
    comment: 'Good experience, but waiting time could be improved.',
    date: '2025-10-15',
  },
  {
    id: 'fb-3',
    patientId: 'patient-3',
    patientName: 'Anonymous',  // Changed to anonymous
    rating: 5,
    comment: 'Very professional and caring. Felt listened to and well taken care of.',
    date: '2025-10-14',
  },
  {
    id: 'fb-4',
    patientId: 'patient-4',
    patientName: 'Anonymous',  // Changed to anonymous
    rating: 3,
    comment: 'Average experience. Could have been more attentive to my concerns.',
    date: '2025-10-13',
  },
  {
    id: 'fb-5',
    patientId: 'patient-5',
    patientName: 'Anonymous',  // Changed to anonymous
    rating: 5,
    comment: 'Outstanding care! Would highly recommend to anyone.',
    date: '2025-10-12',
  },
];

export const TIME_SLOTS = [
  '09:00','09:30','10:00','10:30','11:00',
  '11:30','12:00','12:30','13:00','13:30',
  '14:00','14:30',
];

export function isTimeSlotAvailable(date: string, time: string): boolean {
  const existing = MOCK_APPOINTMENTS.find(
    apt => apt.date === date && apt.time === time && apt.status !== 'canceled'
  );
  return !existing;
}