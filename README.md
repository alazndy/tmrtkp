# Cisem Öğrenci Takip

Dil kursu öğrencilerinin kurs kayıtlarını takip eden ve kurs bitiş tarihlerinde uyarı veren web uygulaması.

## Teknolojiler

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Components:** Shadcn/UI
- **State Management:** Zustand (localStorage persist)
- **Date Handling:** date-fns (Türkçe locale)

## Başlangıç

```bash
pnpm install
pnpm dev
```

Uygulama: http://localhost:3000

## Özellikler

### Dashboard

- Toplam öğrenci, aktif kayıt, süresi yaklaşan ve dolmuş istatistikleri
- Süresi 7 gün içinde dolacak kayıtlar için uyarı kartları

### Öğrenci Yönetimi

- Öğrenci ekleme, düzenleme, silme
- Arama ve filtreleme

### Kurs Kayıtları

- Öğrenciyi kursa kaydetme
- Takvimden başlangıç tarihi seçimi
- Otomatik bitiş tarihi hesaplama
- Kayıt tamamlama/iptal

### Kurslar

- A1, A2, B1, B2, C1 seviye kursları
- Süre ve fiyat bilgileri

## Klasör Yapısı

```
src/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── layout.tsx        # Ana layout + Sidebar
│   ├── students/         # Öğrenci sayfaları
│   ├── courses/          # Kurs listesi
│   └── enrollments/      # Kayıt sayfaları
├── components/
│   ├── layout/           # Sidebar
│   └── ui/               # Shadcn components
├── lib/
│   ├── store.ts          # Zustand store
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript types
```

## Git Repository

Repo URL: [TODO: Buraya repo URL'sini ekleyin]
