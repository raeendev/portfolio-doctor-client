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

interface SpotAssetOverview {
  symbol: string;
  quantity: number;
  free?: number;
  frozen?: number;
  priceUSD?: number | null;
  valueUSD?: number | null;
  tier?: string;
  accountType?: string;
  lastUpdated?: string;
}

interface SpotPortfolioOverview {
  exchange: string | null;
  assetCount: number;
  totalValueUSD: number;
  assets: SpotAssetOverview[];
  updatedAt?: string;
}

interface FuturesAssetOverview {
  symbol: string;
  quantity?: number;
  free?: number;
  frozen?: number;
  priceUSD?: number | null;
  valueUSD?: number | null;
  accountType?: string;
}

interface FuturesPositionOverview {
  symbol?: string;
  side?: string;
  quantity?: number;
  entryPrice?: number;
  markPrice?: number;
  leverage?: string | number | null;
  unrealizedPnl?: number;
  notionalValueUSD?: number;
}

interface FuturesPortfolioOverview {
  exchange: string | null;
  assetCount: number;
  positionCount: number;
  totalValueUSD: number;
  assets: FuturesAssetOverview[];
  positions: FuturesPositionOverview[];
  updatedAt?: string;
}

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'spot' | 'futures'>('spot');
  const [spotOverview, setSpotOverview] = useState<SpotPortfolioOverview | null>(null);
  const [futuresOverview, setFuturesOverview] = useState<FuturesPortfolioOverview | null>(null);

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
      const [portfolioResponse, spotResponse, futuresResponse] = await Promise.all([
        portfolioApi.getPortfolio(),
        portfolioApi.getSpotPortfolio(),
        portfolioApi.getFuturesPortfolio(),
      ]);

      console.log('Portfolio API Response:', {
        livePortfolio: portfolioResponse.data.livePortfolio,
        spotAssetCount: spotResponse.data?.assetCount,
        futuresAssetCount: futuresResponse.data?.assetCount,
      });

      setPortfolioData(portfolioResponse.data);
      setSpotOverview(spotResponse.data);
      setFuturesOverview(futuresResponse.data);
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

  const spotAssets = spotOverview?.assets ?? [];
  const futuresAssets = futuresOverview?.assets ?? [];
  const futuresPositions = futuresOverview?.positions ?? [];
  const spotTotalValue = spotOverview?.totalValueUSD ?? 0;
  const futuresTotalValue = futuresOverview?.totalValueUSD ?? 0;
  const combinedTotalValue = spotTotalValue + futuresTotalValue;

  const displayAssets = activeTab === 'spot' ? spotAssets : futuresAssets;
  const displayTotalValue = activeTab === 'spot' ? spotTotalValue : futuresTotalValue;

  const donutChartData = useMemo(() => {
    if (!displayAssets || displayAssets.length === 0) return [];

    const sortedAssets = [...displayAssets]
      .sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))
      .slice(0, 4);

    const total =
      displayTotalValue > 0
        ? displayTotalValue
        : sortedAssets.reduce((sum, asset) => sum + (asset.valueUSD || 0), 0);

    return sortedAssets.map((asset, index) => ({
      symbol: asset.symbol,
      value: asset.valueUSD || 0,
      percentage: total > 0 ? ((asset.valueUSD || 0) / total) * 100 : 0,
      color: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b'][index % 4],
    }));
  }, [displayAssets, displayTotalValue]);

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
          className="flex flex-col gap-4 mb-8"
        >
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2">{t('portfolio.title')}</h1>
              <p className="text-[var(--text-muted)]">
                {t('portfolio.subtitle', { count: summary.connectedExchangesCount })}
              </p>
            </div>
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
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
          </div>
          <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-start'}`}>
            <Button
              variant={activeTab === 'spot' ? 'default' : 'outline'}
              onClick={() => setActiveTab('spot')}
              className={`px-4 py-2 ${activeTab === 'spot' ? 'shadow-md' : ''}`}
            >
              {t('portfolio.spotTab', 'Spot')}
            </Button>
            <Button
              variant={activeTab === 'futures' ? 'default' : 'outline'}
              onClick={() => setActiveTab('futures')}
              className={`px-4 py-2 ${activeTab === 'futures' ? 'shadow-md' : ''}`}
            >
              {t('portfolio.futuresTab', 'Futures')}
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
            {activeTab === 'spot' && (
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
              >
                <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-1">
                      {t('portfolio.spotAssetsTitle', 'Spot Assets')}
                    </CardTitle>
                    <CardDescription className="text-[var(--text-muted)] text-xs">
                      {t('portfolio.spotAssetsDesc', 'Breakdown of your available spot balances')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {spotAssets.length > 0 ? (
                      spotAssets
                        .filter((asset) => (asset.valueUSD || 0) > 0 || (asset.quantity || 0) > 0)
                        .sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))
                        .map((asset) => (
                          <div
                            key={`spot-${asset.symbol}`}
                            className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium text-[var(--foreground)]">{asset.symbol}</div>
                              <div className="text-xs text-[var(--text-muted)]">
                                {t('portfolio.quantityLabel', 'Quantity')}: {(asset.quantity || 0).toLocaleString('en-US', {
                                  maximumFractionDigits: 8,
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-[var(--text-muted)]">
                                {t('portfolio.availableLabel', 'Available')}: {(asset.free || 0).toLocaleString('en-US', {
                                  maximumFractionDigits: 8,
                                })}
                              </div>
                              <div className="text-xs font-semibold text-[var(--foreground)]">
                                ${(asset.valueUSD || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-sm text-[var(--text-muted)] py-2">
                        {t('portfolio.noSpotData', 'No spot balances detected')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'futures' && (
              <>
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-1">
                        {t('portfolio.futuresBalances', 'Futures Balances')}
                      </CardTitle>
                      <CardDescription className="text-[var(--text-muted)] text-xs">
                        {t('portfolio.futuresBalancesDesc', 'Estimated USD values based on latest tickers')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {futuresAssets.length > 0 ? (
                        futuresAssets
                          .filter((asset) => (asset.valueUSD || 0) > 0 || (asset.quantity || 0) > 0)
                          .sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))
                          .map((asset) => (
                            <div
                              key={`fut-${asset.symbol}`}
                              className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium text-[var(--foreground)]">{asset.symbol}</div>
                                <div className="text-xs text-[var(--text-muted)]">
                                  {t('portfolio.quantityLabel', 'Quantity')}: {(asset.quantity || 0).toLocaleString('en-US', {
                                    maximumFractionDigits: 8,
                                  })}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-[var(--text-muted)]">
                                  {t('portfolio.availableLabel', 'Available')}: {(asset.free || 0).toLocaleString('en-US', {
                                    maximumFractionDigits: 8,
                                  })}
                                </div>
                                <div className="text-xs font-semibold text-[var(--foreground)]">
                                  ${(asset.valueUSD || 0).toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-[var(--text-muted)] py-2">
                          {t('portfolio.noFuturesData', 'No futures balances detected')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-1">
                        {t('portfolio.futuresPositions', 'Futures Positions')}
                      </CardTitle>
                      <CardDescription className="text-[var(--text-muted)] text-xs">
                        {t('portfolio.futuresPositionsDesc', 'Open positions and unrealized P&L')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                      {futuresPositions.length > 0 ? (
                        futuresPositions.map((position, index) => (
                          <div
                            key={`position-${position.symbol}-${index}`}
                            className="rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)] px-3 py-2"
                          >
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-sm font-semibold text-[var(--foreground)]">{position.symbol}</div>
                              <span
                                className={`text-xs font-semibold ${
                                  position.side?.toUpperCase() === 'LONG' ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {position.side?.toUpperCase() === 'LONG'
                                  ? t('portfolio.positionSideLong', 'Long')
                                  : t('portfolio.positionSideShort', 'Short')}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                              <div>
                                {t('portfolio.quantityLabel', 'Quantity')}: {(position.quantity || 0).toLocaleString('en-US', {
                                  maximumFractionDigits: 4,
                                })}
                              </div>
                              <div>
                                {t('portfolio.entryPrice', 'Entry Price')}: ${(position.entryPrice || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                              <div>
                                {t('portfolio.markPrice', 'Mark Price')}: ${(position.markPrice || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                              <div>
                                {t('portfolio.notional', 'Notional Value')}: ${(position.notionalValueUSD || 0).toLocaleString('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </div>
                            </div>
                            <div className="text-xs font-semibold text-[var(--foreground)] mt-1">
                              {t('portfolio.unrealizedPnl', 'Unrealized P&L')}: ${(position.unrealizedPnl || 0).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-[var(--text-muted)] py-2">
                          {t('portfolio.noFuturesPositions', 'No open futures positions')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}

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
                  <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-2">
                    {activeTab === 'spot'
                      ? t('portfolio.spotWalletTitle', 'Spot Wallet')
                      : t('portfolio.futuresWalletTitle', 'Futures Wallet')}
                  </CardTitle>
                  <div className="mt-2 overflow-hidden min-w-0">
                    <motion.div
                      key={displayTotalValue}
                      initial={{ scale: 1.05 }}
                      animate={{ scale: 1 }}
                      className="text-2xl font-bold text-[var(--foreground)] mb-1 overflow-x-auto whitespace-nowrap"
                      style={{ maxWidth: '100%' }}
                      title={`$${displayTotalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
                    >
                      ${displayTotalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </motion.div>
                    <p className="text-[var(--text-muted)] text-xs mt-1">
                      {displayAssets.length} {t('portfolio.assets')}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <PortfolioDonutChart
                    assets={donutChartData}
                    totalValue={displayTotalValue}
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
                  {displayAssets.length > 0 ? (
                    <div className="space-y-1.5 w-full">
                      {displayAssets
                        .filter(asset => (asset.valueUSD || 0) > 0)
                        .map(asset => {
                          const percentage = displayTotalValue > 0 && asset.valueUSD
                            ? (asset.valueUSD / displayTotalValue) * 100
                            : 0;
                          return { ...asset, percentage };
                        })
                        .sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))
                        .map((asset, index) => {
                          const colors = ['#ec4899', '#3b82f6', '#f59e0b', '#10b981'];
                          const color = colors[index % colors.length];
                          const formattedPercentage = asset.percentage ? asset.percentage.toFixed(3) : '0.000';
                          return (
                            <div
                              key={`${activeTab}-${asset.symbol}-${index}`}
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
                      {combinedTotalValue > 0 && (
                        <div className="pt-2 mt-2 border-t border-[#252b3b] space-y-1 text-xs text-[#9ca3af]">
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-[#e5e7eb]">{t('portfolio.spotTab', 'Spot')}</span>
                            <span>
                              {combinedTotalValue > 0 ? ((spotTotalValue / combinedTotalValue) * 100).toFixed(3) : '0.000'}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium text-[#e5e7eb]">{t('portfolio.futuresTab', 'Futures')}</span>
                            <span>
                              {combinedTotalValue > 0 ? ((futuresTotalValue / combinedTotalValue) * 100).toFixed(3) : '0.000'}%
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
