// Types for Cisem Student Tracking App

// Auth Types
export type UserRole = 'admin' | 'teacher';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  institutionId?: string; // Optional initially, required after onboarding
}

export interface Institution {
  id: string;
  name: string;
  founderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invite {
  id: string; // token
  institutionId: string;
  role: UserRole;
  used: boolean;
  expiresAt: Date;
  createdBy: string;
}

export interface Student {
  id: string;
  institutionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes?: string;
  // KVKK Rıza Bilgileri
  kvkkConsentDate?: Date;      // Rıza verilme tarihi
  kvkkConsentVersion?: string; // Aydınlatma metni versiyonu (örn: "1.0")
  createdAt: Date;
  updatedAt: Date;
}

export interface Course {
  id: string;
  institutionId: string;
  name: string;
  description: string;
  category: string; // e.g., "Türk İşaret Dili", "İngilizce", "Türkçe"
  durationDays: number;
  price: number;
}

export interface Enrollment {
  id: string;
  institutionId: string;
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

// Yoklama Tipleri
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

// Tek bir öğrencinin yoklama kaydı
export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
}

// Bir günlük yoklama oturumu
export interface Attendance {
  id: string;
  institutionId: string;
  courseId: string;
  date: Date;
  records: AttendanceRecord[];
  notes?: string;
  createdAt: Date;
  createdBy?: string; // Auth user ID
}

// Yoklama detaylı görünüm
export interface AttendanceWithDetails extends Attendance {
  course: Course;
  recordsWithStudents: {
    student: Student;
    status: AttendanceStatus;
  }[];
}

// ===== PHASE 1: Payment & Notification Types =====

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface Payment {
  id: string;
  institutionId: string;
  studentId: string;
  enrollmentId: string;
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: PaymentStatus;
  method?: PaymentMethod;
  notes?: string;
  createdAt: Date;
}

export interface PaymentWithDetails extends Payment {
  student: Student;
  enrollment: Enrollment;
  course: Course;
}

export type NotificationType = 'expiry' | 'payment' | 'attendance' | 'system';

export interface Notification {
  id: string;
  institutionId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt: Date;
}

// ===== TEACHER & SCHEDULE TYPES =====

export interface Teacher {
  id: string;
  institutionId: string;
  userId?: string; // Linked to auth user if exists
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty?: string; // e.g., "Türk İşaret Dili", "İngilizce"
  hourlyRate?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface CourseSchedule {
  id: string;
  institutionId: string;
  courseId: string;
  teacherId?: string;
  dayOfWeek: number; // 0-6 (Mon-Sun)
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  room?: string;
}

// ===== WHATSAPP MESSAGE TYPES =====

export type MessageTemplateType = 'welcome' | 'payment_reminder' | 'course_expiry' | 'attendance_alert' | 'custom';

export interface MessageTemplate {
  id: string;
  institutionId: string;
  type: MessageTemplateType;
  name: string;
  content: string; // Supports {{placeholders}}
  isActive: boolean;
}

export interface MessageLog {
  id: string;
  institutionId: string;
  studentId: string;
  templateId?: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  createdAt: Date;
}
