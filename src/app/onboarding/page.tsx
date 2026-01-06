'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);
  const { createInstitution } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim()) return;

    setLoading(true);
    try {
      await createInstitution(institutionName);
      toast.success('Kurum başarıyla oluşturuldu!');
      router.push('/');
    } catch (error) {
      console.error(error);
      toast.error('Kurum oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Hoş Geldiniz</CardTitle>
          <CardDescription>
            Devam etmek için kurumunuzun adını giriniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="institutionName">Kurum Adı</Label>
              <Input
                id="institutionName"
                placeholder="Örn: Cisem Müzik Kursu"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
                minLength={3}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'Kurumu Oluştur ve Başla'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
