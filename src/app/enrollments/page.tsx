'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useState } from 'react';

const statusLabels = {
  active: { label: 'Aktif', variant: 'default' as const },
  completed: { label: 'Tamamlandı', variant: 'secondary' as const },
  expired: { label: 'Süresi Doldu', variant: 'destructive' as const },
  cancelled: { label: 'İptal', variant: 'outline' as const },
};

export default function EnrollmentsPage() {
  const { getEnrollmentsWithDetails, completeEnrollment, cancelEnrollment } = useAppStore();
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<{ id: string; action: 'complete' | 'cancel' } | null>(null);

  const enrollments = getEnrollmentsWithDetails();

  const handleAction = async () => {
    if (!selectedEnrollment) return;
    
    if (selectedEnrollment.action === 'complete') {
      await completeEnrollment(selectedEnrollment.id);
    } else {
      await cancelEnrollment(selectedEnrollment.id);
    }
    
    setSelectedEnrollment(null);
    setActionDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kayıtlar</h1>
          <p className="text-muted-foreground">Tüm kurs kayıtlarını görüntüleyin</p>
        </div>
        <Link href="/enrollments/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kayıt
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6">
          {enrollments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Henüz kayıt yapılmamış.</p>
              <Link href="/enrollments/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  İlk Kaydı Yap
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Öğrenci</TableHead>
                  <TableHead>Kurs</TableHead>
                  <TableHead>Başlangıç</TableHead>
                  <TableHead>Bitiş</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment) => {
                  const statusInfo = statusLabels[enrollment.status];
                  
                  return (
                    <TableRow key={enrollment.id}>
                      <TableCell className="font-medium">
                        {enrollment.student.firstName} {enrollment.student.lastName}
                      </TableCell>
                      <TableCell>{enrollment.course.name}</TableCell>
                      <TableCell>
                        {format(enrollment.startDate, 'd MMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {format(enrollment.endDate, 'd MMM yyyy', { locale: tr })}
                          {enrollment.isExpiringSoon && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        {enrollment.status === 'active' && (
                          <span className="text-xs text-muted-foreground">
                            {enrollment.daysRemaining > 0 
                              ? `${enrollment.daysRemaining} gün kaldı` 
                              : 'Süre doldu'}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {enrollment.status === 'active' && (
                          <div className="flex justify-end gap-2">
                            <Dialog 
                              open={actionDialogOpen && selectedEnrollment?.id === enrollment.id && selectedEnrollment?.action === 'complete'} 
                              onOpenChange={(open) => {
                                setActionDialogOpen(open);
                                if (!open) setSelectedEnrollment(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => setSelectedEnrollment({ id: enrollment.id, action: 'complete' })}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Tamamla
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Kursu Tamamla</DialogTitle>
                                  <DialogDescription>
                                    {enrollment.student.firstName} {enrollment.student.lastName} öğrencisinin {enrollment.course.name} kursunu tamamlandı olarak işaretlemek istiyor musunuz?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                                    İptal
                                  </Button>
                                  <Button onClick={handleAction}>
                                    Tamamla
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            <Dialog 
                              open={actionDialogOpen && selectedEnrollment?.id === enrollment.id && selectedEnrollment?.action === 'cancel'} 
                              onOpenChange={(open) => {
                                setActionDialogOpen(open);
                                if (!open) setSelectedEnrollment(null);
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => setSelectedEnrollment({ id: enrollment.id, action: 'cancel' })}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  İptal Et
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Kaydı İptal Et</DialogTitle>
                                  <DialogDescription>
                                    {enrollment.student.firstName} {enrollment.student.lastName} öğrencisinin {enrollment.course.name} kaydını iptal etmek istiyor musunuz?
                                  </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                                    Vazgeç
                                  </Button>
                                  <Button variant="destructive" onClick={handleAction}>
                                    İptal Et
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
