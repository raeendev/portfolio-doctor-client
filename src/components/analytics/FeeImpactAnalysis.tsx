'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function FeeImpactAnalysis() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.trades.feeImpact', 'Fee Impact')}</CardTitle>
        <CardDescription>{t('analytics.trades.feeImpactDesc', 'Fees vs net profit comparison')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.trades.feePlaceholder', 'Charts and comparisons will appear here')}</div>
      </CardContent>
    </Card>
  );
}


