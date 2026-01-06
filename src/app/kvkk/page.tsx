'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shield, Mail, Phone, MapPin, FileText, Users, Database, Share2 } from 'lucide-react';

// Aydınlatma metni versiyonu - her güncelleme için artırın
export const KVKK_VERSION = "1.0";

export default function KVKKPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kişisel Verilerin Korunması</h1>
          <p className="text-muted-foreground">
            6698 Sayılı KVKK Kapsamında Aydınlatma Metni
          </p>
          <Badge variant="outline" className="mt-2">Versiyon {KVKK_VERSION}</Badge>
        </div>
      </div>

      {/* Veri Sorumlusu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Veri Sorumlusu
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Cisem Dil Kursu</strong> olarak kişisel verilerinizin güvenliği konusunda 
            azami hassasiyet göstermekteyiz. 6698 sayılı Kişisel Verilerin Korunması Kanunu 
            (&quot;KVKK&quot;) kapsamında, veri sorumlusu sıfatıyla kişisel verilerinizi aşağıda 
            açıklanan amaçlar ve hukuki sebepler çerçevesinde işlemekteyiz.
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>[Adres bilgisi eklenecek]</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>[Telefon numarası eklenecek]</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>kvkk@cisem.com</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İşlenen Veriler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            İşlenen Kişisel Veriler
          </CardTitle>
          <CardDescription>
            Kursumuza kayıt olmanız halinde aşağıdaki kişisel verileriniz işlenmektedir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Kimlik Bilgileri</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Ad</li>
                <li>Soyad</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">İletişim Bilgileri</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>E-posta adresi</li>
                <li>Telefon numarası</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Eğitim Bilgileri</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Kayıtlı kurslar</li>
                <li>Kurs başlangıç/bitiş tarihleri</li>
                <li>Kurs durumu</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Diğer Bilgiler</h4>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                <li>Öğrenci notları (varsa)</li>
                <li>Kayıt tarihi</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* İşleme Amaçları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            İşleme Amaçları ve Hukuki Sebepler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <h4 className="font-medium">Sözleşmenin İfası (KVKK m.5/2-c)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Kurs kaydı, takibi ve eğitim hizmetinin sunulması
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <h4 className="font-medium">Meşru Menfaat (KVKK m.5/2-f)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Kurs bitiş hatırlatmaları, iletişim ve hizmet kalitesinin artırılması
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <h4 className="font-medium">Yasal Yükümlülük (KVKK m.5/2-ç)</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Mevzuat gereği tutulması zorunlu kayıtlar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Veri Aktarımı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Veri Aktarımı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Kişisel verileriniz, hizmet kalitesinin sağlanması amacıyla aşağıdaki 
            taraflara aktarılabilmektedir:
          </p>
          <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <h4 className="font-medium text-amber-800 dark:text-amber-200">
              Yurt Dışı Aktarım Bildirimi
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Verileriniz, Google Firebase (ABD) altyapısı kullanılarak barındırılmaktadır. 
              Bu aktarım, KVKK m.9 kapsamında açık rızanıza dayanmaktadır. Google&apos;ın 
              veri koruma politikaları için:{' '}
              <a 
                href="https://firebase.google.com/support/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                Firebase Gizlilik Politikası
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Haklarınız */}
      <Card>
        <CardHeader>
          <CardTitle>Veri Sahibi Olarak Haklarınız</CardTitle>
          <CardDescription>KVKK Madde 11 kapsamında</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
              'İşlenmişse buna ilişkin bilgi talep etme',
              'İşlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme',
              'Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme',
              'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
              'KVKK m.7 şartları çerçevesinde silinmesini veya yok edilmesini isteme',
              'Düzeltme veya silme işlemlerinin aktarıldığı üçüncü kişilere bildirilmesini isteme',
              'Münhasıran otomatik sistemler vasıtasıyla analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
              'Kanuna aykırı işlenmesi sebebiyle zarara uğramanız halinde zararın giderilmesini talep etme'
            ].map((hak, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{hak}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Başvuru */}
      <Card>
        <CardHeader>
          <CardTitle>Başvuru</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle 
            bizimle iletişime geçebilirsiniz:
          </p>
          <div className="space-y-2 text-sm">
            <p><strong>E-posta:</strong> kvkk@cisem.com</p>
            <p><strong>Posta:</strong> [Adres bilgisi eklenecek]</p>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            Başvurularınız en geç 30 (otuz) gün içinde sonuçlandırılacaktır. 
            İşlemin ayrıca bir maliyeti gerektirmesi halinde, Kurul tarafından 
            belirlenen tarifedeki ücret alınabilir.
          </p>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Son güncelleme: Ocak 2026</p>
        <p>Bu aydınlatma metni örnek niteliğindedir. Profesyonel hukuki danışmanlık alınması önerilir.</p>
      </div>
    </div>
  );
}
