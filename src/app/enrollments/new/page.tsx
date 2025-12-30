'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Save, CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

function NewEnrollmentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get('studentId');
  
  const { students, courses, enrollStudent, getCourse } = useAppStore();

  const [selectedStudentId, setSelectedStudentId] = useState(preselectedStudentId || '');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCourse = selectedCourseId ? getCourse(selectedCourseId) : null;
  const endDate = startDate && selectedCourse 
    ? addDays(startDate, selectedCourse.durationDays) 
    : null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedStudentId) newErrors.student = 'Öğrenci seçiniz';
    if (!selectedCourseId) newErrors.course = 'Kurs seçiniz';
    if (!startDate) newErrors.startDate = 'Başlangıç tarihi seçiniz';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await enrollStudent(
        selectedStudentId,
        selectedCourseId,
        startDate!,
        notes.trim() || undefined
      );
      router.push('/enrollments');
    } catch (error) {
      console.error('Error enrolling student:', error);
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/enrollments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Yeni Kayıt</h1>
          <p className="text-muted-foreground">Öğrenciyi kursa kaydedin</p>
        </div>
      </div>

      {students.length === 0 ? (
        <Card className="max-w-2xl">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground mb-4">
              Kayıt yapabilmek için önce öğrenci eklemelisiniz.
            </p>
            <Link href="/students/new">
              <Button>Öğrenci Ekle</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Kayıt Bilgileri</CardTitle>
            <CardDescription>Öğrenci ve kurs bilgilerini seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Öğrenci *</Label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Öğrenci seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.student && (
                  <p className="text-sm text-destructive">{errors.student}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Kurs *</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.durationDays} gün - {course.price}₺)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.course && (
                  <p className="text-sm text-destructive">{errors.course}</p>
                )}
                {selectedCourse && (
                  <p className="text-sm text-muted-foreground">
                    {selectedCourse.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Başlangıç Tarihi *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'd MMMM yyyy', { locale: tr }) : 'Tarih seçin'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      locale={tr}
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate}</p>
                )}
              </div>

              {endDate && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="text-sm font-medium">Tahmini Bitiş Tarihi</p>
                  <p className="text-lg font-bold text-primary">
                    {format(endDate, 'd MMMM yyyy', { locale: tr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ({selectedCourse?.durationDays} gün sonra)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Kayıt hakkında ek notlar..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Kaydet
                </Button>
                <Link href="/enrollments">
                  <Button type="button" variant="outline">
                    İptal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewEnrollmentPage() {
  return (
    <Suspense fallback={<div className="p-6">Yükleniyor...</div>}>
      <NewEnrollmentForm />
    </Suspense>
  );
}
