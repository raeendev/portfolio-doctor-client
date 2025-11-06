'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle, Target, Loader2 } from 'lucide-react';
import { portfolioApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AllocationTarget {
  tier: 'CORE' | 'SATELLITE' | 'SPECULATIVE' | 'STRATEGIC_RESERVE';
  currentPercentage: number;
  targetPercentage: number;
  deviation: number;
  valueUSD: number;
}

interface AllocationAnalysis {
  riskProfile: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
  currentAllocation: AllocationTarget[];
  targetAllocation: AllocationTarget[];
  overallDeviation: number;
  isWellBalanced: boolean;
  recommendations: string[];
  rebalancingActions: Array<{
    action: 'increase' | 'decrease';
    tier: string;
    current: number;
    target: number;
    suggestedAdjustment: number;
  }>;
}

interface PortfolioAllocationAnalysisProps {
  assets?: Array<{
    symbol: string;
    valueUSD: number;
    tier: 'CORE' | 'SATELLITE' | 'SPECULATIVE' | 'STRATEGIC_RESERVE';
  }>;
  totalValue: number;
}

export function PortfolioAllocationAnalysis({ assets = [], totalValue }: PortfolioAllocationAnalysisProps) {
  const { t, isRTL } = useLanguage();
  const [analysis, setAnalysis] = useState<AllocationAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (assets.length > 0 && totalValue > 0) {
      fetchAllocationAnalysis();
    }
  }, [assets, totalValue]);

  const fetchAllocationAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await portfolioApi.getAllocationAnalysis();
      if (response.data) {
        setAnalysis(response.data);
      } else {
        setAnalysis(null);
      }
    } catch (err: any) {
      setError(t('allocationAnalysis.error', 'Failed to load allocation analysis'));
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };


  const generateRecommendations = (
    allocation: AllocationTarget[],
    deviation: number
  ): string[] => {
    const recommendations: string[] = [];

    if (deviation > 15) {
      recommendations.push(t('allocationAnalysis.significantDeviation'));
    }

    const coreDeviation = allocation.find(a => a.tier === 'CORE')?.deviation || 0;
    if (Math.abs(coreDeviation) > 10) {
      if (coreDeviation > 0) {
        recommendations.push(t('allocationAnalysis.coreOverAllocated', { percent: Math.abs(coreDeviation).toFixed(1) }));
      } else {
        recommendations.push(t('allocationAnalysis.coreUnderAllocated', { percent: Math.abs(coreDeviation).toFixed(1) }));
      }
    }

    const speculative = allocation.find(a => a.tier === 'SPECULATIVE');
    if (speculative && speculative.currentPercentage > 30) {
      recommendations.push(t('allocationAnalysis.highSpeculativeExposure'));
    }

    if (allocation.filter(a => a.currentPercentage === 0 && a.targetPercentage > 0).length > 0) {
      recommendations.push(t('allocationAnalysis.missingTiers'));
    }

    return recommendations;
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CORE':
        return 'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30';
      case 'SATELLITE':
        return 'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30';
      case 'SPECULATIVE':
        return 'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30';
      case 'STRATEGIC_RESERVE':
        return 'bg-[#8b5cf6]/20 text-[#a78bfa] border-[#8b5cf6]/30';
      default:
        return 'bg-[#6b7280]/20 text-[#9ca3af] border-[#6b7280]/30';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[#1a1f2e] to-[#252b3b] border-[#252b3b]">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 text-[#3b82f6] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!analysis) return null;

  return (
    <Card className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] border-[var(--card-border)] transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-[#3b82f6]" />
            <CardTitle className="text-[var(--foreground)] text-lg font-semibold">{t('allocationAnalysis.title')}</CardTitle>
          </div>
          <Badge
            className={`${
              analysis.isWellBalanced
                ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]'
                : 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]'
            } border`}
          >
            {analysis.riskProfile === 'CONSERVATIVE' 
              ? t('allocationAnalysis.riskProfileConservative')
              : analysis.riskProfile === 'BALANCED'
              ? t('allocationAnalysis.riskProfileBalanced')
              : t('allocationAnalysis.riskProfileAggressive')}
          </Badge>
        </div>
        <CardDescription className="text-[var(--text-muted)] text-xs mt-1">
          {t('allocationAnalysis.targetAllocation')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${
          analysis.isWellBalanced
            ? 'bg-[#10b981]/10 border-[#10b981]/30'
            : 'bg-[#f59e0b]/10 border-[#f59e0b]/30'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            {analysis.isWellBalanced ? (
              <CheckCircle className="h-4 w-4 text-[#10b981]" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
            )}
            <h4 className="text-sm font-semibold text-[var(--foreground)]">
              {analysis.isWellBalanced ? t('allocationAnalysis.wellBalanced') : t('allocationAnalysis.needsRebalancing')}
            </h4>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {t('allocationAnalysis.overallDeviation', { percent: analysis.overallDeviation.toFixed(1) })}
          </p>
        </div>

        {/* Allocation Comparison */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-[var(--foreground)]">{t('allocationAnalysis.currentVsTarget')}</h4>
          {analysis.currentAllocation.map((item, index) => {
            const isOverTarget = item.deviation > 5;
            const isUnderTarget = item.deviation < -5;
            const isAligned = Math.abs(item.deviation) <= 5;

            return (
              <motion.div
                key={item.tier}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getTierColor(item.tier)} border text-xs`}>
                      {item.tier.replace('_', ' ')}
                    </Badge>
                    {isOverTarget && (
                      <span className="text-xs text-[var(--danger)]">↑ {t('allocationAnalysis.overAllocated')}</span>
                    )}
                    {isUnderTarget && (
                      <span className="text-xs text-[var(--warning)]">↓ {t('allocationAnalysis.underAllocated')}</span>
                    )}
                    {isAligned && (
                      <span className="text-xs text-[var(--success)]">✓ {t('allocationAnalysis.aligned')}</span>
                    )}
                  </div>
                </div>

                {/* Percentage Bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">{t('allocationAnalysis.current')}</span>
                      <span className="text-[var(--foreground)] font-medium">
                        {item.currentPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--card-bg)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(item.currentPercentage, 100)}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full ${
                          isOverTarget ? 'bg-[var(--danger)]' : isUnderTarget ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">{t('allocationAnalysis.target')}</span>
                      <span className="text-[var(--foreground)] font-medium">
                        {item.targetPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-[var(--card-bg)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)]/30"
                        style={{ width: `${Math.min(item.targetPercentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {item.valueUSD > 0 && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {t('allocationAnalysis.value')}: {formatCurrency(item.valueUSD)}
                    </p>
                  )}

                  {Math.abs(item.deviation) > 5 && (
                    <p className={`text-xs mt-1 ${
                      item.deviation > 0 ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                    }`}>
                      {t('allocationAnalysis.deviation')}: {item.deviation > 0 ? '+' : ''}{item.deviation.toFixed(1)}%
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Rebalancing Actions */}
        {analysis.rebalancingActions.length > 0 && (
          <div className="p-4 bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10 rounded-lg border border-[#3b82f6]/30">
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-4 w-4 text-[#3b82f6]" />
              <h4 className="text-sm font-semibold text-[var(--foreground)]">{t('allocationAnalysis.suggestedActions')}</h4>
            </div>
            <div className="space-y-2">
              {analysis.rebalancingActions.map((action, index) => (
                <div key={index} className="p-2 bg-[var(--input-bg)] rounded border border-[var(--card-border)] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-muted)]">
                      {action.action === 'increase' ? `↑ ${t('allocationAnalysis.increase')}` : `↓ ${t('allocationAnalysis.decrease')}`}{' '}
                      <span className="text-[var(--foreground)] font-medium">{action.tier}</span>
                    </span>
                    <span className="text-xs font-semibold text-[var(--primary)]">
                      {action.suggestedAdjustment.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {t('allocationAnalysis.from')} {action.current.toFixed(1)}% {t('allocationAnalysis.to')} {action.target.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}

