'use client';

import { useState, useEffect } from 'react';
import { useTeacherStore } from '@/lib/teacher-store';
import { useAuthStore } from '@/lib/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Pencil, Trash2, Loader2, Mail, Phone, GraduationCap, TurkishLira } from 'lucide-react';
import { toast } from 'sonner';
import { Teacher } from '@/types';

export default function TeachersPage() {
  const { teachers, initialize, addTeacher, updateTeacher, deleteTeacher } = useTeacherStore();
  const { user, isAdmin } = useAuthStore();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  useEffect(() => {
    if (user?.institutionId) {
      initialize(user.institutionId);
    }
  }, [user?.institutionId, initialize]);

  const handleOpenDialog = (teacher?: Teacher) => {
    if (teacher) {
      setEditingTeacher(teacher);
      setFirstName(teacher.firstName);
      setLastName(teacher.lastName);
      setEmail(teacher.email);
      setPhone(teacher.phone);
      setSpecialty(teacher.specialty || '');
      setHourlyRate(teacher.hourlyRate?.toString() || '');
    } else {
      setEditingTeacher(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setSpecialty('');
      setHourlyRate('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin()) {
      toast.error('Bu işlem için yetkiniz yok');
      return;
    }

    setIsLoading(true);
    try {
      const teacherData = {
        firstName,
        lastName,
        email,
        phone,
        specialty: specialty || undefined,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : undefined,
        isActive: true,
      };

      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, teacherData);
        toast.success('Öğretmen güncellendi');
      } else {
        await addTeacher(teacherData);
        toast.success('Öğretmen eklendi');
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('İşlem başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu öğretmeni silmek istediğinize emin misiniz?')) return;
    try {
      await deleteTeacher(id);
      toast.success('Öğretmen silindi');
    } catch (error) {
      console.error(error);
      toast.error('Silme başarısız');
    }
  };

  if (!isAdmin()) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Öğretmenler</h1>
          <p className="text-muted-foreground">Öğretmen kadrosu yönetimi</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <UserPlus className="mr-2 h-4 w-4" />
          Öğretmen Ekle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>İletişim</TableHead>
                <TableHead>Uzmanlık</TableHead>
                <TableHead>Saat Ücreti</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz öğretmen eklenmemiş
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-sm">
                          {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                        </div>
                        {teacher.firstName} {teacher.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {teacher.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {teacher.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {teacher.specialty ? (
                        <Badge variant="secondary">
                          <GraduationCap className="h-3 w-3 mr-1" />
                          {teacher.specialty}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {teacher.hourlyRate ? (
                        <span className="flex items-center gap-1">
                          <TurkishLira className="h-3 w-3" />
                          {teacher.hourlyRate}/saat
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={teacher.isActive ? 'default' : 'secondary'}>
                        {teacher.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(teacher)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(teacher.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'Öğretmeni Düzenle' : 'Yeni Öğretmen'}</DialogTitle>
            <DialogDescription>Öğretmen bilgilerini girin.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ad</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Soyad</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Uzmanlık Alanı</Label>
                <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Örn: Türk İşaret Dili" />
              </div>
              <div className="space-y-2">
                <Label>Saat Ücreti (₺)</Label>
                <Input type="number" min="0" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTeacher ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
