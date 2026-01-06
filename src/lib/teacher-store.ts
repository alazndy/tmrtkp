import { create } from 'zustand';
import { db } from './firebase';
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
import { Teacher } from '@/types';

const COLLECTION = 'teachers';

interface TeacherState {
  teachers: Teacher[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  addTeacher: (teacher: Omit<Teacher, 'id' | 'createdAt' | 'institutionId'>) => Promise<string>;
  updateTeacher: (id: string, data: Partial<Teacher>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  getTeacher: (id: string) => Teacher | undefined;
  getActiveTeachers: () => Teacher[];
}

export const useTeacherStore = create<TeacherState>()((set, get) => {
  let institutionId: string | null = null;

  return {
    teachers: [],
    loading: false,
    initialized: false,

    initialize: (instId: string) => {
      if (get().initialized && institutionId === instId) return;
      institutionId = instId;
      set({ loading: true });

      const teachersRef = collection(db, COLLECTION);
      const teachersQuery = query(teachersRef, where('institutionId', '==', instId));

      onSnapshot(teachersQuery, (snapshot) => {
        const teachers = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Teacher;
        });
        set({ teachers, loading: false, initialized: true });
      });
    },

    addTeacher: async (teacherData) => {
      if (!institutionId) throw new Error('Institution ID missing');

      const docRef = await addDoc(collection(db, COLLECTION), {
        ...teacherData,
        institutionId,
        isActive: true,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },

    updateTeacher: async (id, data) => {
      await updateDoc(doc(db, COLLECTION, id), data);
    },

    deleteTeacher: async (id) => {
      await deleteDoc(doc(db, COLLECTION, id));
    },

    getTeacher: (id) => get().teachers.find((t) => t.id === id),

    getActiveTeachers: () => get().teachers.filter((t) => t.isActive),
  };
});
