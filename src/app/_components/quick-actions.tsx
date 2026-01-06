'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, GraduationCap, ClipboardList, CreditCard, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { Course } from '@/types';

interface QuickActionsProps {
  isAdmin: boolean;
  courses: Course[];
}

export function QuickActions({ isAdmin, courses }: QuickActionsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Quick Actions Card */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Hızlı İşlemler
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Link href="/students/new">
            <Button
              variant="outline"
              className="w-full justify-start h-12 gap-3 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700 dark:hover:bg-violet-950/50 dark:hover:border-violet-800 transition-all"
            >
              <div className="p-1.5 rounded-md bg-violet-500/10">
                <Plus className="h-4 w-4 text-violet-600" />
              </div>
              Yeni Öğrenci Ekle
            </Button>
          </Link>
          <Link href="/enrollments/new">
            <Button
              variant="outline"
              className="w-full justify-start h-12 gap-3 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 dark:hover:bg-emerald-950/50 dark:hover:border-emerald-800 transition-all"
            >
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <GraduationCap className="h-4 w-4 text-emerald-600" />
              </div>
              Kursa Kayıt Yap
            </Button>
          </Link>
          <Link href="/attendance">
            <Button
              variant="outline"
              className="w-full justify-start h-12 gap-3 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 dark:hover:bg-blue-950/50 dark:hover:border-blue-800 transition-all"
            >
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <ClipboardList className="h-4 w-4 text-blue-600" />
              </div>
              Yoklama Al
            </Button>
          </Link>
          {isAdmin && (
            <Link href="/payments">
              <Button
                variant="outline"
                className="w-full justify-start h-12 gap-3 hover:bg-green-50 hover:border-green-200 hover:text-green-700 dark:hover:bg-green-950/50 dark:hover:border-green-800 transition-all"
              >
                <div className="p-1.5 rounded-md bg-green-500/10">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                Ödeme Yönetimi
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Courses Overview Card */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            Kurslar
          </CardTitle>
          <CardDescription>{courses.length} adet kurs mevcut</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {courses.slice(0, 12).map((course) => (
              <Badge
                key={course.id}
                variant="secondary"
                className="px-3 py-1.5 bg-gradient-to-r from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 dark:from-violet-950/50 dark:to-purple-950/50 dark:hover:from-violet-900/50 dark:hover:to-purple-900/50 transition-colors cursor-default"
              >
                {course.name}
              </Badge>
            ))}
            {courses.length > 12 && <Badge variant="outline">+{courses.length - 12} daha</Badge>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
