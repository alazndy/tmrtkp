'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useNotificationStore } from '@/lib/notification-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, AlertTriangle, Clock, CreditCard, ClipboardList, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { NotificationType } from '@/types';
import Link from 'next/link';

const typeConfig: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  expiry: { icon: <Clock className="h-4 w-4" />, color: 'text-yellow-500' },
  payment: { icon: <CreditCard className="h-4 w-4" />, color: 'text-red-500' },
  attendance: { icon: <ClipboardList className="h-4 w-4" />, color: 'text-blue-500' },
  system: { icon: <Info className="h-4 w-4" />, color: 'text-gray-500' },
};

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const { notifications, unreadCount, initialize, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    if (user?.institutionId && user?.uid) {
      initialize(user.institutionId, user.uid);
    }
  }, [user?.institutionId, user?.uid, initialize]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bildirimler</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Tümünü Okundu İşaretle
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz bildirim yok</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => {
            const config = typeConfig[notification.type];
            return (
              <Card 
                key={notification.id}
                className={`transition-colors ${!notification.read ? 'border-primary/50 bg-primary/5' : ''}`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`mt-1 ${config.color}`}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">Yeni</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: tr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {notification.link && (
                      <Link href={notification.link}>
                        <Button variant="ghost" size="sm">Görüntüle</Button>
                      </Link>
                    )}
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        Okundu
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
