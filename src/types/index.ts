// Types for Cisem Student Tracking App

// Auth Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  durationDays: number; // Duration of the course in days
  price: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  startDate: Date;
  endDate: Date; // Calculated: startDate + course.durationDays
  status: EnrollmentStatus;
  notes?: string;
  createdAt: Date;
}

export type EnrollmentStatus = 'active' | 'completed' | 'expired' | 'cancelled';

// Derived view types
export interface EnrollmentWithDetails extends Enrollment {
  student: Student;
  course: Course;
  daysRemaining: number;
  isExpiringSoon: boolean; // true if <= 7 days remaining
}
