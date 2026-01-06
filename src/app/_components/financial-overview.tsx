'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TurkishLira, CreditCard, BarChart3 } from 'lucide-react';

interface PaymentStats {
  totalRevenue: number;
  pendingAmount: number;
  pendingCount: number;
  overdueCount: number;
}

interface AttendanceStats {
  attendanceRate: number;
  totalSessions: number;
}

interface FinancialOverviewProps {
  paymentStats: PaymentStats;
  attendanceStats: AttendanceStats;
}

export function FinancialOverview({ paymentStats, attendanceStats }: FinancialOverviewProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Total Revenue */}
      <Card className="border-green-500/30 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
          <TurkishLira className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {paymentStats.totalRevenue.toLocaleString('tr-TR')}₺
          </div>
          <p className="text-xs text-muted-foreground mt-1">Alınan ödemeler</p>
        </CardContent>
      </Card>

      {/* Pending Payments */}
      <Card className={paymentStats.overdueCount > 0 ? 'border-red-500/50' : ''}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Bekleyen Ödemeler</CardTitle>
          <CreditCard className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {paymentStats.pendingAmount.toLocaleString('tr-TR')}₺
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {paymentStats.pendingCount} bekleyen
            </span>
            {paymentStats.overdueCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                {paymentStats.overdueCount} gecikmiş
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attendance Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Devam Oranı</CardTitle>
          <BarChart3 className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">%{attendanceStats.attendanceRate}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Son 30 gün • {attendanceStats.totalSessions} oturum
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
