import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { Student } from '@/types';
import { COLLECTIONS } from './constants';
import { toDate } from './utils';

interface StudentState {
  students: Student[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  addStudent: (institutionId: string, student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Student | undefined;
}

export const useStudentStore = create<StudentState>()((set, get) => {
  let currentInstitutionId: string | null = null;

  return {
    students: [],
    loading: false,
    initialized: false,

    initialize: (institutionId: string) => {
      if (get().initialized && currentInstitutionId === institutionId) return;
      currentInstitutionId = institutionId;
      set({ loading: true });

      const studentsRef = collection(db, COLLECTIONS.students);
      const studentsQuery = query(studentsRef, where('institutionId', '==', institutionId));

      onSnapshot(studentsQuery, (snapshot) => {
        const students = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: toDate(doc.data().createdAt),
          updatedAt: toDate(doc.data().updatedAt),
        })) as Student[];
        
        // Client-side sort: newest first
        students.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        set({ students, loading: false, initialized: true });
      });
    },

    addStudent: async (institutionId, studentData) => {
      const docRef = await addDoc(collection(db, COLLECTIONS.students), {
        ...studentData,
        institutionId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    },

    updateStudent: async (id, data) => {
      await updateDoc(doc(db, COLLECTIONS.students, id), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    },

    deleteStudent: async (id) => {
      await deleteDoc(doc(db, COLLECTIONS.students, id));
    },

    getStudent: (id) => get().students.find((s) => s.id === id),
  };
});
