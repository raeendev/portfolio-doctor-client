'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function TradingPatterns() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.trades.patterns', 'Trading Patterns')}</CardTitle>
        <CardDescription>{t('analytics.trades.patternsDesc', 'Time, pairs, position size, holding time')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.trades.patternsPlaceholder', 'Heatmap and distribution charts will appear here')}</div>
      </CardContent>
    </Card>
  );
}


