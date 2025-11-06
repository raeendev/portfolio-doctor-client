'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PortfolioSummary {
  totalAssets: number;
  totalValueUSD: number;
  totalPnl: number;
  totalPnlPercent: number;
  connectedExchangesCount: number;
}

interface PortfolioSummaryProps {
  summary: PortfolioSummary;
  lastUpdated?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  pnlData?: {
    daily?: { usdt: number | null; percent: number | null };
    weekly?: { usdt: number | null; percent: number | null };
    monthly?: { usdt: number | null; percent: number | null };
  };
}

export function PortfolioSummary({ 
  summary, 
  lastUpdated, 
  onRefresh, 
  isRefreshing = false,
  pnlData
}: PortfolioSummaryProps) {
  const { t, isRTL } = useLanguage();
  const [pnlPeriod, setPnlPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Get P&L based on selected period
  const getPnlForPeriod = () => {
    if (pnlData) {
      const periodData = pnlData[pnlPeriod];
      if (periodData && periodData.usdt !== null && periodData.percent !== null) {
        return {
          value: periodData.usdt,
          percent: periodData.percent
        };
      }
    }
    // Fallback to summary P&L if no period data available
    return {
      value: summary.totalPnl,
      percent: summary.totalPnlPercent
    };
  };

  const currentPnl = getPnlForPeriod();
  const isProfit = currentPnl.value >= 0;
  const isLoss = currentPnl.value < 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(3)}%`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
      {/* Total Portfolio Value */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -4 }}
      >
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--primary)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{t('summary.totalPortfolioValue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-[#3b82f6]" />
          </CardHeader>
          <CardContent>
            <motion.div
              key={summary.totalValueUSD}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-[var(--foreground)]"
            >
              {formatCurrency(summary.totalValueUSD)}
            </motion.div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {t('portfolio.across')} {summary.connectedExchangesCount} {summary.connectedExchangesCount === 1 ? t('portfolio.exchange') : t('portfolio.exchanges')}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total P&L */}
      <motion.div
        custom={1}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        whileHover={{ scale: 1.02, y: -4 }}
      >
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--primary)] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{t('summary.totalPnL')}</CardTitle>
            {isProfit ? (
              <TrendingUp className="h-4 w-4 text-[#10b981]" />
            ) : (
              <TrendingDown className="h-4 w-4 text-[#ef4444]" />
            )}
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentPnl.value}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className={`text-2xl font-bold ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}
            >
              {formatCurrency(currentPnl.value)}
            </motion.div>
            <p className={`text-xs mt-1 ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {formatPercentage(currentPnl.percent)}
            </p>
            {/* P&L Period Filters */}
            <div className="flex space-x-1 mt-3">
              <Button
                variant={pnlPeriod === 'daily' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPnlPeriod('daily')}
                className={
                  pnlPeriod === 'daily'
                    ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs h-6 px-2'
                    : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] text-xs h-6 px-2'
                }
              >
                {t('portfolio.daily')}
              </Button>
              <Button
                variant={pnlPeriod === 'weekly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPnlPeriod('weekly')}
                className={
                  pnlPeriod === 'weekly'
                    ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs h-6 px-2'
                    : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] text-xs h-6 px-2'
                }
              >
                {t('portfolio.weekly')}
              </Button>
              <Button
                variant={pnlPeriod === 'monthly' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPnlPeriod('monthly')}
                className={
                  pnlPeriod === 'monthly'
                    ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs h-6 px-2'
                    : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)] text-xs h-6 px-2'
                }
              >
                {t('portfolio.monthly')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
