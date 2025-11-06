'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function DeviationDetector() {
  const { t } = useLanguage();

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('profiling.deviation.title', 'Deviation from Ideal')}</CardTitle>
        <CardDescription>{t('profiling.deviation.subtitle', 'Compare your current allocation to the ideal target')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="text-sm text-[var(--text-muted)] space-y-2">
          <li>{t('profiling.deviation.placeholder', 'Deviation analysis will appear here')}</li>
        </ul>
      </CardContent>
    </Card>
  );
}


