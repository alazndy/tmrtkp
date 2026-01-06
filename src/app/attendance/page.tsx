'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { CalendarIcon, Check, X, Clock, FileText, Save, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStatus, AttendanceRecord } from '@/types';

// Yoklama durumu seçenekleri
const statusOptions: { value: AttendanceStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'present', label: 'Var', icon: <Check className="h-4 w-4" />, color: 'bg-green-500' },
  { value: 'absent', label: 'Yok', icon: <X className="h-4 w-4" />, color: 'bg-red-500' },
  { value: 'late', label: 'Geç', icon: <Clock className="h-4 w-4" />, color: 'bg-yellow-500' },
  { value: 'excused', label: 'İzinli', icon: <FileText className="h-4 w-4" />, color: 'bg-blue-500' },
];

export default function AttendancePage() {
  const { 
    courses, 
    enrollments, 
    students, 
    saveAttendance, 
    getAttendanceByDate,
    getCourseAttendanceHistory 
  } = useAppStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Seçili kursa kayıtlı aktif öğrenciler
  const enrolledStudents = useMemo(() => {
    if (!selectedCourseId) return [];
    
    return enrollments
      .filter(e => e.courseId === selectedCourseId && e.status === 'active')
      .map(e => students.find(s => s.id === e.studentId))
      .filter(Boolean)
      .sort((a, b) => a!.firstName.localeCompare(b!.firstName, 'tr'));
  }, [selectedCourseId, enrollments, students]);

  // Seçili tarih için mevcut yoklama
  const existingAttendance = useMemo(() => {
    if (!selectedCourseId) return null;
    return getAttendanceByDate(selectedCourseId, selectedDate);
  }, [selectedCourseId, selectedDate, getAttendanceByDate]);

  // Yoklama geçmişi
  const attendanceHistory = useMemo(() => {
    if (!selectedCourseId) return [];
    return getCourseAttendanceHistory(selectedCourseId).slice(0, 5);
  }, [selectedCourseId, getCourseAttendanceHistory]);

  // Kurs değiştiğinde mevcut yoklamayı yükle
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    setSaved(false);
    
    // Reset records
    const newRecords: Record<string, AttendanceStatus> = {};
    const existing = getAttendanceByDate(courseId, selectedDate);
    
    if (existing) {
      existing.records.forEach(r => {
        newRecords[r.studentId] = r.status;
      });
    }
    
    setRecords(newRecords);
  };

  // Tarih değiştiğinde mevcut yoklamayı yükle
  const handleDateChange = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    setSaved(false);
    
    if (selectedCourseId) {
      const newRecords: Record<string, AttendanceStatus> = {};
      const existing = getAttendanceByDate(selectedCourseId, date);
      
      if (existing) {
        existing.records.forEach(r => {
          newRecords[r.studentId] = r.status;
        });
      }
      
      setRecords(newRecords);
    }
  };

  // Yoklama durumunu değiştir
  const toggleStatus = (studentId: string) => {
    const currentStatus = records[studentId] || 'absent';
    const statusOrder: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    
    setRecords(prev => ({
      ...prev,
      [studentId]: nextStatus,
    }));
    setSaved(false);
  };

  // Belirli bir durumu seç
  const setStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: status,
    }));
    setSaved(false);
  };

  // Yoklamayı kaydet
  const handleSave = async () => {
    if (!selectedCourseId || enrolledStudents.length === 0) return;
    
    setSaving(true);
    try {
      const attendanceRecords: AttendanceRecord[] = enrolledStudents.map(student => ({
        studentId: student!.id,
        status: records[student!.id] || 'absent',
      }));
      
      await saveAttendance(selectedCourseId, selectedDate, attendanceRecords);
      setSaved(true);
    } catch (error) {
      console.error('Yoklama kaydedilemedi:', error);
    } finally {
      setSaving(false);
    }
  };

  // Herkesi var işaretle
  const markAllPresent = () => {
    const newRecords: Record<string, AttendanceStatus> = {};
    enrolledStudents.forEach(student => {
      if (student) newRecords[student.id] = 'present';
    });
    setRecords(newRecords);
    setSaved(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const option = statusOptions.find(o => o.value === status);
    if (!option) return null;
    
    return (
      <Badge className={cn('gap-1', option.color)}>
        {option.icon}
        {option.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Yoklama</h1>
        <p className="text-muted-foreground">Kurs bazlı öğrenci yoklaması alın</p>
      </div>

      {/* Kurs ve Tarih Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle>Yoklama Bilgileri</CardTitle>
          <CardDescription>Kurs ve tarih seçin</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Kurs Seçimi */}
            <div className="w-64">
              <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kurs seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tarih Seçimi */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-64 justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  locale={tr}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* Herkesi Var İşaretle */}
            {selectedCourseId && enrolledStudents.length > 0 && (
              <Button variant="outline" onClick={markAllPresent}>
                <Check className="mr-2 h-4 w-4" />
                Herkesi Var İşaretle
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Yoklama Listesi */}
      {selectedCourseId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Öğrenci Listesi</CardTitle>
                {existingAttendance && (
                  <Badge variant="secondary">Kayıtlı Yoklama</Badge>
                )}
                {saved && (
                  <Badge variant="default" className="bg-green-500">✓ Kaydedildi</Badge>
                )}
              </div>
              <Button onClick={handleSave} disabled={saving || enrolledStudents.length === 0}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}
              </Button>
            </div>
            <CardDescription>
              {enrolledStudents.length} aktif öğrenci
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrolledStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Bu kursa kayıtlı aktif öğrenci bulunmuyor.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Öğrenci</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Hızlı Seçim</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((student, index) => {
                    if (!student) return null;
                    const status = records[student.id] || 'absent';
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{student.firstName} {student.lastName}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <button onClick={() => toggleStatus(student.id)}>
                            {getStatusBadge(status)}
                          </button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {statusOptions.map(option => (
                              <Button
                                key={option.value}
                                size="icon"
                                variant={status === option.value ? 'default' : 'outline'}
                                className={cn(
                                  'h-8 w-8',
                                  status === option.value && option.color
                                )}
                                onClick={() => setStatus(student.id, option.value)}
                                title={option.label}
                              >
                                {option.icon}
                              </Button>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Yoklama Geçmişi */}
      {selectedCourseId && attendanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Son Yoklamalar</CardTitle>
            <CardDescription>Bu kursun son 5 yoklama kaydı</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attendanceHistory.map(attendance => {
                const presentCount = attendance.records.filter(r => r.status === 'present').length;
                const totalCount = attendance.records.length;
                
                return (
                  <div 
                    key={attendance.id} 
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleDateChange(attendance.date)}
                  >
                    <span className="font-medium">
                      {format(attendance.date, 'd MMMM yyyy, EEEE', { locale: tr })}
                    </span>
                    <Badge variant="outline">
                      {presentCount}/{totalCount} katılım
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
