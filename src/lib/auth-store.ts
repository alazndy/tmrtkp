'use client';

import { create } from 'zustand';
import { auth, googleProvider } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void; // Returns unsubscribe function
  clearError: () => void;
}

const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email,
  displayName: firebaseUser.displayName,
});

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ user: mapFirebaseUser(userCredential.user), loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
      // Translate common Firebase errors to Turkish
      let translatedError = errorMessage;
      if (errorMessage.includes('invalid-credential') || errorMessage.includes('wrong-password')) {
        translatedError = 'Email veya şifre hatalı';
      } else if (errorMessage.includes('user-not-found')) {
        translatedError = 'Bu email ile kayıtlı kullanıcı bulunamadı';
      } else if (errorMessage.includes('too-many-requests')) {
        translatedError = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin';
      }
      set({ error: translatedError, loading: false });
      throw new Error(translatedError);
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      set({ user: mapFirebaseUser(userCredential.user), loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Google ile giriş başarısız';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Çıkış başarısız';
      set({ error: errorMessage, loading: false });
    }
  },

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        set({ user: mapFirebaseUser(firebaseUser), loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },

  clearError: () => set({ error: null }),
}));
