'use client';

import { useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { usePaymentStore } from '@/lib/payment-store';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Clock, AlertTriangle, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

import {
  DashboardStatsCards,
  FinancialOverview,
  ExpiringEnrollmentsAlert,
  QuickActions,
} from './_components';

export default function DashboardPage() {
  const { students, courses, attendance, getEnrollmentsWithDetails, getExpiringEnrollments } =
    useAppStore();
  const {
    payments,
    initialize: initPayments,
    getOverduePayments,
    getPendingPayments,
  } = usePaymentStore();
  const { user, isAdmin } = useAuthStore();

  // Initialize payment store
  useEffect(() => {
    if (user?.institutionId) {
      initPayments(user.institutionId);
    }
  }, [user?.institutionId, initPayments]);

  // Enrollment data
  const allEnrollments = getEnrollmentsWithDetails();
  const activeEnrollments = allEnrollments.filter((e) => e.status === 'active');
  const expiringEnrollments = getExpiringEnrollments(7);
  const expiredEnrollments = allEnrollments.filter((e) => e.status === 'expired');

  // Payment stats
  const paymentStats = useMemo(() => {
    const overdue = getOverduePayments();
    const pending = getPendingPayments();
    const paid = payments.filter((p) => p.status === 'paid');
    return {
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      totalRevenue: paid.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments, getOverduePayments, getPendingPayments]);

  // Attendance stats (last 30 days)
  const attendanceStats = useMemo(() => {
    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const recentAttendance = attendance.filter((a) => a.date >= last30Days);
    let totalPresent = 0;
    let totalRecords = 0;

    recentAttendance.forEach((a) => {
      a.records.forEach((r) => {
        totalRecords++;
        if (r.status === 'present') totalPresent++;
      });
    });

    return {
      attendanceRate: totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 100) : 0,
      totalSessions: recentAttendance.length,
    };
  }, [attendance]);

  // Stats for main cards
  const stats = [
    {
      title: 'Toplam Öğrenci',
      value: students.length,
      icon: Users,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'Aktif Kayıtlar',
      value: activeEnrollments.length,
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Biten Yaklaşan',
      value: expiringEnrollments.length,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      alert: expiringEnrollments.length > 0,
    },
    {
      title: 'Süresi Dolmuş',
      value: expiredEnrollments.length,
      icon: AlertTriangle,
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-500/10',
      alert: expiredEnrollments.length > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Cisem Dil Kursu Öğrenci Takip Sistemi</p>
            </div>
          </div>
        </div>
        <Link href="/students/new">
          <Button className="gap-2 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Yeni Öğrenci
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <DashboardStatsCards stats={stats} />

      {/* Financial & Attendance Overview (Admin only) */}
      {isAdmin() && (
        <FinancialOverview paymentStats={paymentStats} attendanceStats={attendanceStats} />
      )}

      {/* Expiring Enrollments Alert */}
      <ExpiringEnrollmentsAlert enrollments={expiringEnrollments} />

      {/* Quick Actions */}
      <QuickActions isAdmin={isAdmin()} courses={courses} />
    </div>
  );
}
