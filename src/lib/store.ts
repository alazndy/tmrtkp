/**
 * Unified App Store
 * 
 * This is the main store that combines all domain stores and provides
 * backward compatibility with the original monolithic store API.
 * 
 * For new code, consider using individual stores directly:
 * - useStudentStore
 * - useCourseStore
 * - useEnrollmentStore
 * - useAttendanceStore
 */

import { create } from 'zustand';
import { db } from './firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { Student, Course, Enrollment, EnrollmentWithDetails, Attendance, AttendanceRecord } from '@/types';
import { useStudentStore } from './stores/student-store';
import { useCourseStore } from './stores/course-store';
import { useEnrollmentStore } from './stores/enrollment-store';
import { useAttendanceStore } from './stores/attendance-store';
import { COLLECTIONS, defaultCoursesData, mockStudentsData } from './stores/constants';

interface AppState {
  // Core state
  students: Student[];
  courses: Course[];
  enrollments: Enrollment[];
  attendance: Attendance[];
  loading: boolean;
  initialized: boolean;
  institutionId: string | null;

  // Initialization
  initialize: (institutionId: string) => Promise<void>;
  reset: () => void;

  // Student operations
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'institutionId'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Student | undefined;

  // Course operations
  addCourse: (course: Omit<Course, 'id' | 'institutionId'>) => Promise<string>;
  updateCourse: (id: string, data: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  getCourse: (id: string) => Course | undefined;

  // Enrollment operations
  enrollStudent: (studentId: string, courseId: string, startDate: Date, notes?: string) => Promise<string>;
  updateEnrollment: (id: string, data: Partial<Enrollment>) => Promise<void>;
  cancelEnrollment: (id: string) => Promise<void>;
  completeEnrollment: (id: string) => Promise<void>;

  // Enrollment queries
  getEnrollmentsWithDetails: () => EnrollmentWithDetails[];
  getExpiringEnrollments: (daysThreshold?: number) => EnrollmentWithDetails[];
  getStudentEnrollments: (studentId: string) => EnrollmentWithDetails[];

  // Attendance operations
  saveAttendance: (courseId: string, date: Date, records: AttendanceRecord[], notes?: string) => Promise<string>;
  getAttendanceByDate: (courseId: string, date: Date) => Attendance | undefined;
  getCourseAttendanceHistory: (courseId: string) => Attendance[];
  getStudentAttendanceStats: (studentId: string) => { present: number; absent: number; late: number; excused: number; total: number };
}

export const useAppStore = create<AppState>()((set, get) => {
  // Subscribe to individual stores and sync state
  const syncState = () => {
    const studentState = useStudentStore.getState();
    const courseState = useCourseStore.getState();
    const enrollmentState = useEnrollmentStore.getState();
    const attendanceState = useAttendanceStore.getState();

    set({
      students: studentState.students,
      courses: courseState.courses,
      enrollments: enrollmentState.enrollments,
      attendance: attendanceState.attendance,
      loading: studentState.loading || courseState.loading || enrollmentState.loading || attendanceState.loading,
    });
  };

  // Subscribe to store changes
  useStudentStore.subscribe(syncState);
  useCourseStore.subscribe(syncState);
  useEnrollmentStore.subscribe(syncState);
  useAttendanceStore.subscribe(syncState);

  return {
    students: [],
    courses: [],
    enrollments: [],
    attendance: [],
    loading: false,
    initialized: false,
    institutionId: null,

    reset: () => {
      set({
        students: [],
        courses: [],
        enrollments: [],
        attendance: [],
        loading: false,
        initialized: false,
        institutionId: null,
      });
    },

    initialize: async (institutionId: string) => {
      if (get().initialized && get().institutionId === institutionId) return;

      // Reset if changing institution
      if (get().institutionId && get().institutionId !== institutionId) {
        get().reset();
      }

      set({ loading: true, institutionId });

      // Check if we need to seed data
      const coursesRef = collection(db, COLLECTIONS.courses);
      const coursesQuery = query(coursesRef, where('institutionId', '==', institutionId));
      const coursesSnapshot = await getDocs(coursesQuery);

      if (coursesSnapshot.empty) {
        // Seed default courses
        const studentsRef = collection(db, COLLECTIONS.students);
        const enrollmentsRef = collection(db, COLLECTIONS.enrollments);

        const createdCourseIds: string[] = [];
        for (const data of defaultCoursesData) {
          const docRef = await addDoc(coursesRef, { ...data, institutionId });
          createdCourseIds.push(docRef.id);
        }

        // Seed mock students
        const createdStudentIds: string[] = [];
        for (const student of mockStudentsData) {
          const docRef = await addDoc(studentsRef, {
            ...student,
            institutionId,
            notes: 'Demo öğrenci',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          });
          createdStudentIds.push(docRef.id);
        }

        // Enroll students in courses
        const now = new Date();
        for (let i = 0; i < createdStudentIds.length; i++) {
          const courseIndex = i % Math.min(3, createdCourseIds.length);
          const courseId = createdCourseIds[courseIndex];
          const durationDays = defaultCoursesData[courseIndex]?.durationDays || 30;

          await addDoc(enrollmentsRef, {
            institutionId,
            studentId: createdStudentIds[i],
            courseId,
            startDate: Timestamp.fromDate(now),
            endDate: Timestamp.fromDate(new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)),
            status: 'active',
            notes: null,
            createdAt: Timestamp.now(),
          });
        }
      }

      // Initialize all stores
      useStudentStore.getState().initialize(institutionId);
      useCourseStore.getState().initialize(institutionId);
      useEnrollmentStore.getState().initialize(institutionId);
      useAttendanceStore.getState().initialize(institutionId);

      set({ initialized: true, loading: false });
    },

    // Student operations - delegate to student store
    addStudent: async (studentData) => {
      const { institutionId } = get();
      if (!institutionId) throw new Error('Institution ID missing');
      return useStudentStore.getState().addStudent(institutionId, studentData);
    },

    updateStudent: async (id, data) => {
      return useStudentStore.getState().updateStudent(id, data);
    },

    deleteStudent: async (id) => {
      // Also delete related enrollments
      const enrollments = get().enrollments.filter((e) => e.studentId === id);
      for (const enrollment of enrollments) {
        await deleteDoc(doc(db, COLLECTIONS.enrollments, enrollment.id));
      }
      return useStudentStore.getState().deleteStudent(id);
    },

    getStudent: (id) => useStudentStore.getState().getStudent(id),

    // Course operations - delegate to course store
    addCourse: async (courseData) => {
      const { institutionId } = get();
      if (!institutionId) throw new Error('Institution ID missing');
      return useCourseStore.getState().addCourse(institutionId, courseData);
    },

    updateCourse: async (id, data) => {
      return useCourseStore.getState().updateCourse(id, data);
    },

    deleteCourse: async (id) => {
      return useCourseStore.getState().deleteCourse(id);
    },

    getCourse: (id) => useCourseStore.getState().getCourse(id),

    // Enrollment operations - delegate to enrollment store
    enrollStudent: async (studentId, courseId, startDate, notes) => {
      const { institutionId } = get();
      if (!institutionId) throw new Error('Institution ID missing');
      
      const course = get().getCourse(courseId);
      if (!course) throw new Error('Course not found');

      return useEnrollmentStore.getState().enrollStudent(
        institutionId,
        studentId,
        courseId,
        course.durationDays,
        startDate,
        notes
      );
    },

    updateEnrollment: async (id, data) => {
      return useEnrollmentStore.getState().updateEnrollment(id, data);
    },

    cancelEnrollment: async (id) => {
      return useEnrollmentStore.getState().cancelEnrollment(id);
    },

    completeEnrollment: async (id) => {
      return useEnrollmentStore.getState().completeEnrollment(id);
    },

    // Enrollment queries
    getEnrollmentsWithDetails: () => {
      const { students, courses } = get();
      return useEnrollmentStore.getState().getEnrollmentsWithDetails(students, courses);
    },

    getExpiringEnrollments: (daysThreshold = 7) => {
      const { students, courses } = get();
      return useEnrollmentStore.getState().getExpiringEnrollments(students, courses, daysThreshold);
    },

    getStudentEnrollments: (studentId) => {
      const { students, courses } = get();
      return useEnrollmentStore.getState().getStudentEnrollments(students, courses, studentId);
    },

    // Attendance operations - delegate to attendance store
    saveAttendance: async (courseId, date, records, notes) => {
      const { institutionId } = get();
      if (!institutionId) throw new Error('Institution ID missing');
      return useAttendanceStore.getState().saveAttendance(institutionId, courseId, date, records, notes);
    },

    getAttendanceByDate: (courseId, date) => {
      return useAttendanceStore.getState().getAttendanceByDate(courseId, date);
    },

    getCourseAttendanceHistory: (courseId) => {
      return useAttendanceStore.getState().getCourseAttendanceHistory(courseId);
    },

    getStudentAttendanceStats: (studentId) => {
      return useAttendanceStore.getState().getStudentAttendanceStats(studentId);
    },
  };
});
