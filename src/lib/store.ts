import { create } from 'zustand';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { Student, Course, Enrollment, EnrollmentWithDetails, EnrollmentStatus } from '@/types';
import { addDays, differenceInDays, isAfter } from 'date-fns';

// Default Courses (will be seeded if collection is empty)
const defaultCourses: Omit<Course, 'id'>[] = [
  { name: 'A1.1', description: 'Başlangıç seviyesi - 1. modül', durationDays: 30, price: 2000 },
  { name: 'A1.2', description: 'Başlangıç seviyesi - 2. modül', durationDays: 30, price: 2000 },
  { name: 'A1.3', description: 'Başlangıç seviyesi - 3. modül', durationDays: 30, price: 2000 },
  { name: 'A2.1', description: 'Temel seviye - 1. modül', durationDays: 30, price: 2000 },
  { name: 'A2.2', description: 'Temel seviye - 2. modül', durationDays: 30, price: 2000 },
  { name: 'A2.3', description: 'Temel seviye - 3. modül', durationDays: 30, price: 2000 },
  { name: 'A2.4', description: 'Temel seviye - 4. modül', durationDays: 30, price: 2000 },
  { name: 'A2.5', description: 'Temel seviye - 5. modül', durationDays: 30, price: 2000 },
  { name: 'B1', description: 'Orta seviye', durationDays: 60, price: 4000 },
  { name: 'B2', description: 'Orta üstü seviye', durationDays: 60, price: 4000 },
  { name: 'C1', description: 'İleri seviye', durationDays: 90, price: 5500 },
  { name: 'C2', description: 'Uzman seviye', durationDays: 90, price: 5500 },
];

// Firestore collection names
const COLLECTIONS = {
  students: 'students',
  courses: 'courses',
  enrollments: 'enrollments',
};

// Helper to convert Firestore Timestamp to Date
const toDate = (timestamp: Timestamp | Date): Date => {
  return timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
};

interface AppState {
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  loading: boolean;
  initialized: boolean;

  // Initialize listeners
  initialize: () => Promise<void>;

  // Student actions
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Student | undefined;

  // Course actions
  addCourse: (course: Omit<Course, 'id'>) => Promise<string>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;

  // Enrollment actions
  enrollStudent: (studentId: string, courseId: string, startDate: Date, notes?: string) => Promise<string>;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => Promise<void>;
  cancelEnrollment: (id: string) => Promise<void>;
  completeEnrollment: (id: string) => Promise<void>;

  // Derived data
  getEnrollmentsWithDetails: () => EnrollmentWithDetails[];
  getExpiringEnrollments: (daysThreshold?: number) => EnrollmentWithDetails[];
  getStudentEnrollments: (studentId: string) => EnrollmentWithDetails[];
}

export const useAppStore = create<AppState>()((set, get) => ({
  students: [],
  courses: [],
  enrollments: [],
  loading: true,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    // Set up real-time listeners
    const studentsRef = collection(db, COLLECTIONS.students);
    const coursesRef = collection(db, COLLECTIONS.courses);
    const enrollmentsRef = collection(db, COLLECTIONS.enrollments);

    // Check if courses collection is empty, seed if needed
    const coursesSnapshot = await getDocs(coursesRef);
    if (coursesSnapshot.empty) {
      for (const course of defaultCourses) {
        await addDoc(coursesRef, course);
      }
    }

    // Students listener
    onSnapshot(query(studentsRef, orderBy('createdAt', 'desc')), (snapshot) => {
      const students = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: toDate(doc.data().createdAt),
        updatedAt: toDate(doc.data().updatedAt),
      })) as Student[];
      set({ students });
    });

    // Courses listener
    onSnapshot(coursesRef, (snapshot) => {
      const courses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
      set({ courses });
    });

    // Enrollments listener
    onSnapshot(query(enrollmentsRef, orderBy('createdAt', 'desc')), (snapshot) => {
      const enrollments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: toDate(doc.data().startDate),
        endDate: toDate(doc.data().endDate),
        createdAt: toDate(doc.data().createdAt),
      })) as Enrollment[];
      set({ enrollments, loading: false });
    });

    set({ initialized: true, loading: false });
  },

  // Student actions
  addStudent: async (studentData) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.students), {
      ...studentData,
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
    // Delete student
    await deleteDoc(doc(db, COLLECTIONS.students, id));
    // Delete related enrollments
    const enrollments = get().enrollments.filter((e) => e.studentId === id);
    for (const enrollment of enrollments) {
      await deleteDoc(doc(db, COLLECTIONS.enrollments, enrollment.id));
    }
  },

  getStudent: (id) => get().students.find((s) => s.id === id),

  // Course actions
  addCourse: async (courseData) => {
    const docRef = await addDoc(collection(db, COLLECTIONS.courses), courseData);
    return docRef.id;
  },

  updateCourse: async (id, data) => {
    await updateDoc(doc(db, COLLECTIONS.courses, id), data);
  },

  deleteCourse: async (id) => {
    await deleteDoc(doc(db, COLLECTIONS.courses, id));
  },

  getCourse: (id) => get().courses.find((c) => c.id === id),

  // Enrollment actions
  enrollStudent: async (studentId, courseId, startDate, notes) => {
    const course = get().getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const endDate = addDays(startDate, course.durationDays);

    const docRef = await addDoc(collection(db, COLLECTIONS.enrollments), {
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

  // Derived data
  getEnrollmentsWithDetails: () => {
    const { students, courses, enrollments } = get();
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

  getExpiringEnrollments: (daysThreshold = 7) => {
    return get()
      .getEnrollmentsWithDetails()
      .filter(
        (e) =>
          e.status === 'active' &&
          e.daysRemaining > 0 &&
          e.daysRemaining <= daysThreshold
      )
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  },

  getStudentEnrollments: (studentId) => {
    return get()
      .getEnrollmentsWithDetails()
      .filter((e) => e.studentId === studentId);
  },
}));
