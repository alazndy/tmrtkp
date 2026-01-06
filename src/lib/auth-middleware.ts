import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from './firebase-admin';
import { UserRole } from '@/types';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    uid: string;
    email: string | undefined;
    role: UserRole;
    institutionId: string | null;
  };
}

interface VerifyResult {
  success: boolean;
  user?: AuthenticatedRequest['user'];
  error?: string;
  status?: number;
}

/**
 * Verify Firebase ID token from Authorization header
 * Returns user info if valid, error if not
 */
export async function verifyAuthToken(request: NextRequest): Promise<VerifyResult> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        success: false,
        error: 'Authorization header missing or invalid',
        status: 401,
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return {
        success: false,
        error: 'Token missing',
        status: 401,
      };
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();

    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: (userData?.role as UserRole) || 'teacher',
        institutionId: userData?.institutionId || null,
      },
    };
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        return { success: false, error: 'Token expired', status: 401 };
      }
      if (error.message.includes('invalid') || error.message.includes('malformed')) {
        return { success: false, error: 'Invalid token', status: 401 };
      }
    }
    
    return { success: false, error: 'Authentication failed', status: 500 };
  }
}

/**
 * Require authentication - returns error response if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<VerifyResult> {
  return verifyAuthToken(request);
}

/**
 * Require admin role - returns error response if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<VerifyResult> {
  const result = await verifyAuthToken(request);
  
  if (!result.success) {
    return result;
  }

  if (result.user?.role !== 'admin') {
    return {
      success: false,
      error: 'Admin access required',
      status: 403,
    };
  }

  return result;
}

/**
 * Create error response from verify result
 */
export function authErrorResponse(result: VerifyResult): NextResponse {
  return NextResponse.json(
    { success: false, error: result.error },
    { status: result.status || 401 }
  );
}
