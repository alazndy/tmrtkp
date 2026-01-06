'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  alert?: boolean;
}

interface DashboardStatsCardsProps {
  stats: StatItem[];
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover stat-glow overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon
                className={`h-4 w-4 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}
                style={{ color: stat.alert ? undefined : 'inherit' }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${stat.alert ? 'text-gradient' : ''}`}>
              {stat.value}
            </div>
            {stat.value > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-muted-foreground">Aktif</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
