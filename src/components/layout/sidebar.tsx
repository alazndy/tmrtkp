'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap,
  LogOut,
  Shield,
  ClipboardList,
  Send,
  CreditCard,
  Calendar,
  UserPlus,
  MessageSquare,
  BarChart3
} from 'lucide-react';

// adminOnly: true olan menüler sadece admin'e görünür
const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/students', label: 'Öğrenciler', icon: Users, adminOnly: true },
  { href: '/teachers', label: 'Öğretmenler', icon: UserPlus, adminOnly: true },
  { href: '/courses', label: 'Kurslar', icon: BookOpen, adminOnly: true },
  { href: '/enrollments', label: 'Kayıtlar', icon: GraduationCap, adminOnly: true },
  { href: '/payments', label: 'Ödemeler', icon: CreditCard, adminOnly: true },
  { href: '/reports', label: 'Raporlar', icon: BarChart3, adminOnly: true },
  { href: '/calendar', label: 'Takvim', icon: Calendar, adminOnly: true },
  { href: '/attendance', label: 'Yoklama', icon: ClipboardList, adminOnly: false },
  { href: '/messages', label: 'Mesajlar', icon: MessageSquare, adminOnly: true },
  { href: '/notifications', label: 'Bildirimler', icon: Send, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, institution, logout, isAdmin } = useAuthStore();

  // Rol bazlı menü filtreleme
  const visibleNavItems = navItems.filter(item => !item.adminOnly || isAdmin());

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold truncate">
          {institution?.name || 'Cisem Takip'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
        
        {/* Settings Link for Admins */}
        {isAdmin() && (
           <Link
              href="/settings/institution"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors mt-4',
                pathname === '/settings/institution'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'hover:bg-sidebar-accent/50'
              )}
            >
              <Shield className="h-5 w-5" />
              Kurum Ayarları
            </Link>
        )}
      </nav>

      {/* Footer with User Info */}
      <div className="border-t p-4 space-y-3">
        {/* KVKK Link */}
        <Link
          href="/kvkk"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Shield className="h-3 w-3" />
          KVKK Aydınlatma Metni
        </Link>
        
        {user && (
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{user.displayName || 'Kullanıcı'}</p>
                <Badge 
                  variant={user.role === 'admin' ? 'default' : 'secondary'} 
                  className="text-[10px] px-1.5 py-0"
                >
                  {user.role === 'admin' ? 'Yönetici' : 'Öğretmen'}
                </Badge>
              </div>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              title="Çıkış Yap"
              className="ml-2 flex-shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
