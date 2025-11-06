'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function RebalanceRecommendations() {
  const { t } = useLanguage();
  const items: Array<{ action: 'increase' | 'decrease'; tier: string; amount: string; reason: string }> = [];
  return (
    <div className="space-y-2">
      {items.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{t('rebalancing.empty', 'No recommendations yet')}</p>
      ) : (
        items.map((it, idx) => (
          <div key={idx} className="p-3 rounded border border-[var(--card-border)] bg-[var(--input-bg)]">
            <div className="text-sm font-semibold">
              {it.action === 'increase' ? '↑' : '↓'} {it.tier}: {it.amount}
            </div>
            <div className="text-xs text-[var(--text-muted)]">{it.reason}</div>
          </div>
        ))
      )}
    </div>
  );
}


