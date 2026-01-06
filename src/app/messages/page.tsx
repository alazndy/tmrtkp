'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, CheckCircle, AlertCircle, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { MessageTemplateType } from '@/types';

// Pre-defined templates
const DEFAULT_TEMPLATES = [
  {
    type: 'welcome' as MessageTemplateType,
    name: 'Hoş Geldiniz',
    content: 'Merhaba {{ogrenci_adi}}, {{kurum_adi}} ailesine hoş geldiniz! {{kurs_adi}} kursunuz {{baslangic_tarihi}} tarihinde başlayacaktır.',
  },
  {
    type: 'payment_reminder' as MessageTemplateType,
    name: 'Ödeme Hatırlatması',
    content: 'Sayın {{ogrenci_adi}}, {{tutar}}₺ tutarındaki ödemenizin vadesi {{vade_tarihi}} tarihindedir. Lütfen ödemenizi yapmayı unutmayınız.',
  },
  {
    type: 'course_expiry' as MessageTemplateType,
    name: 'Kurs Bitiş Hatırlatması',
    content: 'Merhaba {{ogrenci_adi}}, {{kurs_adi}} kursunuz {{bitis_tarihi}} tarihinde sona erecektir. Yenileme için bizimle iletişime geçebilirsiniz.',
  },
  {
    type: 'attendance_alert' as MessageTemplateType,
    name: 'Devamsızlık Uyarısı',
    content: 'Sayın Veli, {{ogrenci_adi}} öğrencimiz bugün derse katılmamıştır. Bilginize sunarız.',
  },
];

export default function MessagesPage() {
  const { students } = useAppStore();
  const { isAdmin } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState('send');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');

  const handleSendMessage = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Lütfen en az bir öğrenci seçin');
      return;
    }
    if (!customMessage && !selectedTemplate) {
      toast.error('Lütfen mesaj yazın veya şablon seçin');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get auth token
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error('Oturum hatası. Lütfen yeniden giriş yapın.');
        return;
      }

      // Prepare recipients
      const recipients = selectedStudents.map(id => {
        const student = students.find(s => s.id === id);
        return {
          phone: student?.phone || '',
          name: student ? `${student.firstName} ${student.lastName}` : undefined,
        };
      }).filter(r => r.phone);

      // Call bulk API
      const response = await fetch('/api/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients,
          message: customMessage,
          channel: 'whatsapp',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gönderim başarısız');
      }

      if (result.summary) {
        toast.success(
          `${result.summary.successful}/${result.summary.total} mesaj gönderildi` +
          (result.summary.failed > 0 ? ` (${result.summary.failed} başarısız)` : '')
        );
      }

      setSelectedStudents([]);
      setCustomMessage('');
    } catch (error) {
      console.error('Mesaj gönderimi hatası:', error);
      toast.error(error instanceof Error ? error.message : 'Mesaj gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.id));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Şablon kopyalandı');
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
          <h1 className="text-3xl font-bold">Mesajlar</h1>
          <p className="text-muted-foreground">WhatsApp üzerinden toplu mesaj gönderimi</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send" className="gap-2">
            <Send className="h-4 w-4" />
            Mesaj Gönder
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Şablonlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Student Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Alıcılar</span>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {selectedStudents.length === students.length ? 'Seçimi Kaldır' : 'Tümünü Seç'}
                  </Button>
                </CardTitle>
                <CardDescription>{selectedStudents.length} öğrenci seçildi</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto space-y-2">
                {students.map((student) => {
                  const isSelected = selectedStudents.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedStudents(prev => prev.filter(id => id !== student.id));
                        } else {
                          setSelectedStudents(prev => [...prev, student.id]);
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground">{student.phone}</p>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-primary" />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle>Mesaj</CardTitle>
                <CardDescription>Göndermek istediğiniz mesajı yazın veya şablon seçin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Şablon Seç (Opsiyonel)</Label>
                  <Select value={selectedTemplate} onValueChange={(v) => {
                    setSelectedTemplate(v);
                    const template = DEFAULT_TEMPLATES.find(t => t.type === v);
                    if (template) setCustomMessage(template.content);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şablon seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DEFAULT_TEMPLATES.map((t) => (
                        <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Mesaj İçeriği</Label>
                  <Textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Mesajınızı buraya yazın..."
                    rows={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Değişkenler: {'{{ogrenci_adi}}'}, {'{{kurs_adi}}'}, {'{{kurum_adi}}'}, {'{{tutar}}'}, {'{{vade_tarihi}}'}
                  </p>
                </div>

                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || selectedStudents.length === 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {selectedStudents.length} Kişiye Gönder
                    </>
                  )}
                </Button>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400 text-sm">Demo Modu</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">
                        Gerçek WhatsApp entegrasyonu için WhatsApp Business API gereklidir. 
                        Bu sayfa demo amaçlıdır.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {DEFAULT_TEMPLATES.map((template) => (
              <Card key={template.type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-base">
                    {template.name}
                    <Badge variant="secondary">{template.type}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    {template.content}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => copyToClipboard(template.content)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Kopyala
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
