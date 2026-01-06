'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { usePaymentStore } from '@/lib/payment-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Search, BookOpen, CreditCard, ClipboardList, Calendar, 
  CheckCircle, XCircle, Clock, AlertTriangle, GraduationCap, TurkishLira
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function PortalPage() {
  const searchParams = useSearchParams();
  const initialPhone = searchParams.get('phone') || '';
  
  const { students, getStudentEnrollments, getStudentAttendanceStats } = useAppStore();
  const { payments } = usePaymentStore();

  const [phone, setPhone] = useState(initialPhone);
  const [searchedPhone, setSearchedPhone] = useState('');

  // Find student by phone
  const student = useMemo(() => {
    if (!searchedPhone) return null;
    return students.find(s => s.phone.includes(searchedPhone) || searchedPhone.includes(s.phone));
  }, [students, searchedPhone]);

  const enrollments = useMemo(() => {
    if (!student) return [];
    return getStudentEnrollments(student.id);
  }, [student, getStudentEnrollments]);

  const attendanceStats = useMemo(() => {
    if (!student) return { present: 0, absent: 0, late: 0, excused: 0, total: 0 };
    return getStudentAttendanceStats(student.id);
  }, [student, getStudentAttendanceStats]);

  const studentPayments = useMemo(() => {
    if (!student) return [];
    return payments.filter(p => p.studentId === student.id);
  }, [student, payments]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedPhone(phone);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/25">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold">Öğrenci/Veli Portalı</h1>
          <p className="text-muted-foreground mt-2">Kurs ve ödeme bilgilerinizi görüntüleyin</p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Telefon numaranız ile arayın..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit">Ara</Button>
            </form>
          </CardContent>
        </Card>

        {/* Student Info */}
        {searchedPhone && !student && (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">Bu telefon numarası ile kayıtlı öğrenci bulunamadı.</p>
            </CardContent>
          </Card>
        )}

        {student && (
          <div className="space-y-6">
            {/* Student Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                    <p className="text-muted-foreground">{student.phone} • {student.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
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
              <Card className={studentPayments.some(p => p.status === 'overdue') ? "border-destructive/50" : ""}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen Ödeme</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${studentPayments.some(p => p.status === 'overdue') ? 'text-destructive' : ''}`}>
                    {studentPayments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString('tr-TR')}₺
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="courses">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="courses" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Kurslarım
                </TabsTrigger>
                <TabsTrigger value="payments" className="gap-2">
                  <CreditCard className="h-4 w-4" />
                  Ödemelerim
                </TabsTrigger>
                <TabsTrigger value="attendance" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Devam Durumu
                </TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Kayıtlı Kurslar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {enrollments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Henüz kayıtlı kurs yok</p>
                    ) : (
                      <div className="space-y-4">
                        {enrollments.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 rounded-lg border">
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                enrollment.status === 'active' ? 'bg-green-100 text-green-600' :
                                enrollment.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <GraduationCap className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium">{enrollment.course.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(enrollment.startDate, 'd MMM', { locale: tr })} - {format(enrollment.endDate, 'd MMM yyyy', { locale: tr })}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                                {enrollment.status === 'active' ? 'Aktif' : 'Tamamlandı'}
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

              <TabsContent value="payments" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ödemeler</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentPayments.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">Ödeme kaydı yok</p>
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
                              payment.status === 'overdue' ? 'destructive' : 'secondary'
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

              <TabsContent value="attendance" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Devam İstatistikleri</CardTitle>
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
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
