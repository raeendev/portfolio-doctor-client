'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface MarketOverviewProps {
  totalNotional?: number;
  longExposure?: number;
  shortExposure?: number;
  lsRatio?: number;
  lastUpdated?: string;
}

export function MarketOverview({
  totalNotional = 3960900000,
  longExposure = 1496746484.87,
  shortExposure = 2464150361.13,
  lsRatio = 38,
  lastUpdated
}: MarketOverviewProps) {
  const { t, isRTL } = useLanguage();
  const isShortBias = lsRatio < 50;
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000000) {
      return `$${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatLargeNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Generate trend data for 7 days
  const trendData = [
    { day: 'Oct 24', longPercent: 41 },
    { day: 'Oct 25', longPercent: 49 },
    { day: 'Oct 26', longPercent: 49 },
    { day: 'Oct 27', longPercent: 40 },
    { day: 'Oct 28', longPercent: 41 },
    { day: 'Oct 29', longPercent: 28 },
    { day: 'Oct 30', longPercent: 38 },
    { day: 'Oct 31', longPercent: lsRatio },
  ];

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-1">{t('marketOverview.title')}</CardTitle>
        <CardDescription className="text-[var(--text-muted)] text-xs">
          {t('marketOverview.subtitle')}
        </CardDescription>
        {lastUpdated && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('marketOverview.updated')} {lastUpdated}</p>
        )}
        {!lastUpdated && (
          <p className="text-xs text-[var(--text-muted)] mt-1">{t('marketOverview.updated')} 5 {t('marketOverview.minutesAgo')}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Total Notional */}
        <div className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--text-muted)]">{t('marketOverview.totalNotional')}</span>
            <span className="text-lg font-bold text-[var(--foreground)]">
              {formatCurrency(totalNotional)}
            </span>
          </div>
        </div>

        {/* Long/Short Ratio */}
        <div className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--text-muted)]">{t('marketOverview.longShortRatio')}</span>
            <div className="flex items-center space-x-2">
              {isShortBias ? (
                <TrendingDown className="h-4 w-4 text-[#ef4444]" />
              ) : (
                <TrendingUp className="h-4 w-4 text-[#10b981]" />
              )}
              <span className={`text-lg font-bold ${isShortBias ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                {lsRatio}%
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded ${isShortBias ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#10b981]/20 text-[#10b981]'}`}>
              {isShortBias ? t('marketOverview.shortBias') : t('marketOverview.longBias')}
            </span>
          </div>
        </div>

        {/* Exposure */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-[var(--input-bg)] rounded border border-[var(--card-border)] transition-colors">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-[#10b981]" />
              <span className="text-sm text-[var(--text-muted)]">{t('marketOverview.long')}</span>
            </div>
            <span className="text-sm font-semibold text-[#10b981]">
              {formatCurrency(longExposure)}
            </span>
          </div>
          <div className="flex items-center justify-between p-2 bg-[var(--input-bg)] rounded border border-[var(--card-border)] transition-colors">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-[#ef4444]" />
              <span className="text-sm text-[var(--text-muted)]">{t('marketOverview.short')}</span>
            </div>
            <span className="text-sm font-semibold text-[#ef4444]">
              {formatCurrency(shortExposure)}
            </span>
          </div>
        </div>

        {/* L/S Ratio Trend (7 Days) */}
        <div className="mt-4 pt-4 border-t border-[var(--card-border)]">
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">{t('marketOverview.ratioTrend')}</h4>
          <div className="space-y-2">
            {trendData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] w-16">{data.day}</span>
                <div className="flex-1 mx-2">
                  <div className="relative h-4 bg-[var(--input-bg)] rounded-full overflow-hidden border border-[var(--card-border)] transition-colors">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${data.longPercent}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${data.longPercent >= 50 ? 'bg-[#10b981]' : 'bg-[#ef4444]'}`}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-[var(--foreground)] w-12 text-right">
                  {data.longPercent}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">{t('marketOverview.globalBias')}</span>
              <span className={`font-semibold ${isShortBias ? 'text-[#ef4444]' : 'text-[#10b981]'}`}>
                {isShortBias ? t('marketOverview.short').toUpperCase() : t('marketOverview.long').toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-[var(--text-muted)]">{t('marketOverview.longShort')}</span>
              <span className="font-semibold text-[var(--foreground)]">{lsRatio}%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[var(--card-border)]">
          <p className="text-xs text-[var(--text-muted)] text-center">
            {t('marketOverview.leaderboardInfo')}
          </p>
          <p className="text-xs text-[var(--text-muted)] text-center mt-1">
            <a href="https://hyperdash.info" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">
              hyperdash.info
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

