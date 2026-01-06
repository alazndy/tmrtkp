'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Database, Users, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// Turkish names for mock data
const FIRST_NAMES = ['Ahmet', 'Mehmet', 'Ali', 'Mustafa', 'Hüseyin', 'İbrahim', 'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Merve', 'Büşra', 'Selin', 'Deniz', 'Cem', 'Burak', 'Emre', 'Kaan'];
const LAST_NAMES = ['Yılmaz', 'Kaya', 'Demir', 'Çelik', 'Şahin', 'Yıldız', 'Yıldırım', 'Öztürk', 'Aydın', 'Özdemir', 'Arslan', 'Doğan', 'Kılıç', 'Aslan', 'Çetin', 'Koç', 'Kurt', 'Özkan', 'Şimşek', 'Polat'];

function generateMockStudent(index: number) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@demo.com`,
    phone: `555${String(1000000 + index).slice(-7)}`,
    notes: 'Demo öğrenci - otomatik oluşturuldu',
  };
}

export default function SeedPage() {
  const { courses, addStudent, enrollStudent } = useAppStore();
  const { isAdmin } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [completed, setCompleted] = useState(false);

  const handleSeedData = async () => {
    if (!isAdmin()) {
      toast.error('Bu işlem için yönetici yetkisi gerekli');
      return;
    }

    if (courses.length === 0) {
      toast.error('Önce kurs eklemeniz gerekiyor');
      return;
    }

    setIsLoading(true);
    setCompleted(false);
    const studentsPerCourse = 10;
    const total = courses.length * studentsPerCourse;
    setProgress({ current: 0, total });

    try {
      let studentIndex = 0;
      
      for (const course of courses) {
        for (let i = 0; i < studentsPerCourse; i++) {
          const studentData = generateMockStudent(studentIndex);
          const studentId = await addStudent(studentData);
          await enrollStudent(studentId, course.id, new Date());
          
          studentIndex++;
          setProgress({ current: studentIndex, total });
        }
      }

      setCompleted(true);
      toast.success(`${total} öğrenci başarıyla oluşturuldu ve kurslara kaydedildi!`);
    } catch (error) {
      console.error(error);
      toast.error('Veri oluşturma sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="p-8">
        <p className="text-destructive">Bu sayfaya erişim yetkiniz yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Demo Veri Oluştur</h1>
        <p className="text-muted-foreground">Test için mock öğrenci ve kayıt verileri oluşturun</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Toplu Öğrenci Oluştur
          </CardTitle>
          <CardDescription>
            Her kursa 10 demo öğrenci ekler ve otomatik kayıt yapar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{courses.length} kurs mevcut</p>
              <p className="text-sm text-muted-foreground">
                Toplam {courses.length * 10} öğrenci oluşturulacak
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>İlerleme</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {completed && (
            <div className="flex items-center gap-2 text-green-600 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Tüm veriler başarıyla oluşturuldu!</span>
            </div>
          )}

          <Button 
            onClick={handleSeedData} 
            disabled={isLoading || courses.length === 0}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Users className="mr-2 h-4 w-4" />
                Demo Verileri Oluştur
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            ⚠️ Bu işlem geri alınamaz. Test amaçlıdır.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
