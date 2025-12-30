'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Pencil, Trash2, GraduationCap, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function StudentsPage() {
  const { students, deleteStudent, getStudentEnrollments } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const filteredStudents = students.filter(
    (student) =>
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery)
  );

  const handleDelete = async () => {
    if (studentToDelete) {
      await deleteStudent(studentToDelete);
      setStudentToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Öğrenciler</h1>
          <p className="text-muted-foreground">Tüm öğrencileri yönetin</p>
        </div>
        <Link href="/students/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Öğrenci
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İsim, email veya telefon ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                {students.length === 0 
                  ? 'Henüz öğrenci eklenmemiş.' 
                  : 'Aramanızla eşleşen öğrenci bulunamadı.'}
              </p>
              {students.length === 0 && (
                <Link href="/students/new">
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Öğrenciyi Ekle
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Kayıtlı Kurslar</TableHead>
                  <TableHead>Eklenme Tarihi</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const enrollments = getStudentEnrollments(student.id);
                  const activeEnrollments = enrollments.filter((e) => e.status === 'active');
                  
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {student.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {student.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {activeEnrollments.length > 0 ? (
                            activeEnrollments.map((e) => (
                              <Badge key={e.id} variant={e.isExpiringSoon ? 'destructive' : 'secondary'}>
                                {e.course.name}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">Aktif kurs yok</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(student.createdAt), 'd MMM yyyy', { locale: tr })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/students/${student.id}`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/enrollments/new?studentId=${student.id}`}>
                            <Button variant="ghost" size="icon">
                              <GraduationCap className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Dialog open={deleteDialogOpen && studentToDelete === student.id} onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (!open) setStudentToDelete(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setStudentToDelete(student.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Öğrenciyi Sil</DialogTitle>
                                <DialogDescription>
                                  {student.firstName} {student.lastName} adlı öğrenciyi silmek istediğinize emin misiniz?
                                  Bu işlem geri alınamaz ve öğrencinin tüm kayıtları da silinecektir.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                  İptal
                                </Button>
                                <Button variant="destructive" onClick={handleDelete}>
                                  Sil
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
