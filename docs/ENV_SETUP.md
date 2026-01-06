# Environment Variables Kurulumu

Bu uygulama aşağıdaki environment variable'ları gerektirir.

## `.env.local` Dosyası Oluşturun

Proje kök dizininde `.env.local` dosyası oluşturun:

```bash
# Firebase Client SDK (Public - Safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Firebase Admin SDK (Server-side - Keep secret!)
# Generate from: Firebase Console > Project Settings > Service Accounts
# Format: JSON stringified (escape quotes)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"..."}

# Twilio (SMS & WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Resend (Email)
RESEND_API_KEY=re_your_resend_api_key
```

## Firebase Admin Credentials

1. Firebase Console'a gidin
2. **Project Settings** > **Service Accounts** sekmesine gidin
3. **Generate new private key** butonuna tıklayın
4. İndirilen JSON'u tek satıra çevirin (minify edin)
5. `FIREBASE_SERVICE_ACCOUNT_KEY` değişkenine atayın

## API Keys Nereden Alınır

| Servis   | Nereden                                                 |
| -------- | ------------------------------------------------------- |
| Firebase | [Firebase Console](https://console.firebase.google.com) |
| Twilio   | [Twilio Console](https://console.twilio.com)            |
| Resend   | [Resend Dashboard](https://resend.com/api-keys)         |

## Güvenlik Notları

> ⚠️ **ASLA** `.env.local` dosyasını git'e commit etmeyin!
>
> `.gitignore` dosyasında `.env*` pattern'i zaten mevcut.

Production deploy için environment variables'ları hosting platformunuzda (Firebase App Hosting, Vercel, vb.) ayarlayın.
