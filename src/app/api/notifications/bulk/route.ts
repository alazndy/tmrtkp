import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { z } from 'zod';
import twilio from 'twilio';

const requestSchema = z.object({
  recipients: z.array(z.object({
    phone: z.string().min(10),
    name: z.string().optional(),
  })).min(1).max(100), // Max 100 recipients per request
  message: z.string().min(1).max(1000),
  channel: z.enum(['whatsapp', 'sms']).default('whatsapp'),
});

export async function POST(request: NextRequest) {
  // 1. Rate limiting (stricter for bulk: 2 per minute)
  const rateLimitResult = rateLimit(request, { maxRequests: 2, windowMs: 60000 });
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult.reset);
  }

  // 2. Auth & Role check
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { recipients, message, channel } = validation.data;

    // Check Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Mesajlaşma servisi yapılandırılmamış' },
        { status: 503 }
      );
    }

    const client = twilio(accountSid, authToken);

    // Send messages in parallel with batching
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        // Replace placeholders in message
        const personalizedMessage = message
          .replace(/\{\{ogrenci_adi\}\}/g, recipient.name || 'Değerli Öğrenci');

        const from = channel === 'whatsapp' 
          ? twilioWhatsAppNumber 
          : twilioPhoneNumber;

        const to = channel === 'whatsapp'
          ? `whatsapp:${recipient.phone}`
          : recipient.phone;

        if (!from) {
          throw new Error(`${channel} numarası yapılandırılmamış`);
        }

        const result = await client.messages.create({
          body: personalizedMessage,
          from,
          to,
        });

        return { phone: recipient.phone, sid: result.sid, status: 'sent' };
      })
    );

    // Summarize results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      summary: {
        total: recipients.length,
        successful,
        failed,
      },
      results: results.map((r, i) => ({
        phone: recipients[i].phone,
        status: r.status === 'fulfilled' ? 'sent' : 'failed',
        error: r.status === 'rejected' ? (r.reason as Error).message : undefined,
      })),
    });

  } catch (error) {
    console.error('Toplu mesaj hatası:', error);
    return NextResponse.json(
      { error: 'Mesajlar gönderilemedi' },
      { status: 500 }
    );
  }
}
