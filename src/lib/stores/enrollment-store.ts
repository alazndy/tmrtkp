import { create } from 'zustand';
import { db } from '../firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { Enrollment, EnrollmentWithDetails, EnrollmentStatus, Student, Course } from '@/types';
import { addDays, differenceInDays, isAfter } from 'date-fns';
import { COLLECTIONS } from './constants';
import { toDate } from './utils';

interface EnrollmentState {
  enrollments: Enrollment[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  enrollStudent: (
    institutionId: string,
    studentId: string,
    courseId: string,
    courseDurationDays: number,
    startDate: Date,
    notes?: string
  ) => Promise<string>;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => Promise<void>;
  cancelEnrollment: (id: string) => Promise<void>;
  completeEnrollment: (id: string) => Promise<void>;

  // These helpers need external data (students/courses) passed in
  getEnrollmentsWithDetails: (students: Student[], courses: Course[]) => EnrollmentWithDetails[];
  getExpiringEnrollments: (students: Student[], courses: Course[], daysThreshold?: number) => EnrollmentWithDetails[];
  getStudentEnrollments: (students: Student[], courses: Course[], studentId: string) => EnrollmentWithDetails[];
}

export const useEnrollmentStore = create<EnrollmentState>()((set, get) => {
  let currentInstitutionId: string | null = null;

  return {
    enrollments: [],
    loading: false,
    initialized: false,

    initialize: (institutionId: string) => {
      if (get().initialized && currentInstitutionId === institutionId) return;
      currentInstitutionId = institutionId;
      set({ loading: true });

      const enrollmentsRef = collection(db, COLLECTIONS.enrollments);
      const enrollmentsQuery = query(enrollmentsRef, where('institutionId', '==', institutionId));

      onSnapshot(enrollmentsQuery, (snapshot) => {
        const enrollments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          startDate: toDate(doc.data().startDate),
          endDate: toDate(doc.data().endDate),
          createdAt: toDate(doc.data().createdAt),
        })) as Enrollment[];
        set({ enrollments, loading: false, initialized: true });
      });
    },

    enrollStudent: async (institutionId, studentId, courseId, courseDurationDays, startDate, notes) => {
      const endDate = addDays(startDate, courseDurationDays);

      const docRef = await addDoc(collection(db, COLLECTIONS.enrollments), {
        institutionId,
        studentId,
        courseId,
        startDate: Timestamp.fromDate(startDate),
        endDate: Timestamp.fromDate(endDate),
        status: 'active',
        notes: notes || null,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },

    updateEnrollment: async (id, data) => {
      await updateDoc(doc(db, COLLECTIONS.enrollments, id), data);
    },

    cancelEnrollment: async (id) => {
      await get().updateEnrollment(id, { status: 'cancelled' });
    },

    completeEnrollment: async (id) => {
      await get().updateEnrollment(id, { status: 'completed' });
    },

    getEnrollmentsWithDetails: (students, courses) => {
      const { enrollments } = get();
      const today = new Date();

      return enrollments
        .map((enrollment) => {
          const student = students.find((s) => s.id === enrollment.studentId);
          const course = courses.find((c) => c.id === enrollment.courseId);

          if (!student || !course) return null;

          const endDate = new Date(enrollment.endDate);
          const daysRemaining = differenceInDays(endDate, today);

          let status: EnrollmentStatus = enrollment.status;
          if (status === 'active' && isAfter(today, endDate)) {
            status = 'expired';
          }

          return {
            ...enrollment,
            endDate,
            startDate: new Date(enrollment.startDate),
            student,
            course,
            daysRemaining,
            isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7 && status === 'active',
            status,
          };
        })
        .filter(Boolean) as EnrollmentWithDetails[];
    },

    getExpiringEnrollments: (students, courses, daysThreshold = 7) => {
      return get()
        .getEnrollmentsWithDetails(students, courses)
        .filter(
          (e) =>
            e.status === 'active' &&
            e.daysRemaining > 0 &&
            e.daysRemaining <= daysThreshold
        )
        .sort((a, b) => a.daysRemaining - b.daysRemaining);
    },

    getStudentEnrollments: (students, courses, studentId) => {
      return get()
        .getEnrollmentsWithDetails(students, courses)
        .filter((e) => e.studentId === studentId);
    },
  };
});
