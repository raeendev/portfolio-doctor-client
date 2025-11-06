'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

type Direction = 'LONG' | 'SHORT';

type Trade = {
  id: string;
  date: string;
  symbol: string;
  direction: Direction;
  size: number;
  price: number;
  stop?: number;
  target?: number;
  entryReason?: string;
  exitReason?: string;
  emotions?: string;
  strategy?: string;
};

function scoreTrade(t: Trade): number {
  let score = 50;
  const rr = t.stop && t.target ? Math.abs((t.target - t.price) / (t.price - t.stop)) : null;
  if (rr && rr >= 2) score += 15;
  if (rr && rr < 1) score -= 10;
  if ((t.entryReason || '').length > 15) score += 5;
  if ((t.emotions || '').toLowerCase().includes('fomo')) score -= 5;
  if ((t.emotions || '').toLowerCase().includes('calm')) score += 3;
  if (t.strategy) score += 2;
  return Math.max(0, Math.min(100, score));
}

export function TradingJournalModule() {
  const { isRTL } = useLanguage();
  const [trades, setTrades] = useState<Trade[]>([]);

  const [form, setForm] = useState<Trade>({
    id: '',
    date: new Date().toISOString().slice(0, 10),
    symbol: '',
    direction: 'LONG',
    size: 0,
    price: 0,
    stop: undefined,
    target: undefined,
    entryReason: '',
    exitReason: '',
    emotions: '',
    strategy: '',
  });

  const onChange = (key: keyof Trade, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const reset = () => setForm(prev => ({ ...prev, id: '', symbol: '', size: 0, price: 0, stop: undefined, target: undefined, entryReason: '', exitReason: '', emotions: '' }));
  const addTrade = () => {
    if (!form.symbol || !form.price || !form.size) return;
    const id = `${form.symbol}-${Date.now()}`;
    setTrades(prev => [{ ...form, id }, ...prev]);
    reset();
  };

  const strategies = useMemo(() => Array.from(new Set(trades.map(t => t.strategy).filter(Boolean) as string[])), [trades]);
  const [strategyFilter, setStrategyFilter] = useState<string>('');

  const filtered = useMemo(() => {
    return strategyFilter ? trades.filter(t => t.strategy === strategyFilter) : trades;
  }, [trades, strategyFilter]);

  const perf = useMemo(() => {
    const count = filtered.length;
    const avgScore = count ? Math.round(filtered.reduce((a, t) => a + scoreTrade(t), 0) / count) : 0;
    const longCount = filtered.filter(t => t.direction === 'LONG').length;
    const shortCount = count - longCount;
    return { count, avgScore, longCount, shortCount };
  }, [filtered]);

  return (
    <div className="space-y-6">
      {/* Quick Entry */}
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">{isRTL ? 'ژورنال معاملاتی' : 'Trading Journal'}</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">{isRTL ? 'ثبت سریع و ساخت امتیاز خودکار' : 'Quick entry with auto scoring'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3`}>
            <Input placeholder={isRTL ? 'نماد' : 'Symbol'} value={form.symbol} onChange={e => onChange('symbol', e.target.value.toUpperCase())} />
            <select className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded px-3 py-2 text-sm" value={form.direction} onChange={e => onChange('direction', e.target.value as Direction)}>
              <option value="LONG">LONG</option>
              <option value="SHORT">SHORT</option>
            </select>
            <Input placeholder={isRTL ? 'حجم (USDT)' : 'Size (USDT)'} type="number" value={form.size || ''} onChange={e => onChange('size', parseFloat(e.target.value) || 0)} />
            <Input placeholder={isRTL ? 'قیمت ورود' : 'Entry Price'} type="number" value={form.price || ''} onChange={e => onChange('price', parseFloat(e.target.value) || 0)} />
            <Input placeholder={isRTL ? 'استاپ' : 'Stop'} type="number" value={form.stop || ''} onChange={e => onChange('stop', e.target.value ? parseFloat(e.target.value) : undefined)} />
            <Input placeholder={isRTL ? 'تارگت' : 'Target'} type="number" value={form.target || ''} onChange={e => onChange('target', e.target.value ? parseFloat(e.target.value) : undefined)} />
            <Input placeholder={isRTL ? 'دلیل ورود' : 'Entry Reason'} value={form.entryReason || ''} onChange={e => onChange('entryReason', e.target.value)} />
            <Input placeholder={isRTL ? 'دلیل خروج' : 'Exit Reason'} value={form.exitReason || ''} onChange={e => onChange('exitReason', e.target.value)} />
            <Input placeholder={isRTL ? 'احساسات' : 'Emotions'} value={form.emotions || ''} onChange={e => onChange('emotions', e.target.value)} />
            <Input placeholder={isRTL ? 'استراتژی' : 'Strategy'} value={form.strategy || ''} onChange={e => onChange('strategy', e.target.value)} />
          </div>
          <div className={`mt-3 ${isRTL ? 'text-left' : 'text-right'}`}>
            <Button onClick={addTrade} className="bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white">
              {isRTL ? 'ثبت معامله' : 'Add Trade'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Filters */}
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">{isRTL ? 'داشبورد عملکرد' : 'Performance Dashboard'}</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">{isRTL ? 'خلاصه آماری و فیلتر استراتژی' : 'Stats summary and strategy filter'}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-[var(--foreground)]">{isRTL ? 'تعداد معاملات:' : 'Trades:'} <span className="font-semibold">{perf.count}</span></div>
            <div className="text-sm text-[var(--foreground)]">{isRTL ? 'امتیاز میانگین:' : 'Avg Score:'} <span className="font-semibold">{perf.avgScore}</span></div>
            <div className="text-sm text-[var(--foreground)]">LONG: <span className="font-semibold">{perf.longCount}</span></div>
            <div className="text-sm text-[var(--foreground)]">SHORT: <span className="font-semibold">{perf.shortCount}</span></div>
            <select className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded px-3 py-2 text-sm" value={strategyFilter} onChange={e => setStrategyFilter(e.target.value)}>
              <option value="">{isRTL ? 'همه استراتژی‌ها' : 'All strategies'}</option>
              {strategies.map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="mt-4 text-xs text-[var(--text-muted)]">{isRTL ? 'نمودارها در نسخه بعد اضافه می‌شود.' : 'Charts will be added in the next iteration.'}</div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">{isRTL ? 'لیست معاملات' : 'Trades'}</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">{isRTL ? 'امتیاز خودکار برای هر معامله' : 'Auto score for each trade'}</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-sm text-[var(--text-muted)]">{isRTL ? 'معامله‌ای ثبت نشده است.' : 'No trades yet.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border border-[var(--card-border)] rounded-md overflow-hidden text-left">
                <thead className="bg-[var(--card-hover)] text-xs">
                  <tr>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'تاریخ' : 'Date'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'نماد' : 'Symbol'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'جهت' : 'Side'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'حجم' : 'Size'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'قیمت' : 'Price'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">Stop</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">Target</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'استراتژی' : 'Strategy'}</th>
                    <th className="px-3 py-2 border-b border-[var(--card-border)]">{isRTL ? 'امتیاز' : 'Score'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} className="odd:bg-[var(--input-bg)] text-xs">
                      <td className="px-3 py-2 whitespace-nowrap text-[var(--text-muted)]">{t.date}</td>
                      <td className="px-3 py-2">{t.symbol}</td>
                      <td className="px-3 py-2">{t.direction}</td>
                      <td className="px-3 py-2">{t.size}</td>
                      <td className="px-3 py-2">{t.price}</td>
                      <td className="px-3 py-2">{t.stop ?? '-'}</td>
                      <td className="px-3 py-2">{t.target ?? '-'}</td>
                      <td className="px-3 py-2">{t.strategy || '-'}</td>
                      <td className="px-3 py-2 font-semibold">{scoreTrade(t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Goals */}
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle className="text-[var(--foreground)]">{isRTL ? 'اهداف و چالش‌های هفتگی' : 'Weekly Goals & Challenges'}</CardTitle>
          <CardDescription className="text-[var(--text-muted)]">{isRTL ? 'برای تمرکز بهتر در هفته' : 'To focus better this week'}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-[var(--foreground)] space-y-1">
            <li>{isRTL ? 'حداکثر ۱٪ ریسک در هر معامله' : 'Max 1% risk per trade'}</li>
            <li>{isRTL ? 'ورود فقط با تأیید دوگانه (سطح + تایید حجم)' : 'Enter only with double confirmation (level + volume)'}</li>
            <li>{isRTL ? 'خروج پله‌ای و عدم جابجایی حدضرر به سمت عقب' : 'Scale out, no widening of stop'}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


