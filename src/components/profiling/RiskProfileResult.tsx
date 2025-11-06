'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function RiskProfileResult() {
  const { t } = useLanguage();
  // Placeholder values until backend integration
  const profileType = t('profiling.profileType.balanced', 'Balanced');

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('profiling.riskProfile.result', 'Your Risk Profile')}</CardTitle>
        <CardDescription>{t('profiling.riskProfile.resultDesc', 'Based on your answers')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--text-muted)] mb-1">{t('profiling.riskProfile.type', 'Profile Type')}</p>
            <p className="text-xl font-semibold">{profileType}</p>
          </div>
          <div className="text-sm text-[var(--text-muted)]">
            {t('profiling.riskProfile.chartPlaceholder', 'Radar chart placeholder')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


