'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { PortfolioSummary as PortfolioSummaryType } from '@/components/PortfolioSummary';
import { PortfolioAssetCard, PortfolioAsset } from '@/components/PortfolioAssetCard';
import { PortfolioDistribution } from '@/components/PortfolioDistribution';
import { PortfolioDonutChart } from '@/components/PortfolioDonutChart';
import { PortfolioAIAdvisor } from '@/components/PortfolioAIAdvisor';
import { MemeCoinRiskAlert } from '@/components/MemeCoinRiskAlert';
// Institutional benchmarking temporarily removed
// Trading journal moved to trades page
import { portfolioApi } from '@/lib/api';
import { RefreshCw, AlertCircle, ExternalLink, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PortfolioData {
  portfolio?: {
    id: string;
    totalValueUSD: number;
    costBasis: number;
    unrealizedPnl: number;
    unrealizedPnlPercent: number;
    lastUpdated: string;
    assets: PortfolioAsset[];
  };
  connectedExchanges?: string[];
  summary?: PortfolioSummaryType;
  livePortfolio?: {
    totalValueUSD: number;
    totalValueUSDT: number;
    accounts?: {
      spot?: { valueUSD: number; percent: number };
      futures?: { valueUSD: number; percent: number };
      margin?: { valueUSD: number; percent: number };
      funding?: { valueUSD: number; percent: number };
    };
    futuresBalanceUSD?: number;
    assets?: Array<{
      symbol: string;
      name?: string;
      quantity: number;
      free?: number;
      frozen?: number;
      priceUSD: number | null;
      valueUSD: number | null;
      accountType: 'SPOT' | 'FUTURES' | 'COMBINED';
      tier: 'CORE' | 'SATELLITE' | 'SPECULATIVE';
      lastUpdated: string;
    }>;
    pnl?: {
      daily?: { usdt: number | null; percent: number | null };
      weekly?: { usdt: number | null; percent: number | null };
      monthly?: { usdt: number | null; percent: number | null };
    };
    timeZone?: string;
    timestampUTC8?: string;
  };
}

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const loadPortfolio = useCallback(async (showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);
      const response = await portfolioApi.getPortfolio();
      // Debug: Log the actual API response to verify data
      console.log('Portfolio API Response:', {
        livePortfolio: response.data.livePortfolio,
        assets: response.data.livePortfolio?.assets?.length || 0,
        totalValue: response.data.livePortfolio?.totalValueUSD || response.data.portfolio?.totalValueUSD
      });
      setPortfolioData(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setError(t('portfolio.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  const handleRefresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await loadPortfolio(false);
    } catch (error) {
      console.error('Failed to refresh portfolio:', error);
      setError(t('portfolio.failedToRefresh'));
    } finally {
      setIsRefreshing(false);
    }
  }, [loadPortfolio, t]);

  // Helper functions - Must be defined before any conditional returns (Rules of Hooks)
  const getSummary = useCallback(() => {
    if (portfolioData?.summary) {
      return portfolioData.summary;
    }
    return {
      totalAssets: 0,
      totalValueUSD: 0,
      totalPnl: 0,
      totalPnlPercent: 0,
      connectedExchangesCount: portfolioData?.connectedExchanges?.length || 0,
    };
  }, [portfolioData]);

  const getAssets = useCallback((): PortfolioAsset[] => {
    if (!portfolioData) return [];
    
    if (portfolioData.livePortfolio?.assets && portfolioData.livePortfolio.assets.length > 0) {
      return portfolioData.livePortfolio.assets.map((asset) => ({
        id: asset.symbol,
        symbol: asset.symbol,
        quantity: asset.quantity,
        valueUSD: asset.valueUSD || 0,
        costBasis: 0,
        averageBuyPrice: asset.priceUSD || 0,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        tier: asset.tier || 'SPECULATIVE',
        accountType: asset.accountType,
        lastUpdated: asset.lastUpdated || new Date().toISOString(),
      }));
    }
    return portfolioData.portfolio?.assets || [];
  }, [portfolioData]);

  const getAssetsByType = useCallback((accountType: 'SPOT' | 'FUTURES' | 'COMBINED') => {
    return getAssets().filter((a) => a.accountType === accountType);
  }, [getAssets]);

  // Calculate derived data - Must be before conditional returns
  const allAssets = getAssets();
  const spotAssets = getAssetsByType('SPOT');
  const futuresAssets = getAssetsByType('FUTURES');
  const combinedAssets = getAssetsByType('COMBINED');
  const totalValue = portfolioData?.livePortfolio?.totalValueUSD || portfolioData?.portfolio?.totalValueUSD || 0;


  const donutChartData = useMemo(() => {
    if (allAssets.length === 0) return [];
    
    const sortedAssets = [...allAssets].sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 4);
    const total = sortedAssets.reduce((sum, asset) => sum + asset.valueUSD, 0) || totalValue;
    
    return sortedAssets.map((asset, index) => ({
      symbol: asset.symbol,
      value: asset.valueUSD,
      percentage: total > 0 ? (asset.valueUSD / total) * 100 : 0,
      color: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b'][index % 4],
    }));
  }, [allAssets, totalValue]);

  const summary = getSummary();

  // Animation variants - Must be defined before conditional returns
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  useEffect(() => {
    if (user && !portfolioData) {
      loadPortfolio(true);
    }
  }, [user, portfolioData, loadPortfolio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="rounded-full h-32 w-32 border-4 border-[#3b82f6] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading && !portfolioData) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="rounded-full h-32 w-32 border-4 border-[#3b82f6] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navigation currentPage="portfolio" />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-[var(--card-bg)] border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <span>{error}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="text-[var(--danger)] hover:opacity-80 hover:bg-[var(--card-hover)]"
                >
                  ×
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">{t('portfolio.title')}</h1>
            <p className="text-[var(--text-muted)]">
              {t('portfolio.subtitle', { count: summary.connectedExchangesCount })}
            </p>
          </div>
          <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            {/* Last Updated */}
            {portfolioData?.portfolio?.lastUpdated && (
              <div className={`flex flex-col ${isRTL ? 'items-start' : 'items-end'}`}>
                <span className="text-xs text-[var(--text-muted)]">{t('portfolio.lastUpdated')}</span>
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {new Date(portfolioData.portfolio.lastUpdated).toLocaleString(isRTL ? 'fa-IR' : 'en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            <Button
              onClick={() => router.push('/analytics/trades')}
              className="inline-flex items-center gap-2 rounded-lg shadow-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white"
            >
              <BarChart3 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('analytics.trades.analyzeHistory', 'Analyze Trade History')}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('common.refresh')}
            </Button>
          </div>
        </motion.div>

        {/* Main Content Grid: 70% Left, 30% Right */}
        <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 mb-8">
          {/* Left Column - 70% */}
          <div className="space-y-6">
            {/* Portfolio Summary Cards */}
            {/* Summary cards moved to dashboard */}

            {/* Meme Coin Risk Alert */}
            {/* Quick Alerts moved to dashboard */}

            {/* AI Portfolio Advisor */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <PortfolioAIAdvisor portfolioData={portfolioData} />
              </motion.div>

            {/* Trading Journal Module is available in /analytics/trades */}

            {/* Institutional benchmarking moved below account breakdown in right column */}



          </div>

          {/* Right Column - 30% */}
          <div className="space-y-6">
            {/* My Wallet & Donut Chart - First */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-2">{t('portfolio.myWallet')}</CardTitle>
                  <div className="mt-2 overflow-hidden min-w-0">
                    <motion.div
                      key={totalValue}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-[var(--foreground)] mb-1 overflow-x-auto whitespace-nowrap"
                      style={{ maxWidth: '100%' }}
                      title={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
                    >
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </motion.div>
                    <p className="text-[var(--text-muted)] text-xs mt-1">{allAssets.length} {t('portfolio.assets')}</p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <PortfolioDonutChart
                    assets={donutChartData}
                    totalValue={totalValue}
                    height={200}
                  />
                </CardContent>
              </Card>
            </motion.div>

            {/* Account Breakdown - Second (List of Assets with percentages) */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="w-full"
            >
              <Card className="bg-[var(--card-bg)] border-[var(--card-border)] w-full overflow-hidden transition-colors">
                <CardHeader className="pb-4 px-4 sm:px-6">
                  <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-1">{t('portfolio.accountBreakdown')}</CardTitle>
                      <CardDescription className="text-[var(--text-muted)] text-xs">
                        {t('portfolio.distribution')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 px-4 sm:px-6 pb-4 overflow-x-hidden">
                  {allAssets.length > 0 ? (
                    <div className="space-y-1.5 w-full">
                      {allAssets
                        .filter(asset => asset.valueUSD && asset.valueUSD > 0) // Only show assets with value > 0 and valid valueUSD
                        .map(asset => {
                          // Calculate percentage - ensure we only use real data from API
                          const percentage = totalValue > 0 && asset.valueUSD 
                            ? (asset.valueUSD / totalValue) * 100 
                            : 0;
                          
                          return {
                            ...asset,
                            percentage: percentage // Keep original percentage for formatting
                          };
                        })
                        .sort((a, b) => b.valueUSD - a.valueUSD)
                        .map((asset, index) => {
                          const colors = ['#ec4899', '#3b82f6', '#f59e0b', '#10b981'];
                          const color = colors[index % colors.length];
                          // Format percentage with 3 decimal places
                          const formattedPercentage = asset.percentage.toFixed(3);
                          return (
                            <div
                              key={asset.id}
                              className="flex items-center gap-2 p-2 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] hover:border-[var(--primary)] transition-colors w-full max-w-full overflow-hidden"
                            >
                              <div 
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <div className="flex-1 min-w-0 overflow-hidden">
                                <div className="text-xs font-medium text-[var(--foreground)] truncate">
                                  {asset.symbol}
                                </div>
                              </div>
                              <div className="flex-shrink-0 ml-2">
                                <div className="text-xs font-semibold text-[#9ca3af] whitespace-nowrap">
                                  {formattedPercentage}%
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {/* Spot percentage at bottom if available */}
                      {portfolioData?.livePortfolio?.accounts?.spot && (
                        <div className="pt-2 mt-2 border-t border-[#252b3b]">
                          <div className="flex items-center justify-between w-full">
                            <span className="text-xs font-medium text-[#e5e7eb]">{t('portfolio.spot')}</span>
                            <span className="text-xs font-semibold text-[#9ca3af] whitespace-nowrap">
                              {portfolioData.livePortfolio.accounts.spot.percent.toFixed(3)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[var(--text-muted)]">
                      <p className="mb-3 text-sm">{t('portfolio.noAssets')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Institutional benchmarking removed for now */}
          </div>
        </div>
      </main>
    </div>
  );
}
