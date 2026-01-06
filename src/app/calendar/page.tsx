'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';

// Days of week in Turkish
const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

// Time slots
const TIME_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Mock schedule data (in real app, this would come from Firestore)
interface ScheduleItem {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0 = Monday
  startTime: string;
  endTime: string;
  room?: string;
}

export default function CalendarPage() {
  const { courses, getEnrollmentsWithDetails } = useAppStore();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedCourse, setSelectedCourse] = useState<string>('all');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const enrollments = getEnrollmentsWithDetails();
  const activeEnrollments = enrollments.filter(e => e.status === 'active');

  // Group active enrollments by course for the schedule display
  const courseSchedule = useMemo(() => {
    const schedule: Record<string, { students: number; course: typeof courses[0] }> = {};
    
    activeEnrollments.forEach(enrollment => {
      if (!schedule[enrollment.courseId]) {
        schedule[enrollment.courseId] = {
          students: 0,
          course: enrollment.course,
        };
      }
      schedule[enrollment.courseId].students++;
    });

    return Object.values(schedule).filter(item => 
      selectedCourse === 'all' || item.course.id === selectedCourse
    );
  }, [activeEnrollments, selectedCourse, courses]);

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentWeek(direction === 'prev' ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Takvim</h1>
          <p className="text-muted-foreground">Haftalık ders programı ve planlama</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-medium ml-2">
                {format(weekStart, 'd MMMM', { locale: tr })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: tr })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setCurrentWeek(new Date())}>
                Bugün
              </Button>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Kurs filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kurslar</SelectItem>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div 
                  key={index} 
                  className={`text-center p-3 rounded-lg ${isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  <p className="font-medium">{DAYS[index]}</p>
                  <p className={`text-2xl font-bold ${isToday ? '' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
              );
            })}

            {/* Schedule Content */}
            {weekDays.map((day, dayIndex) => (
              <div key={`content-${dayIndex}`} className="min-h-[200px] border rounded-lg p-2 space-y-2">
                {courseSchedule.map((item, idx) => (
                  <div 
                    key={`${item.course.id}-${idx}`}
                    className="p-2 rounded-lg bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50 border border-violet-200 dark:border-violet-800"
                  >
                    <p className="font-medium text-sm truncate">{item.course.name}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Users className="h-3 w-3" />
                      {item.students} öğrenci
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Courses Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courseSchedule.map((item) => (
          <Card key={item.course.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{item.course.name}</span>
                <Badge>{item.course.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Öğrenci Sayısı
                </span>
                <span className="font-medium">{item.students}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Süre
                </span>
                <span className="font-medium">{item.course.durationDays} gün</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/50">
        <CardContent className="flex items-center gap-4 py-4">
          <CalendarIcon className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="font-medium">Ders Programı Özelliği</p>
            <p className="text-sm text-muted-foreground">
              Detaylı ders programı oluşturma özelliği yakında eklenecek. 
              Şu an için aktif kursları ve öğrenci sayılarını görüntüleyebilirsiniz.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
