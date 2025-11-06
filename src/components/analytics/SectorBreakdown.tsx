'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function SectorBreakdown() {
  const { t } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.xray.sector', 'Sector Breakdown')}</CardTitle>
        <CardDescription>{t('analytics.xray.sectorDesc', 'Layer 1, Layer 2, DeFi, NFT, Infrastructure')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-[var(--text-muted)]">{t('analytics.xray.sectorPlaceholder', 'Treemap or donut chart placeholder')}</div>
      </CardContent>
    </Card>
  );
}


