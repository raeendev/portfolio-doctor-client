'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { ExchangeSyncStatus } from '@/components/analytics/ExchangeSyncStatus';
import { PerformanceMetrics } from '@/components/analytics/PerformanceMetrics';
import { TradingPatterns } from '@/components/analytics/TradingPatterns';
import { FeeImpactAnalysis } from '@/components/analytics/FeeImpactAnalysis';
import { ImportTradeData } from '@/components/ImportTradeData';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { TradingJournalModule } from '@/components/journal/TradingJournalModule';

export default function TradeAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [showAnalysis, setShowAnalysis] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="dashboard" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div className="rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navigation currentPage="dashboard" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">{t('analytics.trades.title', 'Trade History Analysis')}</h1>
          <p className="text-[var(--text-muted)]">{t('analytics.trades.subtitle', 'Sync and analyze your trading performance')}</p>
        </motion.div>

        {/* Upload/Import Trade History */}
        <ImportTradeData onImportSuccess={() => setShowAnalysis(false)} />

        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--text-muted)]">{t('analytics.trades.analyzeHint', 'Analyze your imported trade history')}</div>
          <Button
            onClick={() => setShowAnalysis(true)}
            className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white"
          >
            {t('analytics.trades.analyze', 'Analyze Trades')}
          </Button>
        </div>

        {/* Exchange Sync Status */}
        <ExchangeSyncStatus />

        {/* KPIs */}
        {showAnalysis && (
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <CardTitle>{t('analytics.trades.metrics', 'Performance Metrics')}</CardTitle>
            <CardDescription>{t('analytics.trades.metricsDesc', 'Key performance indicators')}</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceMetrics />
          </CardContent>
        </Card>
        )}

        {/* Patterns & Fees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TradingPatterns />
          <FeeImpactAnalysis />
        </div>

        {/* Trading Journal - Performance Dashboard & Trades List */}
        <TradingJournalModule />
      </main>
    </div>
  );
}


