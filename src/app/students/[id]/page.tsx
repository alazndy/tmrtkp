'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { usePaymentStore } from '@/lib/payment-store';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  ArrowLeft, User, Mail, Phone, BookOpen, CreditCard, ClipboardList,
  Calendar, CheckCircle, XCircle, Clock, AlertTriangle, GraduationCap,
  TurkishLira, Edit, FileText
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { students, getStudentEnrollments, getStudentAttendanceStats, courses } = useAppStore();
  const { payments, initialize: initPayments, getPaymentsByStudent } = usePaymentStore();
  const { user, isAdmin } = useAuthStore();

  // Initialize payment store
  useEffect(() => {
    if (user?.institutionId) {
      initPayments(user.institutionId);
    }
  }, [user?.institutionId, initPayments]);

  const student = useMemo(() => students.find(s => s.id === studentId), [students, studentId]);
  const enrollments = useMemo(() => getStudentEnrollments(studentId), [studentId, getStudentEnrollments]);
  const attendanceStats = useMemo(() => getStudentAttendanceStats(studentId), [studentId, getStudentAttendanceStats]);
  const studentPayments = useMemo(() => getPaymentsByStudent(studentId), [studentId, getPaymentsByStudent]);

  // Payment summary
  const paymentSummary = useMemo(() => {
    const total = studentPayments.reduce((sum, p) => sum + p.amount, 0);
    const paid = studentPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const pending = studentPayments.filter(p => p.status === 'pending' || p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);
    return { total, paid, pending };
  }, [studentPayments]);

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Öğrenci bulunamadı</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Geri Dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{student.firstName} {student.lastName}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {student.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
        {isAdmin() && (
          <Link href={`/students/${studentId}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Aktif Kurslar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.filter(e => e.status === 'active').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Devam Oranı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attendanceStats.total > 0 
                ? `%${Math.round((attendanceStats.present / attendanceStats.total) * 100)}`
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Toplam Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paymentSummary.paid.toLocaleString('tr-TR')}₺</div>
          </CardContent>
        </Card>
        <Card className={paymentSummary.pending > 0 ? "border-amber-500/50" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Ödeme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${paymentSummary.pending > 0 ? 'text-amber-500' : ''}`}>
              {paymentSummary.pending.toLocaleString('tr-TR')}₺
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Kurslar
          </TabsTrigger>
          <TabsTrigger value="payments" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Ödemeler
          </TabsTrigger>
          <TabsTrigger value="attendance" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Yoklama
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <FileText className="h-4 w-4" />
            Notlar
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kurs Geçmişi</CardTitle>
              <CardDescription>Öğrencinin kayıtlı olduğu tüm kurslar</CardDescription>
            </CardHeader>
            <CardContent>
              {enrollments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz kurs kaydı yok</p>
              ) : (
                <div className="space-y-4">
                  {enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          enrollment.status === 'active' ? 'bg-green-100 text-green-600' :
                          enrollment.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                          enrollment.status === 'expired' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{enrollment.course.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(enrollment.startDate, 'd MMM yyyy', { locale: tr })} - {format(enrollment.endDate, 'd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          enrollment.status === 'active' ? 'default' :
                          enrollment.status === 'completed' ? 'secondary' :
                          'destructive'
                        }>
                          {enrollment.status === 'active' ? 'Aktif' :
                           enrollment.status === 'completed' ? 'Tamamlandı' :
                           enrollment.status === 'expired' ? 'Süresi Doldu' : 'İptal'}
                        </Badge>
                        {enrollment.status === 'active' && (
                          <p className="text-xs text-muted-foreground mt-1">{enrollment.daysRemaining} gün kaldı</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ödeme Kayıtları</CardTitle>
              <CardDescription>Tüm ödeme işlemleri</CardDescription>
            </CardHeader>
            <CardContent>
              {studentPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Henüz ödeme kaydı yok</p>
              ) : (
                <div className="space-y-3">
                  {studentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-600' :
                          payment.status === 'overdue' ? 'bg-red-100 text-red-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {payment.status === 'paid' ? <CheckCircle className="h-5 w-5" /> :
                           payment.status === 'overdue' ? <AlertTriangle className="h-5 w-5" /> :
                           <Clock className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-1">
                            <TurkishLira className="h-4 w-4" />
                            {payment.amount.toLocaleString('tr-TR')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Vade: {format(payment.dueDate, 'd MMM yyyy', { locale: tr })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        payment.status === 'paid' ? 'default' :
                        payment.status === 'overdue' ? 'destructive' :
                        'secondary'
                      }>
                        {payment.status === 'paid' ? 'Ödendi' :
                         payment.status === 'overdue' ? 'Gecikmiş' : 'Bekliyor'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yoklama İstatistikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                  <p className="text-sm text-muted-foreground">Geldi</p>
                </div>
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 text-center">
                  <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                  <p className="text-sm text-muted-foreground">Gelmedi</p>
                </div>
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-center">
                  <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">{attendanceStats.late}</p>
                  <p className="text-sm text-muted-foreground">Geç Kaldı</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-center">
                  <Calendar className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{attendanceStats.excused}</p>
                  <p className="text-sm text-muted-foreground">İzinli</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notlar</CardTitle>
              <CardDescription>Öğrenci hakkında notlar ve gözlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50">
                {student.notes ? (
                  <p className="whitespace-pre-wrap">{student.notes}</p>
                ) : (
                  <p className="text-muted-foreground text-center">Henüz not eklenmemiş</p>
                )}
              </div>
              {student.kvkkConsentDate && (
                <div className="mt-4 p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-900">
                  <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    KVKK Onayı: {format(student.kvkkConsentDate, 'd MMMM yyyy', { locale: tr })}
                    {student.kvkkConsentVersion && ` (v${student.kvkkConsentVersion})`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
