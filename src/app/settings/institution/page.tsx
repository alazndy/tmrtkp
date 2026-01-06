'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { doc, updateDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Loader2, Copy, Trash2, UserPlus, Shield } from 'lucide-react';
import { Invite, UserRole } from '@/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function InstitutionSettingsPage() {
  const { user, institution } = useAuthStore();
  const [name, setName] = useState(institution?.name || '');
  const [loading, setLoading] = useState(false);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  // Founder check
  const isFounder = user?.uid === institution?.founderId;

  // Fetch invites function moved inside useEffect or useCallback not needed if defined before usage order?
  // Easier to just define it inside useEffect or use useCallback. 
  // Defining outside and using in useEffect requires useCallback.
  
  useEffect(() => {
    if (institution?.name) setName(institution.name);
    
    const fetchInvites = async () => {
        if (!institution?.id) return;
        const q = query(
          collection(db, 'invites'), 
          where('institutionId', '==', institution.id),
          where('used', '==', false)
        );
        const snapshot = await getDocs(q);
        const invitesData = snapshot.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            institutionId: data.institutionId,
            role: data.role,
            used: data.used,
            createdBy: data.createdBy,
            expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          } as Invite;
        });
        
        invitesData.sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());
        setInvites(invitesData);
      };

    if (institution?.id) fetchInvites();
  }, [institution]);

  // Re-fetch helper for after actions
  const refreshInvites = async () => {
    if (!institution?.id) return;
    const q = query(
      collection(db, 'invites'), 
      where('institutionId', '==', institution.id),
      where('used', '==', false)
    );
    const snapshot = await getDocs(q);
    const invitesData = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          institutionId: data.institutionId,
          role: data.role,
          used: data.used,
          createdBy: data.createdBy,
          expiresAt: data.expiresAt?.toDate ? data.expiresAt.toDate() : new Date(data.expiresAt),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
        } as Invite;
      });
    invitesData.sort((a, b) => b.expiresAt.getTime() - a.expiresAt.getTime());
    setInvites(invitesData);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution?.id || !isFounder) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, 'institutions', institution.id), {
        name,
        updatedAt: new Date(),
      });
      window.location.reload(); 
      toast.success('Kurum adı güncellendi');
    } catch (error) {
      console.error(error);
      toast.error('Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  const checkAndSetInvite = async (token: string, data: Omit<Invite, 'id'>) => {
      const ref = doc(db, 'invites', token);
      await import('firebase/firestore').then(m => m.setDoc(ref, data));
  };

  const createInvite = async (role: UserRole) => {
    if (!institution?.id) return;
    setInviteLoading(true);
    try {
      const token = crypto.randomUUID();
      const inviteData: Omit<Invite, 'id'> = {
        institutionId: institution.id,
        role,
        used: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        createdBy: user?.uid || '',
      };
      
      await checkAndSetInvite(token, inviteData);
      
      toast.success(`${role === 'admin' ? 'Yönetici' : 'Öğretmen'} davet linki oluşturuldu`);
      refreshInvites();
    } catch (error) {
      console.error(error);
      toast.error('Davet oluşturulamadı');
    } finally {
      setInviteLoading(false);
    }
  };

  const deleteInvite = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'invites', id));
      setInvites(invites.filter(i => i.id !== id));
      toast.success('Davet silindi');
    } catch (error) {
      console.error(error);
      toast.error('Silme başarısız');
    }
  };

  const copyInviteLink = (id: string) => {
    const link = `${window.location.origin}/register?token=${id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link kopyalandı');
  };

  if (!user || !institution) return <div className="p-8">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Kurum Ayarları</h1>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="invites">Davetler & Erişim</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Kurum Bilgileri</CardTitle>
              <CardDescription>
                Kurumunuzun temel bilgilerini buradan yönetebilirsiniz.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="name">Kurum Adı</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    disabled={!isFounder}
                  />
                  {!isFounder && (
                    <p className="text-xs text-muted-foreground text-amber-600 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Sadece Kurucu (Founder) bu alanı değiştirebilir.
                    </p>
                  )}
                </div>
                {isFounder && (
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Güncelle
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invites">
          <Card>
            <CardHeader>
              <CardTitle>Davet Yönetimi</CardTitle>
              <CardDescription>
                Yeni öğretmen veya yöneticileri kurumunuza davet edin. Link 7 gün geçerlidir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button onClick={() => createInvite('teacher')} disabled={inviteLoading}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Öğretmen Davet Et
                </Button>
                <Button onClick={() => createInvite('admin')} variant="outline" disabled={inviteLoading}>
                  <Shield className="mr-2 h-4 w-4" />
                  Yönetici Davet Et
                </Button>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground">Aktif Davetler</h3>
                {invites.length === 0 ? (
                  <p className="text-sm text-muted">Henüz aktif davet yok.</p>
                ) : (
                  <div className="grid gap-3">
                    {invites.map((invite) => (
                      <div key={invite.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {invite.role === 'admin' ? 'Yönetici' : 'Öğretmen'} Daveti
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({format(invite.expiresAt, 'd MMM yyyy', { locale: tr })})
                            </span>
                          </div>
                          <code className="text-[10px] text-muted-foreground block">...{invite.id.slice(-8)}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="icon" variant="ghost" onClick={() => copyInviteLink(invite.id)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteInvite(invite.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
