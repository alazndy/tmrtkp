'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const { user, loginWithGoogle } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [inviteData, setInviteData] = useState<any>(null); // invite data from db

  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }
      try {
        const docRef = doc(db, 'invites', token);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && !docSnap.data().used) {
          const data = docSnap.data();
          
          // Check if token has expired
          const expiresAt = data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt);
          if (expiresAt < new Date()) {
            setStatus('invalid'); // Token expired
            return;
          }
          
          setInviteData(data);
          setStatus('valid');
        } else {
          setStatus('invalid');
        }
      } catch (error) {
        console.error(error);
        setStatus('invalid');
      }
    };
    checkToken();
  }, [token]);

  const handleRegister = async () => {
    if (!token || !inviteData) return;
    
    try {
      // 1. Auth Logic (Google Login)
      await loginWithGoogle();
      
      // User is now logged in. The store updates 'user' state.
      // However, we need to wait/check for the user to be available.
      // Since loginWithGoogle awaits, 'user' might not be immediately reflected in closures 
      // but the auth state listener in store handles it.
      
      // Ideally we would grab the currentUser from the auth object directly here to be safe
      // but let's assume we can get it from the store or re-check auth.
      
      const { auth } = await import('@/lib/firebase');
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        toast.error('Giriş yapılamadı');
        return;
      }

      // 2. Link User to Institution
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, {
        institutionId: inviteData.institutionId,
        role: inviteData.role,
        roleUpdatedAt: new Date()
      }, { merge: true });

      // 3. Mark Invite as Used
      const inviteRef = doc(db, 'invites', token);
      await updateDoc(inviteRef, {
        used: true,
        usedBy: currentUser.uid,
        usedAt: new Date()
      });

      setStatus('success');
      toast.success('Kaydınız tamamlandı! Yönlendiriliyorsunuz...');
      
      setTimeout(() => {
        // Must reload functionality to ensure Sidebar/Store picks up new role/institution
        window.location.href = '/'; 
      }, 2000);

    } catch (error) {
      console.error(error);
      toast.error('Kayıt işlemi sırasında bir hata oluştu.');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Geçersiz Davet
            </CardTitle>
            <CardDescription>
              Bu davet linki geçersiz, süresi dolmuş veya daha önce kullanılmış.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Button onClick={() => router.push('/')} variant="outline" className="w-full">
               Anasayfaya Dön
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-500/50 bg-green-50/50 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="h-5 w-5" />
              Kayıt Başarılı!
            </CardTitle>
            <CardDescription>
              Kuruma başarıyla katıldınız. Yönlendiriliyorsunuz...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Loader2 className="h-6 w-6 animate-spin text-green-600 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Daveti Kabul Et</CardTitle>
          <CardDescription>
            Cisem Takip sistemine katılarak kurumunuza giriş yapın.<br/>
            <strong>Rolünüz:</strong> {inviteData?.role === 'admin' ? 'Yönetici' : 'Öğretmen'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleRegister} className="w-full h-12 text-lg gap-3" size="lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.08-2.08 2.76-5.12 2.76-7.533 0-.747-.067-1.48-.187-2.207l-10.627-.1z"
              />
            </svg>
            Google ile Giriş Yap ve Katıl
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Giriş yaparak daveti otomatik olarak kabul etmiş olacaksınız.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
