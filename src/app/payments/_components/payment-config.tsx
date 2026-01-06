import { PaymentMethod, PaymentStatus } from '@/types';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export const paymentMethods: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Nakit' },
  { value: 'card', label: 'Kredi Kartı' },
  { value: 'transfer', label: 'Havale/EFT' },
  { value: 'other', label: 'Diğer' },
];

export const statusConfig: Record<
  PaymentStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
> = {
  pending: { label: 'Bekliyor', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  paid: { label: 'Ödendi', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  overdue: { label: 'Gecikmiş', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: 'İptal', variant: 'outline', icon: null },
};
