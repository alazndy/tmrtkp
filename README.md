# Cisem Öğrenci Takip

Modern, güvenli ve production-ready dil kursu yönetim sistemi.

## 🚀 Hızlı Başlangıç

```bash
pnpm install
pnpm dev
```

Uygulama: http://localhost:3000

## ✨ Özellikler

| Modül             | Özellikler                              |
| ----------------- | --------------------------------------- |
| **Dashboard**     | İstatistikler, uyarılar, hızlı eylemler |
| **Öğrenciler**    | CRUD, KVKK rıza takibi, arama           |
| **Kurslar**       | A1-C2 seviyeleri, kategori grupları     |
| **Kayıtlar**      | Otomatik bitiş hesaplama, durum takibi  |
| **Yoklama**       | Günlük kayıt, istatistikler             |
| **Ödemeler**      | Durum takibi, hatırlatmalar             |
| **Mesajlar**      | SMS, WhatsApp, Email entegrasyonu       |
| **Multi-Tenancy** | Kurum izolasyonu, rol bazlı erişim      |

## 🛠️ Teknoloji Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS 4
- **UI:** Shadcn/UI, Radix Primitives, Lucide Icons
- **State:** Zustand 5 (modüler store)
- **Backend:** Firebase Auth + Firestore
- **External:** Twilio (SMS/WhatsApp), Resend (Email)

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router pages
│   ├── _components/        # Dashboard components
│   ├── api/notifications/  # SMS, WhatsApp, Email API
│   └── [pages]/           # Feature pages
├── components/
│   ├── layout/            # Sidebar, header
│   ├── providers/         # Firebase provider
│   └── ui/                # Shadcn components
├── lib/
│   ├── stores/            # Modüler Zustand stores
│   ├── firebase.ts        # Firebase client config
│   ├── firebase-admin.ts  # Firebase Admin SDK
│   ├── auth-middleware.ts # API auth utilities
│   ├── rate-limit.ts      # Rate limiting
│   ├── logger.ts          # Centralized logging
│   └── env.ts             # Environment validation
└── types/                 # TypeScript definitions
```

## 🔐 Güvenlik

- ✅ Firebase Auth + Custom Claims
- ✅ Firestore Rules (multi-tenant isolation)
- ✅ API Rate Limiting (5-10 req/min)
- ✅ Zod Input Validation
- ✅ Security Headers (X-Frame-Options, CSP)
- ✅ Token Expiry Validation

## 🚢 Deployment

### Firebase App Hosting

```bash
# Build
pnpm build

# Deploy
firebase deploy --only hosting
```

### Environment Variables

Gerekli env vars için [docs/ENV_SETUP.md](docs/ENV_SETUP.md) dosyasına bakın.

### CI/CD

GitHub Actions workflow `.github/workflows/ci.yml` dosyasında:

- Lint & Type Check
- Security Audit
- Build
- Auto Deploy (main branch)

## 📋 Development

```bash
# Install
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Type check
pnpm tsc --noEmit

# Lint
pnpm lint

# Security audit
pnpm audit
```

## 📄 Docs

- [Environment Setup](docs/ENV_SETUP.md)
- [Firestore Rules](firestore.rules)

## 🔗 Repository

https://github.com/alazndy/cisem_ogrenci_takip
