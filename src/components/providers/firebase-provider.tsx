'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { Loader2 } from 'lucide-react';

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { initialize, initialized, loading: dataLoading } = useAppStore();
  const { user, loading: authLoading, initAuth } = useAuthStore();

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  // Initialize Firestore data when authenticated and has institution
  useEffect(() => {
    if (user?.institutionId && !initialized) {
      initialize(user.institutionId);
    }
  }, [user, initialized, initialize]);

  // Handle redirects
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // Public pages that don't require auth
        const publicPages = ['/login', '/register']; 
        const isPublicPage = publicPages.some(p => pathname?.startsWith(p)) || pathname?.includes('token=');
        
        if (!isPublicPage) {
          router.push('/login');
        }
      } else {
        // User is authenticated
        if (!user.institutionId) {
          // New user, needs onboarding
          if (pathname !== '/onboarding') {
            router.push('/onboarding');
          }
        } else {
          // Existing user with institution
          if (pathname === '/login' || pathname === '/onboarding') {
            router.push('/');
          }
        }
      }
    }
  }, [user, authLoading, pathname, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Allow rendering for public pages or onboarding without data initialization
  if (pathname === '/login' || pathname === '/onboarding' || pathname?.startsWith('/register')) {
    return <>{children}</>;
  }

  // Not authenticated? (Should have redirected, but safe return)
  if (!user) {
    return null; // Or loader
  }

  // Authenticated but no institution? (Should have redirected to onboarding)
  if (!user.institutionId) {
    return null; 
  }

  // Show loading while fetching data (Only if we have institutionId)
  if (!initialized || dataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
