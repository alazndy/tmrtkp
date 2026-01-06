'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { Student, Enrollment, Course } from '@/types';

interface AddPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  enrollments: Enrollment[];
  courses: Course[];
  onSubmit: (data: {
    studentId: string;
    enrollmentId: string;
    amount: number;
    dueDate: Date;
  }) => Promise<void>;
}

export function AddPaymentDialog({
  open,
  onOpenChange,
  students,
  enrollments,
  courses,
  onSubmit,
}: AddPaymentDialogProps) {
  const [studentId, setStudentId] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get student enrollments for form
  const studentEnrollments = useMemo(() => {
    if (!studentId) return [];
    return enrollments.filter((e) => e.studentId === studentId && e.status === 'active');
  }, [studentId, enrollments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        studentId,
        enrollmentId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
      });
      // Reset form
      setStudentId('');
      setEnrollmentId('');
      setAmount('');
      setDueDate('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setStudentId('');
      setEnrollmentId('');
      setAmount('');
      setDueDate('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
          <DialogDescription>Öğrenci için ödeme planı oluşturun.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Öğrenci</Label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Öğrenci seçin" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.firstName} {s.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Kayıt (Kurs)</Label>
            <Select value={enrollmentId} onValueChange={setEnrollmentId} disabled={!studentId}>
              <SelectTrigger>
                <SelectValue placeholder={studentId ? 'Kayıt seçin' : 'Önce öğrenci seçin'} />
              </SelectTrigger>
              <SelectContent>
                {studentEnrollments.map((e) => {
                  const course = courses.find((c) => c.id === e.courseId);
                  return (
                    <SelectItem key={e.id} value={e.id}>
                      {course?.name || 'Bilinmiyor'}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tutar (₺)</Label>
              <Input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vade Tarihi</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading || !studentId || !enrollmentId}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
