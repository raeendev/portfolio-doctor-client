'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function PortfolioBenchmarkModule() {
  const { isRTL } = useLanguage();

  const title = isRTL ? 'ماژول مقایسه نهادی' : 'Institutional Benchmarking';
  const subtitle = isRTL
    ? 'مقایسه پرتفوی شما با معیارهای نهادی و گزارش شکاف'
    : 'Compare your portfolio against institutional benchmarks and see gaps';

  const items = isRTL
    ? [
        'بنچمارک با Grayscale Trusts (GBTC, ETHE)',
        'مقایسه با ETFهای (BITO, IBIT)',
        'آنالیز VCهای برتر (a16z, Pantera)',
        'نمایش Heat Map مقایسه‌ای',
        'گزارش شکاف استراتژیک',
      ]
    : [
        'Benchmark with Grayscale Trusts (GBTC, ETHE)',
        'Compare with ETFs (BITO, IBIT)',
        'Top VCs analysis (a16z, Pantera)',
        'Comparative Heat Map',
        'Strategic Gap Report',
      ];

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle className="text-[var(--foreground)]">{title}</CardTitle>
        <CardDescription className="text-[var(--text-muted)]">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc list-inside text-sm text-[var(--foreground)] space-y-1">
          {items.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


