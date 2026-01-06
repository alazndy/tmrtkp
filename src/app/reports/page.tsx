'use client';

import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { usePaymentStore } from '@/lib/payment-store';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, Users, GraduationCap, TurkishLira, Calendar, BarChart3
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

const COLORS = ['#7c3aed', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export default function ReportsPage() {
  const { students, courses, attendance, getEnrollmentsWithDetails } = useAppStore();
  const { payments } = usePaymentStore();
  const { isAdmin } = useAuthStore();

  const enrollments = getEnrollmentsWithDetails();

  // Monthly student growth
  const studentGrowthData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, 'MMM', { locale: tr }),
        count: students.filter(s => s.createdAt <= endOfMonth(date)).length,
      };
    });
    return last6Months;
  }, [students]);

  // Course distribution
  const courseDistribution = useMemo(() => {
    const distribution = courses.map(course => ({
      name: course.name.length > 15 ? course.name.slice(0, 15) + '...' : course.name,
      value: enrollments.filter(e => e.courseId === course.id && e.status === 'active').length,
    })).filter(c => c.value > 0);
    return distribution;
  }, [courses, enrollments]);

  // Payment stats by month
  const paymentData = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), 5 - i);
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      
      const monthPayments = payments.filter(p => 
        p.dueDate >= start && p.dueDate <= end
      );
      
      return {
        month: format(date, 'MMM', { locale: tr }),
        alınan: monthPayments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
        bekleyen: monthPayments.filter(p => p.status !== 'paid').reduce((s, p) => s + p.amount, 0),
      };
    });
    return last6Months;
  }, [payments]);

  // Attendance rate by course
  const attendanceData = useMemo(() => {
    const courseStats = courses.slice(0, 5).map(course => {
      const courseAttendance = attendance.filter(a => a.courseId === course.id);
      let present = 0;
      let total = 0;
      
      courseAttendance.forEach(a => {
        a.records.forEach(r => {
          total++;
          if (r.status === 'present') present++;
        });
      });
      
      return {
        name: course.name.length > 10 ? course.name.slice(0, 10) + '...' : course.name,
        oran: total > 0 ? Math.round((present / total) * 100) : 0,
      };
    });
    return courseStats;
  }, [courses, attendance]);

  // Summary stats
  const stats = useMemo(() => ({
    totalStudents: students.length,
    activeEnrollments: enrollments.filter(e => e.status === 'active').length,
    totalRevenue: payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending' || p.status === 'overdue').length,
  }), [students, enrollments, payments]);

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Raporlar</h1>
            <p className="text-muted-foreground">İstatistikler ve analizler</p>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Öğrenci</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Kayıtlar</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Gelir</CardTitle>
            <TurkishLira className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalRevenue.toLocaleString('tr-TR')}₺
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Ödeme</CardTitle>
            <Calendar className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="financial">Finansal</TabsTrigger>
          <TabsTrigger value="attendance">Devam</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Growth */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Öğrenci Büyümesi
                </CardTitle>
                <CardDescription>Son 6 ay</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={studentGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Course Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Kurs Dağılımı</CardTitle>
                <CardDescription>Aktif kayıtlar</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {courseDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TurkishLira className="h-4 w-4" />
                Aylık Gelir Analizi
              </CardTitle>
              <CardDescription>Alınan ve bekleyen ödemeler</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString('tr-TR')} ₺`} />
                  <Legend />
                  <Bar dataKey="alınan" fill="#22c55e" name="Alınan" />
                  <Bar dataKey="bekleyen" fill="#f59e0b" name="Bekleyen" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kurs Bazlı Devam Oranları</CardTitle>
              <CardDescription>İlk 5 kurs</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `%${value}`} />
                  <Bar dataKey="oran" fill="#7c3aed" name="Devam Oranı" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
