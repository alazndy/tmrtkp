'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, TurkishLira } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Payment, Student, Enrollment, Course } from '@/types';
import { statusConfig } from './payment-config';

interface PaymentTableProps {
  payments: Payment[];
  students: Student[];
  enrollments: Enrollment[];
  courses: Course[];
  isAdmin: boolean;
  onMarkAsPaid: (payment: Payment) => void;
}

export function PaymentTable({
  payments,
  students,
  enrollments,
  courses,
  isAdmin,
  onMarkAsPaid,
}: PaymentTableProps) {
  const getStudentName = (id: string) => {
    const student = students.find((s) => s.id === id);
    return student ? `${student.firstName} ${student.lastName}` : 'Bilinmiyor';
  };

  const getCourseName = (enrollmentId: string) => {
    const enrollment = enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) return 'Bilinmiyor';
    const course = courses.find((c) => c.id === enrollment.courseId);
    return course?.name || 'Bilinmiyor';
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Öğrenci</TableHead>
              <TableHead>Kurs</TableHead>
              <TableHead>Tutar</TableHead>
              <TableHead>Vade</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Ödeme kaydı bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const config = statusConfig[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {getStudentName(payment.studentId)}
                    </TableCell>
                    <TableCell>{getCourseName(payment.enrollmentId)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <TurkishLira className="h-3 w-3" />
                        {payment.amount.toLocaleString('tr-TR')}
                      </span>
                    </TableCell>
                    <TableCell>{format(payment.dueDate, 'd MMM yyyy', { locale: tr })}</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        {config.icon}
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== 'paid' &&
                        payment.status !== 'cancelled' &&
                        isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onMarkAsPaid(payment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Ödendi
                          </Button>
                        )}
                      {payment.status === 'paid' && payment.paidDate && (
                        <span className="text-xs text-muted-foreground">
                          {format(payment.paidDate, 'd MMM', { locale: tr })}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
