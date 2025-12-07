// app/types.ts
export interface Drug {
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

export interface PrescriptionDrug {
  drug: Drug;
  dosage: string;
  frequency: string;
  duration: string;
  notes?: string;
}