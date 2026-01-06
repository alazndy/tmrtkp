import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { z } from 'zod';
import { requireAdmin, authErrorResponse } from '@/lib/auth-middleware';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Input validation schema
const requestSchema = z.object({
  to: z.string().min(10).max(20),
  message: z.string().min(1).max(1600),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 5, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.reset);
    }

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authErrorResponse(authResult);
    }

    // 3. API keys check
    if (!accountSid || !authToken || !twilioPhoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Twilio yapılandırması eksik. Lütfen environment variables kontrol edin.' 
        },
        { status: 500 }
      );
    }

    // 4. Input validation
    const body = await request.json();
    const validation = requestSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz istek verisi.', details: validation.error.issues },
        { status: 400 }
      );
    }

    const { to, message } = validation.data;

    // 5. Format phone number (Turkey)
    let formattedPhone = to.replace(/\s/g, '').replace(/-/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+90' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+90' + formattedPhone;
    }

    // 6. Send SMS
    const client = twilio(accountSid, authToken);

    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: formattedPhone,
    });

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      status: result.status,
    });
  } catch (error) {
    console.error('SMS gönderim hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'SMS gönderilemedi.' 
      },
      { status: 500 }
    );
  }
}
