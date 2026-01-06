import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { requireAdmin, authErrorResponse } from '@/lib/auth-middleware';
import { rateLimit, rateLimitResponse } from '@/lib/rate-limit';

const resendApiKey = process.env.RESEND_API_KEY;

// Input validation schema
const requestSchema = z.object({
  to: z.string().email(),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(10000),
  studentName: z.string().max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 10, windowMs: 60 * 1000 });
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.reset);
    }

    // 2. Authentication & Authorization
    const authResult = await requireAdmin(request);
    if (!authResult.success) {
      return authErrorResponse(authResult);
    }

    // 3. API key check
    if (!resendApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Resend API anahtarı eksik. Lütfen environment variables kontrol edin.' 
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

    const { to, subject, message, studentName } = validation.data;

    // 5. Send email
    const resend = new Resend(resendApiKey);

    // Sanitize studentName to prevent XSS in email
    const safeStudentName = studentName?.replace(/[<>]/g, '');
    const safeMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const { data, error } = await resend.emails.send({
      from: 'Cisem Dil Kursu <onboarding@resend.dev>',
      to: [to],
      subject: subject || 'Cisem Dil Kursu Bilgilendirme',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 12px 12px; }
            .message { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎓 Cisem Dil Kursu</h1>
            </div>
            <div class="content">
              ${safeStudentName ? `<p>Sayın <strong>${safeStudentName}</strong>,</p>` : ''}
              <div class="message">
                ${safeMessage.replace(/\n/g, '<br>')}
              </div>
            </div>
            <div class="footer">
              <p>Bu email Cisem Dil Kursu tarafından gönderilmiştir.</p>
              <p>© ${new Date().getFullYear()} Cisem Dil Kursu</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
    });
  } catch (error) {
    console.error('Email gönderim hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Email gönderilemedi.' 
      },
      { status: 500 }
    );
  }
}
