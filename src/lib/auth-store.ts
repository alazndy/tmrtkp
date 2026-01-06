'use client';

import { create } from 'zustand';
import { auth, googleProvider, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User, UserRole, Institution } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => () => void; // Returns unsubscribe function
  clearError: () => void;
  
  
  // Institution Actions
  institution: Institution | null;
  createInstitution: (name: string) => Promise<void>;
  
  // Role helpers
  isAdmin: () => boolean;
  isTeacher: () => boolean;
}

// Firestore'dan kullanıcı rol bilgisini çek
const getUserRole = async (uid: string, email: string | null): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    
    // Kullanıcı yoksa varsayılan rol ata ve kaydet
    // GÜVENLİK: Varsayılan rol her zaman 'teacher' - admin sadece founder veya mevcut admin tarafından atanabilir
    const defaultRole: UserRole = 'teacher';
    
    await setDoc(doc(db, 'users', uid), {
      email,
      role: defaultRole,
      createdAt: new Date(),
    });
    
    return defaultRole;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 'teacher'; // Varsayılan olarak teacher
  }
};

const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const role = await getUserRole(firebaseUser.uid, firebaseUser.email);
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    role,
    institutionId: undefined, // Will be populated if exists
  };
};

const getInstitution = async (institutionId: string): Promise<Institution | null> => {
  if (!institutionId) return null;
  const docRef = doc(db, 'institutions', institutionId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      founderId: data.founderId,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as Institution;
  }
  return null;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  institution: null,
  loading: true,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Fetch fresh user data from Firestore to get institutionId
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let user = await mapFirebaseUser(userCredential.user);
      
      let institution = null;
      if (userDoc.exists()) {
        const userData = userDoc.data();
        user = { ...user, ...userData, role: userData.role || user.role } as User;
        if (user.institutionId) {
          institution = await getInstitution(user.institutionId);
        }
      }

      set({ user, institution, loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş başarısız';
      // Translate common Firebase errors
      let translatedError = errorMessage;
      if (errorMessage.includes('invalid-credential') || errorMessage.includes('wrong-password')) {
        translatedError = 'Email veya şifre hatalı';
      } else if (errorMessage.includes('user-not-found')) {
        translatedError = 'Bu email ile kayıtlı kullanıcı bulunamadı';
      }
      set({ error: translatedError, loading: false });
      throw new Error(translatedError);
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create initial user doc
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName: name,
        createdAt: new Date(),
        role: 'admin', // Default to admin for new registrations (they will create institution)
        institutionId: null, // Will be set during onboarding
      });

      const user = await mapFirebaseUser(userCredential.user);
      set({ user, institution: null, loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Kayıt başarısız';
      let translatedError = errorMessage;
      if (errorMessage.includes('email-already-in-use')) {
        translatedError = 'Bu email adresi zaten kullanımda';
      } else if (errorMessage.includes('weak-password')) {
        translatedError = 'Şifre çok zayıf (en az 6 karakter)';
      }
      set({ error: translatedError, loading: false });
      throw new Error(translatedError);
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      
      // Fetch fresh user data
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      let user = await mapFirebaseUser(userCredential.user);
      
      let institution = null;
      if (userDoc.exists()) {
        const userData = userDoc.data();
        user = { ...user, ...userData, role: userData.role || user.role } as User;
        if (user.institutionId) {
          institution = await getInstitution(user.institutionId);
        }
      }

      set({ user, institution, loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Google ile giriş başarısız';
      let translatedError = errorMessage;
      
      if (errorMessage.includes('popup-closed-by-user')) {
        translatedError = 'Giriş penceresi kapatıldı.';
      } else if (errorMessage.includes('unauthorized-domain')) {
        translatedError = 'Bu alan adı (domain) yetkisiz. Lütfen Firebase konsolundan ekleyin.';
      }
      
      set({ error: translatedError, loading: false });
      throw new Error(translatedError);
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await signOut(auth);
      set({ user: null, institution: null, loading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Çıkış başarısız';
      set({ error: errorMessage, loading: false });
    }
  },

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let user = await mapFirebaseUser(firebaseUser);
        
        // Fetch extended user data (institutionId, etc)
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        let institution = null;
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          user = { ...user, ...userData }; // Merge Firestore data
          if (user.institutionId) {
            institution = await getInstitution(user.institutionId);
          }
        }
        
        set({ user, institution, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    });
    return unsubscribe;
  },

  createInstitution: async (name: string) => {
    set({ loading: true });
    try {
      const currentUser = get().user;
      if (!currentUser) throw new Error('Kullanıcı oturumu bulunamadı');

      const institutionRef = doc(db, 'institutions', crypto.randomUUID());
      const now = new Date();
      
      const institutionData = {
        name,
        founderId: currentUser.uid,
        createdAt: now,
        updatedAt: now,
      };

      await setDoc(institutionRef, institutionData);

      // Update User
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { 
        institutionId: institutionRef.id,
        role: 'admin' // Founder is always admin
      }, { merge: true });

      // Update State
      set((state) => ({
        user: state.user ? { ...state.user, institutionId: institutionRef.id, role: 'admin' } : null,
        institution: { id: institutionRef.id, ...institutionData },
        loading: false
      }));

    } catch (error) {
      console.error('Error creating institution:', error);
      set({ error: 'Kurum oluşturulurken bir hata oluştu', loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  
  // Role helpers
  isAdmin: () => get().user?.role === 'admin',
  isTeacher: () => get().user?.role === 'teacher',
}));

