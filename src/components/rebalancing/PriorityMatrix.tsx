'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function PriorityMatrix() {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-3 gap-2 text-xs">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-16 rounded border border-[var(--card-border)] bg-[var(--input-bg)]" />
      ))}
      <div className="col-span-3 text-[var(--text-muted)] mt-2">{t('rebalancing.matrixPlaceholder', 'Priority grid placeholder')}</div>
    </div>
  );
}


