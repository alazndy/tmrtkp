// Firestore Collection Names
export const COLLECTIONS = {
  students: 'students',
  courses: 'courses',
  enrollments: 'enrollments',
  attendance: 'attendance',
} as const;

// Default Courses Structure for seeding (multi-tenant aware)
export const defaultCoursesData = [
  { name: 'A1.1', description: 'Başlangıç seviyesi - 1. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A1.2', description: 'Başlangıç seviyesi - 2. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A1.3', description: 'Başlangıç seviyesi - 3. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A2.1', description: 'Temel seviye - 1. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A2.2', description: 'Temel seviye - 2. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A2.3', description: 'Temel seviye - 3. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A2.4', description: 'Temel seviye - 4. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'A2.5', description: 'Temel seviye - 5. modül', category: 'Türk İşaret Dili', durationDays: 30, price: 2000 },
  { name: 'B1', description: 'Orta seviye', category: 'Türk İşaret Dili', durationDays: 60, price: 4000 },
  { name: 'B2', description: 'Orta üstü seviye', category: 'Türk İşaret Dili', durationDays: 60, price: 4000 },
  { name: 'C1', description: 'İleri seviye', category: 'Türk İşaret Dili', durationDays: 90, price: 5500 },
  { name: 'C2', description: 'Uzman seviye', category: 'Türk İşaret Dili', durationDays: 90, price: 5500 },
];

// Mock students for seeding
export const mockStudentsData = [
  { firstName: 'Ahmet', lastName: 'Yılmaz', email: 'ahmet@example.com', phone: '5551234567' },
  { firstName: 'Ayşe', lastName: 'Demir', email: 'ayse@example.com', phone: '5552345678' },
  { firstName: 'Mehmet', lastName: 'Kaya', email: 'mehmet@example.com', phone: '5553456789' },
  { firstName: 'Fatma', lastName: 'Çelik', email: 'fatma@example.com', phone: '5554567890' },
  { firstName: 'Ali', lastName: 'Şahin', email: 'ali@example.com', phone: '5555678901' },
  { firstName: 'Zeynep', lastName: 'Arslan', email: 'zeynep@example.com', phone: '5556789012' },
];
