'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function FunctionBreakdown() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.xray.function', 'Function Breakdown')}</CardTitle>
        <CardDescription>{t('analytics.xray.functionDesc', 'Store of Value, Platform, Utility, Payment')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.xray.functionPlaceholder', 'Pie chart placeholder')}</div>
      </CardContent>
    </Card>
  );
}


