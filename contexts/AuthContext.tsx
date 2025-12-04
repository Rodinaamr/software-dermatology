import createContextHook from '@nkzw/create-context-hook';
import { useCallback, useMemo, useState } from 'react';

const ROLE_IMAGES = {
  patient: 'https://cdn-icons-png.flaticon.com/512/3001/3001764.png',
  doctor: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
  assistant: 'https://www.kindpng.com/picc/m/66-663423_virtual-assistant-png-transparent-png.png'
};

export type UserRole = 'patient' | 'doctor' | 'assistant';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  specialty?: string;

  // ✅ Added fields
  age?: number;
  gender?: string;
}

const MOCK_USERS: User[] = [
  {
    id: 'patient-1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'patient',
    phone: '+1 234 567 8901',
    photo: 'https://cdn-icons-png.flaticon.com/512/4648/4648273.png',
  },
  {
    id: 'patient-2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'patient',
    phone: '+1 234 567 8902',
    photo: 'https://cdn-icons-png.flaticon.com/512/3001/3001764.png',
  },
  {
    id: 'doctor-1',
    name: 'Dr. Wahid Lotfy',
    email: 'doctor@clinic.com',
    role: 'doctor',
    specialty: 'Dermatology & Aesthetic Medicine',
    phone: '+1 234 567 9000',
    photo: 'https://cdn-icons-png.flaticon.com/512/3774/3774299.png',
  },
  {
    id: 'assistant-1',
    name: 'Assistant',
    email: 'assistant@clinic.com',
    role: 'assistant',
    phone: '+1 234 567 9100',
    photo: 'https://www.kindpng.com/picc/m/66-663423_virtual-assistant-png-transparent-png.png'
  },
];

const MOCK_CREDENTIALS: Record<string, { password: string; userId: string }> = {
  'sarah@example.com': { password: 'patient123', userId: 'patient-1' },
  'michael@example.com': { password: 'patient123', userId: 'patient-2' },
  'doctor@clinic.com': { password: 'doctor123', userId: 'doctor-1' },
  'assistant@clinic.com': { password: 'assistant123', userId: 'assistant-1' },
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const credentials = MOCK_CREDENTIALS[email.toLowerCase()];

    if (credentials && credentials.password === password) {
      const foundUser = MOCK_USERS.find((u) => u.id === credentials.userId);
      if (foundUser) {
        setUser(foundUser);
        setIsLoading(false);
        return true;
      }
    }

    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      phone: string,
      age?: string | number,
      gender?: string
    ): Promise<boolean> => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // ✅ Dynamic gender-based icons
      const maleIcon = "https://cdn-icons-png.flaticon.com/512/3001/3001764.png";
      const femaleIcon = "https://cdn-icons-png.flaticon.com/512/4648/4648273.png";

      const newUser: User = {
        id: `patient-${Date.now()}`,
        name,
        email,
        role: 'patient',
        phone,

        // ✅ New fields
        gender: gender ?? undefined,
        age: age !== undefined ? Number(age) : undefined,

        // ✅ Gender-based photo logic
        photo: gender === "female" ? femaleIcon : maleIcon,
      };

      MOCK_USERS.push(newUser);
      MOCK_CREDENTIALS[email.toLowerCase()] = { password, userId: newUser.id };

      setUser(newUser);
      setIsLoading(false);
      return true;
    },
    []
  );

  return useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      register,
    }),
    [user, isLoading, login, logout, register]
  );
});
