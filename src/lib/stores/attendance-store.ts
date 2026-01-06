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
import { Attendance, AttendanceRecord } from '@/types';
import { startOfDay } from 'date-fns';
import { COLLECTIONS } from './constants';
import { toDate } from './utils';

interface AttendanceState {
  attendance: Attendance[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  saveAttendance: (
    institutionId: string,
    courseId: string,
    date: Date,
    records: AttendanceRecord[],
    notes?: string
  ) => Promise<string>;
  getAttendanceByDate: (courseId: string, date: Date) => Attendance | undefined;
  getCourseAttendanceHistory: (courseId: string) => Attendance[];
  getStudentAttendanceStats: (studentId: string) => {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
}

export const useAttendanceStore = create<AttendanceState>()((set, get) => {
  let currentInstitutionId: string | null = null;

  return {
    attendance: [],
    loading: false,
    initialized: false,

    initialize: (institutionId: string) => {
      if (get().initialized && currentInstitutionId === institutionId) return;
      currentInstitutionId = institutionId;
      set({ loading: true });

      const attendanceRef = collection(db, COLLECTIONS.attendance);
      const attendanceQuery = query(attendanceRef, where('institutionId', '==', institutionId));

      onSnapshot(attendanceQuery, (snapshot) => {
        const attendance = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: toDate(doc.data().date),
          createdAt: toDate(doc.data().createdAt),
        })) as Attendance[];
        
        // Sort by date descending
        attendance.sort((a, b) => b.date.getTime() - a.date.getTime());
        set({ attendance, loading: false, initialized: true });
      });
    },

    saveAttendance: async (institutionId, courseId, date, records, notes) => {
      const normalizedDate = startOfDay(date);
      const existing = get().getAttendanceByDate(courseId, normalizedDate);

      if (existing) {
        await updateDoc(doc(db, COLLECTIONS.attendance, existing.id), {
          records,
          notes: notes || null,
        });
        return existing.id;
      } else {
        const docRef = await addDoc(collection(db, COLLECTIONS.attendance), {
          institutionId,
          courseId,
          date: Timestamp.fromDate(normalizedDate),
          records,
          notes: notes || null,
          createdAt: Timestamp.now(),
        });
        return docRef.id;
      }
    },

    getAttendanceByDate: (courseId, date) => {
      const normalizedDate = startOfDay(date).getTime();
      return get().attendance.find(
        (a) => a.courseId === courseId && startOfDay(a.date).getTime() === normalizedDate
      );
    },

    getCourseAttendanceHistory: (courseId) => {
      return get()
        .attendance.filter((a) => a.courseId === courseId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getStudentAttendanceStats: (studentId) => {
      const stats = { present: 0, absent: 0, late: 0, excused: 0, total: 0 };

      get().attendance.forEach((attendance) => {
        const record = attendance.records.find((r) => r.studentId === studentId);
        if (record) {
          stats.total++;
          stats[record.status]++;
        }
      });

      return stats;
    },
  };
});
