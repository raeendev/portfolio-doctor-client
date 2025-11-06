'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function PerformanceMetrics() {
  const { t } = useLanguage();
  const items = [
    { key: 'winRate', label: t('analytics.metrics.winRate', 'Win Rate'), value: '—' },
    { key: 'profitFactor', label: t('analytics.metrics.profitFactor', 'Profit Factor'), value: '—' },
    { key: 'rr', label: t('analytics.metrics.rr', 'Risk/Reward'), value: '—' },
    { key: 'maxDd', label: t('analytics.metrics.maxDrawdown', 'Max Drawdown'), value: '—' },
    { key: 'sharpe', label: t('analytics.metrics.sharpe', 'Sharpe Ratio'), value: '—' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((it) => (
        <div key={it.key} className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)]">
          <div className="text-xs text-[var(--text-muted)] mb-1">{it.label}</div>
          <div className="text-xl font-semibold">{it.value}</div>
        </div>
      ))}
    </div>
  );
}


