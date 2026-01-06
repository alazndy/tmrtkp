import { Button } from '@/components/ui/button';
import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-20 h-20 mb-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <FileQuestion className="h-10 w-10 text-violet-600 dark:text-violet-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-violet-600 dark:text-violet-400 mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Sayfa Bulunamadı
        </h2>
        
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>

        <Link href="/">
          <Button className="gap-2">
            <Home className="h-4 w-4" />
            Ana Sayfa
          </Button>
        </Link>
      </div>
    </div>
  );
}
