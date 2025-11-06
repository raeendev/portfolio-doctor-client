'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function IdealAllocationCalculator() {
  const { t } = useLanguage();

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('profiling.idealAllocation.title', 'Ideal Portfolio Allocation')}</CardTitle>
        <CardDescription>{t('profiling.idealAllocation.subtitle', 'Suggested allocation based on your risk profile')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">
          {t('profiling.idealAllocation.chartPlaceholder', 'Donut chart placeholder')}
        </div>
      </CardContent>
    </Card>
  );
}


