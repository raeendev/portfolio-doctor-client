'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface SmartJournalGeneratorProps {
  portfolioData?: any;
}

type JournalEntry = {
  date: string;
  title: string;
  notes: string;
  focus: string;
};

export function SmartJournalGenerator({ portfolioData }: SmartJournalGeneratorProps) {
  const { t, isRTL } = useLanguage();
  const [generated, setGenerated] = useState<JournalEntry[] | null>(null);

  const buildEntries = useMemo(() => {
    const totalValue: number = portfolioData?.livePortfolio?.totalValueUSD || portfolioData?.portfolio?.totalValueUSD || 0;
    const pnlPct: number = portfolioData?.portfolio?.unrealizedPnlPercent ?? 0;
    const assets: Array<{ symbol: string; valueUSD?: number }>
      = (portfolioData?.livePortfolio?.assets || portfolioData?.portfolio?.assets || []).slice(0, 6);

    const topAsset = assets
      .map(a => ({ symbol: a.symbol, v: a.valueUSD ?? 0 }))
      .sort((a, b) => b.v - a.v)[0]?.symbol || 'BTC';

    const start = new Date();
    const days: JournalEntry[] = [];
    for (let i = 0; i < 10; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const date = d.toISOString().split('T')[0];

      const sentiment = pnlPct >= 0 ? (i % 2 === 0 ? 'review winners' : 'protect gains') : (i % 2 === 0 ? 'risk control' : 'opportunity scan');
      const focus = pnlPct >= 0
        ? (i % 3 === 0 ? 'take partial profits' : 'trail stops')
        : (i % 3 === 0 ? 'tighten stops' : 'avoid overtrading');

      const title = isRTL
        ? `ژورنال ${date}`
        : `Journal - ${date}`;

      const base = isRTL
        ? `ارزش کل پرتفوی: $${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}. نماد تمرکز امروز: ${topAsset}.`
        : `Total equity: $${totalValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}. Focus symbol: ${topAsset}.`;

      const guidance = isRTL
        ? pnlPct >= 0
          ? 'تمرکز بر حفظ سود، بررسی امکان جابه‌جایی حدضرر و برداشت جزئی سود.'
          : 'مدیریت ریسک فعال، سایز پوزیشن محافظه‌کارانه و پرهیز از معاملات انتقامی.'
        : pnlPct >= 0
          ? 'Focus on locking gains, review trailing stops and consider partial profits.'
          : 'Active risk control, conservative sizing, avoid revenge trading.';

      days.push({
        date,
        title,
        notes: `${base} ${guidance}`,
        focus: sentiment + ' / ' + focus,
      });
    }
    return days;
  }, [portfolioData, isRTL]);

  const onGenerate = () => setGenerated(buildEntries);

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle className="text-[var(--foreground)]">
          {isRTL ? 'ژورنال هوشمند' : 'Smart Trading Journal'}
        </CardTitle>
        <CardDescription className="text-[var(--text-muted)]">
          {isRTL
            ? 'در صورت نبود ژورنال، از زمان ورود شما به بعد بر اساس وضعیت فعلی پرتفوی ژورنال پیشنهادی تولید می‌شود.'
            : 'If you have no journal, generate an AI-guided draft from now onward based on your current portfolio.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!generated ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--text-muted)]">
              {isRTL ? 'برای تولید ژورنال از امروز به بعد روی دکمه زیر کلیک کنید.' : 'Click to generate a journal starting today.'}
            </p>
            <Button
              onClick={onGenerate}
              className="inline-flex items-center gap-2 rounded-lg shadow-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white"
            >
              {isRTL ? 'تولید ژورنال' : 'Generate Journal'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {generated.map((item) => (
              <div key={item.date} className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--card-border)] bg-[var(--card-hover)]">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] truncate">{item.title}</h4>
                  <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">{item.date}</span>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="text-xs text-[var(--foreground)]">
                    <span className="font-medium">{isRTL ? 'تمرکز روز:' : 'Focus:'}</span>
                    <span className={isRTL ? 'mr-1' : 'ml-1'}>{item.focus}</span>
                  </div>
                  <div className="text-sm text-[var(--text-muted)] leading-6">
                    {item.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


