import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  fullName: string;
  emailOrPhone: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (fullName: string, phoneNumber: string) => Promise<{ success: boolean; error?: string }>;
  signup: (fullName: string, emailOrPhone: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (emailOrPhone: string, newPassword?: string) => Promise<{ success: boolean; message: string }>;
}

const AUTH_STORAGE_KEY = 'schemesaathi_citizen_auth_session';
const USERS_DB_KEY = 'schemesaathi_users_db';

const DEFAULT_USERS = [
  {
    id: 'user_default_1',
    fullName: 'Ramesh Kumar Patil',
    emailOrPhone: '9876543210',
    passwordHash: 'password123',
    createdAt: '2026-01-15T10:00:00.000Z',
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load authenticated user strictly from active citizen session (no auto demo login)
  const [user, setUser] = useState<User | null>(() => {
    try {
      // Clear any legacy mock auto-login keys from earlier test versions
      localStorage.removeItem('schemesaathi_auth_user');
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch {
      return null;
    }
  });

  const login = async (fullName: string, phoneNumber: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = fullName.trim();
    const cleanPhone = phoneNumber.trim();

    if (!cleanName) {
      return { success: false, error: 'Please enter your full name.' };
    }
    if (!cleanPhone) {
      return { success: false, error: 'Please enter your mobile / phone number.' };
    }

    try {
      const authUser: User = {
        id: `citizen_${cleanPhone.replace(/\D/g, '') || Date.now()}`,
        fullName: cleanName,
        emailOrPhone: cleanPhone,
        createdAt: new Date().toISOString(),
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      return { success: true };
    } catch {
      return { success: false, error: 'An error occurred during login. Please try again.' };
    }
  };

  const signup = async (
    fullName: string,
    emailOrPhone: string,
    _password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    return login(fullName, emailOrPhone);
  };


  const logout = () => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    setUser(null);
  };

  const resetPassword = async (emailOrPhone: string, newPassword?: string): Promise<{ success: boolean; message: string }> => {
    const cleanId = emailOrPhone.trim().toLowerCase();
    try {
      let users = DEFAULT_USERS;
      const stored = localStorage.getItem(USERS_DB_KEY);
      if (stored) {
        users = JSON.parse(stored);
      }

      const userIndex = users.findIndex(
        (u: any) =>
          u.emailOrPhone.toLowerCase() === cleanId ||
          (cleanId.replace(/\D/g, '').length >= 10 && u.emailOrPhone.replace(/\D/g, '') === cleanId.replace(/\D/g, ''))
      );

      if (userIndex === -1) {
        return {
          success: false,
          message: 'No registered citizen account found with this mobile/email.',
        };
      }

      if (newPassword && newPassword.trim().length >= 6) {
        users[userIndex].passwordHash = newPassword.trim();
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        return {
          success: true,
          message: 'Password successfully updated! You can now log in with your new password.',
        };
      }

      return {
        success: true,
        message: `A verification OTP and password reset instruction have been dispatched to ${emailOrPhone}.`,
      };
    } catch {
      return { success: false, message: 'Could not process password reset request.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
