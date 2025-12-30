'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, TurkishLira } from 'lucide-react';

export default function CoursesPage() {
  const { courses, getEnrollmentsWithDetails } = useAppStore();
  const allEnrollments = getEnrollmentsWithDetails();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kurslar</h1>
        <p className="text-muted-foreground">Mevcut kurs seçenekleri</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const activeEnrollments = allEnrollments.filter(
            (e) => e.courseId === course.id && e.status === 'active'
          );
          
          return (
            <Card key={course.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {course.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Süre
                    </span>
                    <span className="font-medium">{course.durationDays} gün</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <TurkishLira className="h-4 w-4" />
                      Ücret
                    </span>
                    <span className="font-medium">{course.price.toLocaleString('tr-TR')}₺</span>
                  </div>
                  <div className="pt-2 border-t">
                    <Badge variant={activeEnrollments.length > 0 ? 'default' : 'secondary'}>
                      {activeEnrollments.length} aktif öğrenci
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
