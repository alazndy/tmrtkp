'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { AlertTriangle, Users, BookOpen, GraduationCap, Clock, Plus } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { students, courses, enrollments, getEnrollmentsWithDetails, getExpiringEnrollments } = useAppStore();
  
  const allEnrollments = getEnrollmentsWithDetails();
  const activeEnrollments = allEnrollments.filter((e) => e.status === 'active');
  const expiringEnrollments = getExpiringEnrollments(7);
  const expiredEnrollments = allEnrollments.filter((e) => e.status === 'expired');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Cisem Dil Kursu Öğrenci Takip Sistemi</p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Öğrenci
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kayıtlar</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Biten Yaklaşan</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringEnrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Süresi Dolmuş</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredEnrollments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {expiringEnrollments.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Kurs Bitişi Yaklaşan Öğrenciler
            </CardTitle>
            <CardDescription>Bu öğrencilerin kursları 7 gün içinde bitiyor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringEnrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between rounded-lg border bg-background p-3"
                >
                  <div>
                    <p className="font-medium">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{enrollment.course.name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={enrollment.daysRemaining <= 3 ? 'destructive' : 'secondary'}>
                      {enrollment.daysRemaining} gün kaldı
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Bitiş: {format(enrollment.endDate, 'd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link href="/students/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="mr-2 h-4 w-4" />
                Yeni Öğrenci Ekle
              </Button>
            </Link>
            <Link href="/enrollments/new">
              <Button variant="outline" className="w-full justify-start">
                <GraduationCap className="mr-2 h-4 w-4" />
                Kursa Kayıt Yap
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kurslar</CardTitle>
            <CardDescription>{courses.length} adet kurs mevcut</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {courses.map((course) => (
                <Badge key={course.id} variant="secondary">
                  {course.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
