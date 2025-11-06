'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

type Holding = { symbol: string; percent: number; color?: string };

interface InstitutionalCardProps {
  name: string;
  subtitle?: string;
  holdings: Holding[];
}

export function InstitutionalCard({ name, subtitle, holdings }: InstitutionalCardProps) {
  const total = holdings.reduce((s, h) => s + h.percent, 0) || 100;
  const palette = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader className="pb-3">
        <CardTitle className="text-[var(--foreground)] text-base font-semibold">{name}</CardTitle>
        {subtitle && (
          <CardDescription className="text-[var(--text-muted)] text-xs">{subtitle}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Stacked bar */}
        <div className="w-full h-3 rounded bg-[var(--input-bg)] border border-[var(--card-border)] overflow-hidden flex">
          {holdings.map((h, i) => (
            <div
              key={h.symbol}
              title={`${h.symbol} • ${h.percent.toFixed(1)}%`}
              style={{ width: `${(h.percent / total) * 100}%`, backgroundColor: (h.color || palette[i % palette.length]) + '55' }}
              className="h-full"
            />
          ))}
        </div>

        {/* Legend list */}
        <div className="space-y-2">
          {holdings.slice(0, 6).map((h, i) => (
            <div key={h.symbol} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded"
                  style={{ backgroundColor: h.color || palette[i % palette.length] }}
                />
                <span className="text-[var(--foreground)] font-medium">{h.symbol}</span>
              </div>
              <span className="text-[var(--text-muted)] text-xs">{h.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


