'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { EnrollmentWithDetails } from '@/types';

interface ExpiringEnrollmentsAlertProps {
  enrollments: EnrollmentWithDetails[];
  maxDisplay?: number;
}

export function ExpiringEnrollmentsAlert({
  enrollments,
  maxDisplay = 5,
}: ExpiringEnrollmentsAlertProps) {
  if (enrollments.length === 0) return null;

  return (
    <Card className="border-amber-500/50 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 shadow-lg shadow-amber-500/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <div className="p-1.5 rounded-lg bg-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          Kurs Bitişi Yaklaşan Öğrenciler
        </CardTitle>
        <CardDescription>Bu öğrencilerin kursları 7 gün içinde bitiyor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {enrollments.slice(0, maxDisplay).map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between rounded-xl border bg-background/80 backdrop-blur-sm p-4 hover:bg-background transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {enrollment.student.firstName.charAt(0)}
                  {enrollment.student.lastName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{enrollment.course.name}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  variant={enrollment.daysRemaining <= 3 ? 'destructive' : 'secondary'}
                  className="font-semibold"
                >
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
  );
}
