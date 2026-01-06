import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { Course } from '@/types';
import { COLLECTIONS } from './constants';

interface CourseState {
  courses: Course[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  addCourse: (institutionId: string, course: Omit<Course, 'id' | 'institutionId'>) => Promise<string>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;
}

export const useCourseStore = create<CourseState>()((set, get) => {
  let currentInstitutionId: string | null = null;

  return {
    courses: [],
    loading: false,
    initialized: false,

    initialize: (institutionId: string) => {
      if (get().initialized && currentInstitutionId === institutionId) return;
      currentInstitutionId = institutionId;
      set({ loading: true });

      const coursesRef = collection(db, COLLECTIONS.courses);
      const coursesQuery = query(coursesRef, where('institutionId', '==', institutionId));

      onSnapshot(coursesQuery, (snapshot) => {
        const courses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        set({ courses, loading: false, initialized: true });
      });
    },

    addCourse: async (institutionId, courseData) => {
      const docRef = await addDoc(collection(db, COLLECTIONS.courses), {
        ...courseData,
        institutionId,
      });
      return docRef.id;
    },

    updateCourse: async (id, data) => {
      await updateDoc(doc(db, COLLECTIONS.courses, id), data);
    },

    deleteCourse: async (id) => {
      await deleteDoc(doc(db, COLLECTIONS.courses, id));
    },

    getCourse: (id) => get().courses.find((c) => c.id === id),
  };
});
