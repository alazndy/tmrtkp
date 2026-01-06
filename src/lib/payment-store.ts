import { create } from 'zustand';
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { Payment, PaymentStatus, PaymentMethod } from '@/types';

const COLLECTION = 'payments';

interface PaymentState {
  payments: Payment[];
  loading: boolean;
  initialized: boolean;

  initialize: (institutionId: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'institutionId'>) => Promise<string>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  markAsPaid: (id: string, method: PaymentMethod) => Promise<void>;
  getPaymentsByStudent: (studentId: string) => Payment[];
  getPaymentsByEnrollment: (enrollmentId: string) => Payment[];
  getOverduePayments: () => Payment[];
  getPendingPayments: () => Payment[];
}

export const usePaymentStore = create<PaymentState>()((set, get) => {
  let institutionId: string | null = null;

  return {
    payments: [],
    loading: false,
    initialized: false,

    initialize: (instId: string) => {
      if (get().initialized && institutionId === instId) return;
      institutionId = instId;
      set({ loading: true });

      const paymentsRef = collection(db, COLLECTION);
      const paymentsQuery = query(paymentsRef, where('institutionId', '==', instId));

      onSnapshot(paymentsQuery, (snapshot) => {
        const payments = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            dueDate: data.dueDate?.toDate ? data.dueDate.toDate() : new Date(data.dueDate),
            paidDate: data.paidDate?.toDate ? data.paidDate.toDate() : (data.paidDate ? new Date(data.paidDate) : undefined),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Payment;
        });
        // Auto-update overdue status
        const now = new Date();
        payments.forEach(p => {
          if (p.status === 'pending' && p.dueDate < now) {
            p.status = 'overdue';
          }
        });
        set({ payments, loading: false, initialized: true });
      });
    },

    addPayment: async (paymentData) => {
      if (!institutionId) throw new Error('Institution ID missing');

      const docRef = await addDoc(collection(db, COLLECTION), {
        ...paymentData,
        institutionId,
        dueDate: Timestamp.fromDate(paymentData.dueDate),
        paidDate: paymentData.paidDate ? Timestamp.fromDate(paymentData.paidDate) : null,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },

    updatePayment: async (id, data) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.dueDate) updateData.dueDate = Timestamp.fromDate(data.dueDate);
      if (data.paidDate) updateData.paidDate = Timestamp.fromDate(data.paidDate);
      await updateDoc(doc(db, COLLECTION, id), updateData);
    },

    deletePayment: async (id) => {
      await deleteDoc(doc(db, COLLECTION, id));
    },

    markAsPaid: async (id, method) => {
      await updateDoc(doc(db, COLLECTION, id), {
        status: 'paid' as PaymentStatus,
        paidDate: Timestamp.now(),
        method,
      });
    },

    getPaymentsByStudent: (studentId) => {
      return get().payments.filter(p => p.studentId === studentId);
    },

    getPaymentsByEnrollment: (enrollmentId) => {
      return get().payments.filter(p => p.enrollmentId === enrollmentId);
    },

    getOverduePayments: () => {
      return get().payments.filter(p => p.status === 'overdue');
    },

    getPendingPayments: () => {
      return get().payments.filter(p => p.status === 'pending');
    },
  };
});
