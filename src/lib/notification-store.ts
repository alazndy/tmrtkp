import { create } from 'zustand';
import { db } from './firebase';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  query,
  where,
} from 'firebase/firestore';
import { Notification, NotificationType } from '@/types';

const COLLECTION = 'notifications';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  initialized: boolean;

  initialize: (institutionId: string, userId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'institutionId' | 'read'>) => Promise<string>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  getUnread: () => Notification[];
}

export const useNotificationStore = create<NotificationState>()((set, get) => {
  let institutionId: string | null = null;
  let userId: string | null = null;

  return {
    notifications: [],
    unreadCount: 0,
    initialized: false,

    initialize: (instId: string, uid: string) => {
      if (get().initialized && institutionId === instId && userId === uid) return;
      institutionId = instId;
      userId = uid;

      const notificationsRef = collection(db, COLLECTION);
      const notificationsQuery = query(
        notificationsRef,
        where('institutionId', '==', instId),
        where('userId', '==', uid)
      );

      onSnapshot(notificationsQuery, (snapshot) => {
        const notifications = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Notification;
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        const unreadCount = notifications.filter(n => !n.read).length;
        set({ notifications, unreadCount, initialized: true });
      });
    },

    addNotification: async (notificationData) => {
      if (!institutionId) throw new Error('Institution ID missing');

      const docRef = await addDoc(collection(db, COLLECTION), {
        ...notificationData,
        institutionId,
        read: false,
        createdAt: Timestamp.now(),
      });
      return docRef.id;
    },

    markAsRead: async (id) => {
      await updateDoc(doc(db, COLLECTION, id), { read: true });
    },

    markAllAsRead: async () => {
      const unread = get().notifications.filter(n => !n.read);
      for (const notification of unread) {
        await updateDoc(doc(db, COLLECTION, notification.id), { read: true });
      }
    },

    getUnread: () => {
      return get().notifications.filter(n => !n.read);
    },
  };
});

// Helper function to create common notifications
export async function createExpiryNotification(
  store: NotificationState,
  studentName: string,
  courseName: string,
  daysRemaining: number,
  userId: string
) {
  await store.addNotification({
    userId,
    type: 'expiry' as NotificationType,
    title: 'Kurs Bitiyor',
    message: `${studentName} öğrencisinin ${courseName} kursu ${daysRemaining} gün içinde bitiyor.`,
    link: '/enrollments',
  });
}

export async function createPaymentNotification(
  store: NotificationState,
  studentName: string,
  amount: number,
  isOverdue: boolean,
  userId: string
) {
  await store.addNotification({
    userId,
    type: 'payment' as NotificationType,
    title: isOverdue ? 'Gecikmiş Ödeme' : 'Ödeme Hatırlatması',
    message: `${studentName} için ${amount.toLocaleString('tr-TR')}₺ tutarında ${isOverdue ? 'gecikmiş' : 'bekleyen'} ödeme var.`,
    link: '/payments',
  });
}
