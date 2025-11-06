'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function TradeCalculator() {
  const { t } = useLanguage();
  return (
    <div className="text-sm text-[var(--text-muted)]">
      {t('rebalancing.tradeCalcPlaceholder', 'Calculation table placeholder')}
    </div>
  );
}


