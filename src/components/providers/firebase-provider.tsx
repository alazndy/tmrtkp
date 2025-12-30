'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';

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

  // Initialize Firestore data when authenticated
  useEffect(() => {
    if (user && !initialized) {
      initialize();
    }
  }, [user, initialized, initialize]);

  // Handle redirects
  useEffect(() => {
    if (!authLoading) {
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
    }
  }, [user, authLoading, pathname, router]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If on login page, don't show main app structure
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Not authenticated, don't render anything (will redirect)
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching data
  if (!initialized || dataLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
