'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Plus, ExternalLink, CheckCircle, PieChart, Wallet } from 'lucide-react';
import { exchangesApi, portfolioApi } from '@/lib/api';
import { Navigation } from '@/components/Navigation';
import { PortfolioLineChart } from '@/components/PortfolioLineChart';
import { MarketOverview } from '@/components/MarketOverview';
import { PortfolioDonutChart } from '@/components/PortfolioDonutChart';
import { MemeCoinRiskAlert } from '@/components/MemeCoinRiskAlert';
import { useLanguage } from '@/contexts/LanguageContext';

interface PortfolioData {
  portfolio?: {
    id: string;
    totalValueUSD: number;
    totalPnl: number;
    totalPnlPercent: number;
  };
  livePortfolio?: {
    totalValueUSD: number;
    assets: any[];
  };
  connectedExchanges?: string[];
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(true);
  const [timeRange, setTimeRange] = useState<'7D' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('7D');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadConnectedExchanges();
      loadPortfolio();
    }
  }, [user]);

  const loadConnectedExchanges = async () => {
    try {
      const response = await exchangesApi.getConnectedExchanges();
      const exchanges = response.data.exchanges.map((ex: any) => 
        typeof ex === 'string' ? ex : ex.exchange || ex
      );
      setConnectedExchanges(exchanges);
    } catch (error) {
      console.error('Failed to load connected exchanges:', error);
      setConnectedExchanges([]);
    } finally {
      setIsLoadingExchanges(false);
    }
  };

  const loadPortfolio = useCallback(async () => {
    try {
      setIsLoadingPortfolio(true);
      const response = await portfolioApi.getPortfolio();
      setPortfolioData(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, []);

  const totalValue = portfolioData?.livePortfolio?.totalValueUSD || portfolioData?.portfolio?.totalValueUSD || 0;
  const allAssets = (portfolioData?.livePortfolio?.assets || portfolioData?.portfolio?.assets || []).map((asset: any) => ({
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

  const donutChartData = useMemo(() => {
    if (!Array.isArray(allAssets) || allAssets.length === 0) return [] as any[];
    const sortedAssets = [...allAssets].sort((a, b) => b.valueUSD - a.valueUSD).slice(0, 4);
    const total = sortedAssets.reduce((sum, asset) => sum + (asset.valueUSD || 0), 0) || totalValue;
    return sortedAssets.map((asset, index) => ({
      symbol: asset.symbol,
      value: asset.valueUSD,
      percentage: total > 0 ? (asset.valueUSD / total) * 100 : 0,
      color: ['#ec4899', '#3b82f6', '#10b981', '#f59e0b'][index % 4],
    }));
  }, [allAssets, totalValue]);

  // Prepare chart data - Use real data from API if available, otherwise show current value
  const chartData = useMemo(() => {
    if (totalValue === 0) {
      return [];
    }
    
    // Since we don't have historical data from API, show current value
    // Create a simple representation with current value repeated for visualization
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: totalValue, // Use current value since historical data is not available
      });
    }
    return days;
  }, [totalValue]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <motion.div
          className="rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-[var(--foreground)]">{t('dashboard.title')}</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            {t('dashboard.subtitle')}
          </p>
        </motion.div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--foreground)]">{t('dashboard.totalPortfolioValue')}</CardTitle>
                <DollarSign className="h-4 w-4 text-[var(--text-muted)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--foreground)]">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {connectedExchanges.length} {t('dashboard.exchanges')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--foreground)]">{t('dashboard.totalPnL')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-[var(--text-muted)]" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(portfolioData?.portfolio?.totalPnlPercent || 0) >= 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'}`}>
                  {(portfolioData?.portfolio?.totalPnlPercent || 0) >= 0 ? '+' : ''}
                  {(portfolioData?.portfolio?.totalPnlPercent || 0).toFixed(2)}%
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  ${(portfolioData?.portfolio?.totalPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--foreground)]">{t('dashboard.activeExchanges')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-[var(--text-muted)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--foreground)]">{connectedExchanges.length}</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t('dashboard.connectedExchanges')}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--foreground)]">{t('dashboard.riskScore')}</CardTitle>
                <TrendingDown className="h-4 w-4 text-[var(--text-muted)]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[var(--foreground)]">-</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {t('dashboard.completeAssessment')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Wallet Balance Chart and Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wallet Balance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="text-[var(--foreground)] flex items-center mb-2 font-semibold">
                      <Wallet className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-[var(--primary)]`} />
                      {t('portfolio.walletBalance')}
                    </CardTitle>
                    <motion.div
                      key={totalValue}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-3xl font-bold text-[var(--success)] overflow-x-auto whitespace-nowrap"
                      style={{ maxWidth: '100%' }}
                      title={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
                    >
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                    </motion.div>
                  </div>
                  <div className="flex space-x-2 flex-wrap">
                    {(['7D', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
                      <Button
                        key={range}
                        variant={timeRange === range ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTimeRange(range)}
                        className={
                          timeRange === range
                            ? 'bg-[#3b82f6] hover:bg-[#2563eb] text-white'
                            : 'bg-transparent border-[var(--card-border)] text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]'
                        }
                      >
                        {range}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mt-4">
                  {chartData.length > 0 ? (
                    <PortfolioLineChart data={chartData} height={350} />
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-[var(--text-muted)]">
                      <div className="text-center">
                        <p className="text-sm mb-2">{t('portfolio.noPortfolioData')}</p>
                        <p className="text-xs">{t('portfolio.connectExchangesToSeeChart')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Market Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <MarketOverview />
          </motion.div>
        </div>

        {/* Interactive Distribution Charts (Donut) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-[var(--foreground)] text-lg font-semibold mb-2">{t('portfolio.distribution')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">Top allocation by asset</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {donutChartData.length > 0 ? (
                <PortfolioDonutChart assets={donutChartData as any} totalValue={totalValue} height={240} />
              ) : (
                <div className="h-[240px] flex items-center justify-center text-[var(--text-muted)]">
                  <div className="text-center text-sm">{t('portfolio.noPortfolioData')}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <MemeCoinRiskAlert assets={allAssets} totalValue={totalValue} />
        </motion.div>

        {/* Latest Trades (placeholder) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-[var(--card-bg)] border-[var(--card-border)] h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">{t('dashboard.latestTrades', 'Latest Trades')}</CardTitle>
              <CardDescription className="text-[var(--text-muted)]">{t('dashboard.latestTradesDesc', 'Recent trade history')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-[var(--text-muted)]">{t('dashboard.noTrades', 'No trades available yet.')}</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Access removed to reduce clutter; consolidated below */}

        {/* Connected Exchanges */}
        {connectedExchanges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">{t('dashboard.connectedExchangesTitle')}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  {t('dashboard.connectedExchangesDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {connectedExchanges.map((exchange) => (
                    <div
                      key={exchange}
                      className="flex items-center space-x-2 bg-[var(--success)]/20 text-[var(--success)] px-3 py-2 rounded-lg border border-[var(--success)]/50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium capitalize">{exchange}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions - Consolidated and evenly spaced */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-stretch">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">{t('dashboard.viewPortfolio')}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  {t('dashboard.viewPortfolioDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button 
                  className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white"
                  onClick={() => router.push('/portfolio')}
                >
                  <PieChart className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('dashboard.viewPortfolio')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">{t('dashboard.manageExchanges')}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  {connectedExchanges.length > 0 
                    ? t('dashboard.manageExchangesDescription', { count: connectedExchanges.length })
                    : t('dashboard.addExchangeDescription')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white"
                    onClick={() => router.push('/exchanges')}
                  >
                    <ExternalLink className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {connectedExchanges.length > 0 ? t('dashboard.manageExchanges') : t('dashboard.addExchange')}
                  </Button>
                  {connectedExchanges.length > 0 && (
                    <Button 
                      variant="outline" 
                      className="w-full border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
                      onClick={loadConnectedExchanges}
                      disabled={isLoadingExchanges}
                    >
                      {isLoadingExchanges ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)] mr-2" />
                          {t('common.loading')}
                        </>
                      ) : (
                        t('dashboard.refreshStatus')
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">{t('dashboard.riskAssessment')}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  {t('dashboard.riskAssessmentDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button
                  className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white inline-flex items-center justify-center gap-2"
                >
                  <TrendingDown className="h-4 w-4" />
                  {t('dashboard.startAssessment')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)] transition-colors h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)]">{t('analytics.trades.title', 'Trade Analysis')}</CardTitle>
                <CardDescription className="text-[var(--text-muted)]">
                  {t('analytics.trades.subtitle', 'Sync and analyze your trading performance')}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button 
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg shadow-sm bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:from-[#1d4ed8] hover:to-[#2563eb] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563eb]"
                  onClick={() => router.push('/analytics/trades')}
                  aria-label={t('analytics.trades.analyzeAria', 'Analyze trade history')}
                >
                  <BarChart3 className="h-4 w-4" />
                  {t('analytics.trades.analyzeHistory', 'Analyze Trade History')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
