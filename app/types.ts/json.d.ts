// app/types/json.d.ts
declare module '*.json' {
  const value: any;
  export default value;
}

// Specific type for your medications file
declare module '@/app/data/medications_New_prices_up_to_03-08-2024.json' {
  interface DrugItem {
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
  
  interface MedicationsData {
    drugs?: DrugItem[];
    data?: DrugItem[];
    [key: string]: any;
  }
  
  const value: DrugItem[] | MedicationsData;
  export default value;
}