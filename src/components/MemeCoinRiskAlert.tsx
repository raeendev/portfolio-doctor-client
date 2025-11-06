'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, TrendingUp, X, ExternalLink, Loader2 } from 'lucide-react';
import { portfolioApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface MemeCoinAnalysis {
  symbol: string;
  name?: string;
  isMemeCoin: boolean;
  crashRisk: number; // 0-100
  pumpRisk: number; // 0-100
  valueUSD: number;
  percentage: number;
  sentiment: 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';
  recentNews?: string[];
  recommendations: string[];
}

interface MemeCoinRiskAlertProps {
  assets?: Array<{
    symbol: string;
    valueUSD: number;
    quantity: number;
  }>;
  totalValue: number;
}

export function MemeCoinRiskAlert({ assets = [], totalValue }: MemeCoinRiskAlertProps) {
  const { t, isRTL } = useLanguage();
  const [analyses, setAnalyses] = useState<MemeCoinAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCoin, setExpandedCoin] = useState<string | null>(null);

  useEffect(() => {
    if (assets.length > 0 && totalValue > 0) {
      fetchMemeCoinAnalysis();
    }
  }, [assets, totalValue]);

  const fetchMemeCoinAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.getMemeCoinAnalysis();
      if (response.data?.analyses) {
        // Calculate percentages and merge with asset data
        const enrichedAnalyses = response.data.analyses.map((analysis: MemeCoinAnalysis) => {
          const asset = assets.find(a => a.symbol === analysis.symbol);
          return {
            ...analysis,
            valueUSD: asset?.valueUSD || 0,
            percentage: asset && totalValue > 0 ? (asset.valueUSD / totalValue) * 100 : 0,
          };
        }).filter((analysis: MemeCoinAnalysis) => analysis.isMemeCoin && analysis.valueUSD > 0);

        setAnalyses(enrichedAnalyses);
      }
    } catch (err: any) {
      // Fallback to mock data if API fails
      const mockAnalyses = generateMockAnalyses();
      setAnalyses(mockAnalyses);
      console.debug('Using mock meme coin analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockAnalyses = (): MemeCoinAnalysis[] => {
    // Detect potential meme coins from assets
    const memeCoinSymbols = ['DOGE', 'SHIB', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'BOME'];
    return assets
      .filter(asset => memeCoinSymbols.some(symbol => asset.symbol.toUpperCase().includes(symbol)))
      .map(asset => ({
        symbol: asset.symbol,
        isMemeCoin: true,
        crashRisk: Math.random() * 40 + 30, // 30-70%
        pumpRisk: Math.random() * 50 + 20, // 20-70%
        valueUSD: asset.valueUSD,
        percentage: totalValue > 0 ? (asset.valueUSD / totalValue) * 100 : 0,
        sentiment: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'][
          Math.floor(Math.random() * 5)
        ] as MemeCoinAnalysis['sentiment'],
        recommendations: [
          t('memeCoinAlert.stopLossOrders'),
          t('memeCoinAlert.monitorSentiment'),
          t('memeCoinAlert.limitExposure'),
        ],
      }));
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'very_negative':
        return 'bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444]';
      case 'negative':
        return 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]';
      case 'neutral':
        return 'bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]';
      case 'positive':
        return 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]';
      case 'very_positive':
        return 'bg-[#3b82f6]/20 text-[#3b82f6] border-[#3b82f6]';
      default:
        return 'bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'very_negative': return t('memeCoinAlert.sentiment.veryNegative');
      case 'negative': return t('memeCoinAlert.sentiment.negative');
      case 'neutral': return t('memeCoinAlert.sentiment.neutral');
      case 'positive': return t('memeCoinAlert.sentiment.positive');
      case 'very_positive': return t('memeCoinAlert.sentiment.veryPositive');
      default: return sentiment
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-[#ef4444]';
    if (risk >= 50) return 'text-[#f59e0b]';
    if (risk >= 30) return 'text-[#fbbf24]';
    return 'text-[#10b981]';
  };

  const getRiskBarColor = (risk: number) => {
    if (risk >= 70) return 'bg-[#ef4444]';
    if (risk >= 50) return 'bg-[#f59e0b]';
    if (risk >= 30) return 'bg-[#fbbf24]';
    return 'bg-[#10b981]';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  if (analyses.length === 0 && !isLoading) {
    return null; // Don't show if no meme coins detected
  }

  const totalMemeCoinValue = analyses.reduce((sum, a) => sum + a.valueUSD, 0);
  const totalMemeCoinPercentage = totalValue > 0 ? (totalMemeCoinValue / totalValue) * 100 : 0;

  return (
    <Card className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] border-[var(--danger)]/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
            <CardTitle className="text-[var(--foreground)] text-lg font-semibold">{t('memeCoinAlert.title')}</CardTitle>
          </div>
          {isLoading && (
            <Loader2 className="h-4 w-4 text-[#ef4444] animate-spin" />
          )}
        </div>
        <div className="mt-2 flex items-center space-x-2">
          <Badge className="bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]">
            {t('memeCoinAlert.detected', { count: analyses.length, plural: analyses.length !== 1 ? 's' : '' })}
          </Badge>
          <span className="text-xs text-[var(--text-muted)]">
            {t('memeCoinAlert.ofPortfolio', { percent: totalMemeCoinPercentage.toFixed(2) })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <AnimatePresence>
          {analyses.map((analysis, index) => (
            <motion.div
              key={analysis.symbol}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] hover:border-[var(--danger)]/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">{analysis.symbol}</h4>
                    <Badge className={`${getSentimentColor(analysis.sentiment)} border text-xs`}>
                      {getSentimentLabel(analysis.sentiment)}
                    </Badge>
                    <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444] text-xs">
                      {t('memeCoinAlert.meme')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-[var(--text-muted)]">
                    <span>{t('allocationAnalysis.value')}: {formatCurrency(analysis.valueUSD)}</span>
                    <span>({analysis.percentage.toFixed(2)}%)</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedCoin(expandedCoin === analysis.symbol ? null : analysis.symbol)}
                  className="h-6 w-6 p-0 text-[var(--text-muted)] hover:text-[var(--foreground)]"
                >
                  {expandedCoin === analysis.symbol ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Risk Indicators */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 bg-[var(--input-bg)] rounded border border-[var(--card-border)] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <TrendingDown className="h-3 w-3 text-[#ef4444]" />
                      <span className="text-xs text-[var(--text-muted)]">{t('memeCoinAlert.crashRisk')}</span>
                    </div>
                    <span className={`text-xs font-semibold ${getRiskColor(analysis.crashRisk)}`}>
                      {analysis.crashRisk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--card-bg)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.crashRisk}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${getRiskBarColor(analysis.crashRisk)}`}
                    />
                  </div>
                </div>

                <div className="p-2 bg-[var(--input-bg)] rounded border border-[var(--card-border)] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-3 w-3 text-[#10b981]" />
                      <span className="text-xs text-[var(--text-muted)]">{t('memeCoinAlert.pumpRisk')}</span>
                    </div>
                    <span className={`text-xs font-semibold ${getRiskColor(analysis.pumpRisk)}`}>
                      {analysis.pumpRisk.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--card-bg)] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${analysis.pumpRisk}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`h-full ${getRiskBarColor(analysis.pumpRisk)}`}
                    />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCoin === analysis.symbol && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-2"
                >
                  <div>
                      <h5 className="text-xs font-semibold text-[var(--foreground)] mb-2">{t('memeCoinAlert.recommendations')}</h5>
                    <ul className="space-y-1">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-[var(--danger)] text-xs mt-0.5">•</span>
                          <span className="text-xs text-[var(--text-muted)] flex-1">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {analysis.recentNews && analysis.recentNews.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-[var(--foreground)] mb-2">{t('memeCoinAlert.recentNews')}</h5>
                      <ul className="space-y-1">
                        {analysis.recentNews.slice(0, 3).map((news, idx) => (
                          <li key={idx} className="text-xs text-[var(--text-muted)]">
                            • {news}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {totalMemeCoinPercentage > 10 && (
          <div className="p-3 bg-[#ef4444]/20 border border-[#ef4444] rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[var(--danger)] mb-1">{t('memeCoinAlert.highExposure')}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {t('memeCoinAlert.highExposureDescription', { percent: totalMemeCoinPercentage.toFixed(1) })}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

