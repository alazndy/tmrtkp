import { z } from 'zod';

/**
 * Environment variable validation schema
 * Run this at app startup to catch missing config early
 */

// Server-side only env vars (not exposed to client)
const serverEnvSchema = z.object({
  // Firebase Admin (optional in dev, required in prod)
  FIREBASE_SERVICE_ACCOUNT_KEY: z.string().optional(),
  
  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TWILIO_WHATSAPP_NUMBER: z.string().optional(),
  
  // Resend
  RESEND_API_KEY: z.string().optional(),
});

// Client-side env vars (prefixed with NEXT_PUBLIC_)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;

/**
 * Validate environment variables
 * Call this in your app initialization
 */
export function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Server env
  const serverResult = serverEnvSchema.safeParse(process.env);
  
  if (!serverResult.success) {
    console.warn('Server environment validation issues:', serverResult.error.issues);
  }
  
  // Production-specific checks
  if (isProduction) {
    const required = ['FIREBASE_SERVICE_ACCOUNT_KEY'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Production: Missing recommended env vars: ${missing.join(', ')}`);
    }
  }
  
  return {
    isValid: serverResult.success,
    issues: serverResult.success ? [] : serverResult.error.issues,
  };
}

/**
 * Get typed server environment
 */
export function getServerEnv(): ServerEnv {
  return {
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    TWILIO_WHATSAPP_NUMBER: process.env.TWILIO_WHATSAPP_NUMBER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  };
}

/**
 * Get typed client environment
 */
export function getClientEnv(): ClientEnv {
  return {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
}
