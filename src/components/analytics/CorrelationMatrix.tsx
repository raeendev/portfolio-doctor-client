'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function CorrelationMatrix() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.xray.correlation', 'Correlation Matrix')}</CardTitle>
        <CardDescription>{t('analytics.xray.correlationDesc', 'Heatmap of asset correlations')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.xray.correlationPlaceholder', 'Heatmap placeholder')}</div>
      </CardContent>
    </Card>
  );
}


