'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function ConcentrationAnalysis() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.xray.concentration', 'Concentration Analysis')}</CardTitle>
        <CardDescription>{t('analytics.xray.concentrationDesc', 'HHI, Gini, and Lorenz Curve')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.xray.concentrationPlaceholder', 'Metrics and Lorenz curve placeholder')}</div>
      </CardContent>
    </Card>
  );
}


