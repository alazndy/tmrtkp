'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { usePaymentStore } from '@/lib/payment-store';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Payment, PaymentMethod } from '@/types';

import {
  PaymentStatsCards,
  PaymentTable,
  AddPaymentDialog,
  MarkPaidDialog,
} from './_components';

export default function PaymentsPage() {
  const { students, enrollments, courses } = useAppStore();
  const { payments, initialize, addPayment, markAsPaid, getOverduePayments, getPendingPayments } =
    usePaymentStore();
  const { user, isAdmin } = useAuthStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize payment store
  useEffect(() => {
    if (user?.institutionId) {
      initialize(user.institutionId);
    }
  }, [user?.institutionId, initialize]);

  // Filter payments by tab and search
  const filteredPayments = useMemo(() => {
    let result = payments;

    if (activeTab === 'pending') {
      result = getPendingPayments();
    } else if (activeTab === 'overdue') {
      result = getOverduePayments();
    } else if (activeTab === 'paid') {
      result = payments.filter((p) => p.status === 'paid');
    }

    if (searchTerm) {
      result = result.filter((p) => {
        const student = students.find((s) => s.id === p.studentId);
        const fullName = student ? `${student.firstName} ${student.lastName}`.toLowerCase() : '';
        return fullName.includes(searchTerm.toLowerCase());
      });
    }

    return result.sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }, [payments, activeTab, searchTerm, students, getPendingPayments, getOverduePayments]);

  // Stats for cards
  const stats = useMemo(() => {
    const overdue = getOverduePayments();
    const pending = getPendingPayments();
    const paidPayments = payments.filter((p) => p.status === 'paid');

    return {
      totalCount: payments.length,
      overdueCount: overdue.length,
      overdueAmount: overdue.reduce((sum, p) => sum + p.amount, 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      paidAmount: paidPayments.reduce((sum, p) => sum + p.amount, 0),
    };
  }, [payments, getOverduePayments, getPendingPayments]);

  // Handlers
  const handleAddPayment = async (data: {
    studentId: string;
    enrollmentId: string;
    amount: number;
    dueDate: Date;
  }) => {
    if (!isAdmin()) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    try {
      await addPayment({
        studentId: data.studentId,
        enrollmentId: data.enrollmentId,
        amount: data.amount,
        dueDate: data.dueDate,
        status: 'pending',
      });
      toast.success('Ödeme kaydı oluşturuldu');
    } catch (error) {
      console.error(error);
      toast.error('Ödeme kaydı oluşturulamadı');
      throw error;
    }
  };

  const handleMarkAsPaid = async (paymentId: string, method: PaymentMethod) => {
    try {
      await markAsPaid(paymentId, method);
      toast.success('Ödeme alındı olarak işaretlendi');
      setSelectedPayment(null);
    } catch (error) {
      console.error(error);
      toast.error('İşlem başarısız');
      throw error;
    }
  };

  const openPayDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsPayDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ödemeler</h1>
          <p className="text-muted-foreground">Öğrenci ödeme takibi ve yönetimi</p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Ödeme Kaydı Ekle
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <PaymentStatsCards stats={stats} />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Öğrenci ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="pending">Bekleyen</TabsTrigger>
            <TabsTrigger value="overdue">Gecikmiş</TabsTrigger>
            <TabsTrigger value="paid">Ödendi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Payments Table */}
      <PaymentTable
        payments={filteredPayments}
        students={students}
        enrollments={enrollments}
        courses={courses}
        isAdmin={isAdmin()}
        onMarkAsPaid={openPayDialog}
      />

      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        students={students}
        enrollments={enrollments}
        courses={courses}
        onSubmit={handleAddPayment}
      />

      {/* Mark as Paid Dialog */}
      <MarkPaidDialog
        open={isPayDialogOpen}
        onOpenChange={setIsPayDialogOpen}
        payment={selectedPayment}
        students={students}
        onConfirm={handleMarkAsPaid}
      />
    </div>
  );
}
