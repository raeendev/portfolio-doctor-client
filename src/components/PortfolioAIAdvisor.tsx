'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { portfolioApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface PortfolioAIAdvisorProps {
  portfolioData?: any;
}

interface AIAnalysis {
  overallAssessment: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  strengths: string[];
  concerns: string[];
  nextSteps: string[];
}

export function PortfolioAIAdvisor({ portfolioData }: PortfolioAIAdvisorProps) {
  const { t, isRTL } = useLanguage();
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Chat removed per requirements

  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!portfolioData) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await portfolioApi.getAIAnalysis();
        if (response?.data) {
          const d: any = response.data;
          const normalized: AIAnalysis = {
            overallAssessment: d.overallAssessment || d.summary?.note || '',
            recommendations: Array.isArray(d.recommendations) ? d.recommendations : [],
            riskLevel: (d.riskLevel === 'low' || d.riskLevel === 'high' || d.riskLevel === 'medium') ? d.riskLevel : 'medium',
            strengths: Array.isArray(d.strengths) ? d.strengths : [],
            concerns: Array.isArray(d.concerns) ? d.concerns : (Array.isArray(d.insights) ? d.insights : []),
            nextSteps: Array.isArray(d.nextSteps) ? d.nextSteps : [],
          };
          setAnalysis(normalized);
        } else {
          setAnalysis(null);
        }
      } catch (err: any) {
        // Fallback: if endpoint is not available yet, generate client-side analysis
        if (err?.response?.status === 404) {
          try {
            const totalValue = portfolioData?.livePortfolio?.totalValueUSD || portfolioData?.portfolio?.totalValueUSD || 0;
            const totalPnl = portfolioData?.portfolio?.unrealizedPnl || 0;
            const totalPnlPercent = portfolioData?.portfolio?.unrealizedPnlPercent || 0;
            const assets = portfolioData?.livePortfolio?.assets || portfolioData?.portfolio?.assets || [];

            const assetCount = assets.length;
            const diversificationScore = assetCount >= 5 ? 'good' : assetCount >= 3 ? 'moderate' : 'low';
            const isProfitable = totalPnl >= 0;

            const localAnalysis: AIAnalysis = {
              overallAssessment: generateOverallAssessment(t, totalValue, totalPnlPercent, diversificationScore, isProfitable),
              recommendations: generateRecommendations(t, assets, totalPnlPercent, diversificationScore),
              riskLevel: calculateRiskLevel(assets, totalPnlPercent),
              strengths: [],
              concerns: generateConcerns(t, assets, totalPnlPercent, diversificationScore),
              nextSteps: [],
            };
            setAnalysis(localAnalysis);
          } catch (fallbackErr) {
            setError(t('aiAdvisor.error'));
            console.error('AI Analysis Fallback Error:', fallbackErr);
          }
        } else {
          setError(t('aiAdvisor.error'));
          console.error('AI Analysis Error:', err);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAIAnalysis();
  }, [portfolioData, t]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-[#10b981]';
      case 'medium':
        return 'text-[#f59e0b]';
      case 'high':
        return 'text-[#ef4444]';
      default:
        return 'text-[#9ca3af]';
    }
  };

  const getRiskBg = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-[#10b981]/20 border-[#10b981]';
      case 'medium':
        return 'bg-[#f59e0b]/20 border-[#f59e0b]';
      case 'high':
        return 'bg-[#ef4444]/20 border-[#ef4444]';
      default:
        return 'bg-[#9ca3af]/20 border-[#9ca3af]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Analysis Card */}
      <Card className="bg-gradient-to-br from-[var(--gradient-start)] to-[var(--gradient-end)] border-[var(--card-border)] transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-[#3b82f6]" />
              <CardTitle className="text-[var(--foreground)] text-lg font-semibold">{t('aiAdvisor.title')}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {isLoading && (
                <Loader2 className="h-4 w-4 text-[#3b82f6] animate-spin" />
              )}
            </div>
          </div>
          <CardDescription className="text-[var(--text-muted)] text-xs mt-1">
            {t('aiAdvisor.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-[#3b82f6] animate-spin mx-auto mb-2" />
              <p className="text-sm text-[var(--text-muted)]">{t('aiAdvisor.analyzing')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-[#ef4444]/20 border border-[#ef4444] rounded-lg">
            <p className="text-xs text-[#ef4444]">{error}</p>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="space-y-4">
            {/* Overall Assessment */}
            <div className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${analysis.riskLevel === 'low' ? 'bg-[#10b981]' : analysis.riskLevel === 'medium' ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-[var(--foreground)] mb-2">{t('aiAdvisor.overallAssessment')}</h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {analysis.overallAssessment}
                  </p>
                </div>
              </div>
              <div className={`mt-3 px-3 py-1.5 rounded border inline-block ${getRiskBg(analysis.riskLevel)}`}>
                  <span className={`text-xs font-medium ${getRiskColor(analysis.riskLevel)}`}>
                  {t('aiAdvisor.riskLevel')}: {analysis.riskLevel === 'low' ? t('common.low') : analysis.riskLevel === 'medium' ? t('common.medium') : t('common.high')}
                </span>
              </div>
            </div>

            {/* Concerns */}
            {Array.isArray(analysis.concerns) && analysis.concerns.length > 0 && (
              <div className="p-4 bg-[var(--input-bg)] rounded-lg border border-[var(--card-border)] transition-colors">
                <div className="flex items-center space-x-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-[#f59e0b]" />
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">{t('aiAdvisor.concerns')}</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.concerns.map((concern, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-[var(--warning)] text-xs mt-1">•</span>
                      <span className="text-xs text-[var(--text-muted)] flex-1">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-[#3b82f6]/10 to-[#8b5cf6]/10 rounded-lg border border-[#3b82f6]/30">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-[#3b82f6]" />
                  <h4 className="text-sm font-semibold text-[var(--foreground)]">{t('aiAdvisor.recommendations')}</h4>
                </div>
                <ul className="space-y-2">
                  {analysis.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-[var(--primary)] text-xs mt-1">→</span>
                      <span className="text-xs text-[var(--foreground)] flex-1">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

        </CardContent>
      </Card>

      {/* Chat removed */}
    </div>
  );
}

// Helper functions to generate AI analysis
function generateOverallAssessment(
  t: (key: string, params?: any) => string,
  totalValue: number,
  totalPnlPercent: number,
  diversificationScore: string,
  isProfitable: boolean
): string {
  const parts = [];
  
  if (totalValue > 0) {
    if (isProfitable && totalPnlPercent > 10) {
      parts.push(t('aiAdvisor.performingWell', { percent: totalPnlPercent.toFixed(2) }));
    } else if (isProfitable) {
      parts.push(t('aiAdvisor.inProfit', { percent: totalPnlPercent.toFixed(2) }));
    } else {
      parts.push(t('aiAdvisor.currentlyDown', { percent: Math.abs(totalPnlPercent).toFixed(2) }));
    }

    if (diversificationScore === 'good') {
      parts.push(t('aiAdvisor.excellentDiversification'));
    } else if (diversificationScore === 'moderate') {
      parts.push(t('aiAdvisor.moderateDiversification'));
    } else {
      parts.push(t('aiAdvisor.limitedDiversification'));
    }
  } else {
    parts.push(t('aiAdvisor.portfolioEmpty'));
  }

  return parts.join(' ');
}

function generateRecommendations(
  t: (key: string, params?: any) => string,
  assets: any[],
  totalPnlPercent: number,
  diversificationScore: string
): string[] {
  const recommendations: string[] = [];

  if (diversificationScore === 'low' && assets.length < 3) {
    recommendations.push(t('aiAdvisor.considerDiversifying'));
  }

  if (totalPnlPercent < -10) {
    recommendations.push(t('aiAdvisor.reviewLosingPositions'));
  }

  if (totalPnlPercent > 20) {
    recommendations.push(t('aiAdvisor.considerPartialProfits'));
  }

  const topAsset = assets.length > 0 
    ? assets.sort((a, b) => (b.valueUSD || 0) - (a.valueUSD || 0))[0]
    : null;
  
  if (topAsset && topAsset.valueUSD > 0) {
    const topPercent = assets.reduce((sum, a) => sum + (a.valueUSD || 0), 0) > 0
      ? ((topAsset.valueUSD || 0) / assets.reduce((sum, a) => sum + (a.valueUSD || 0), 0)) * 100
      : 0;
    
    if (topPercent > 50) {
      recommendations.push(t('aiAdvisor.heavilyConcentrated', { symbol: topAsset.symbol, percent: topPercent.toFixed(1) }));
    }
  }

  if (assets.length === 0) {
    recommendations.push(t('aiAdvisor.connectExchanges'));
  }

  return recommendations;
}

function calculateRiskLevel(assets: any[], totalPnlPercent: number): 'low' | 'medium' | 'high' {
  if (assets.length === 0) return 'medium';
  
  const assetCount = assets.length;
  const isProfitable = totalPnlPercent >= 0;
  
  if (assetCount >= 5 && isProfitable) return 'low';
  if (assetCount >= 3 && isProfitable) return 'medium';
  if (assetCount < 3) return 'high';
  if (totalPnlPercent < -20) return 'high';
  
  return 'medium';
}

function generateConcerns(
  t: (key: string, params?: any) => string,
  assets: any[],
  totalPnlPercent: number,
  diversificationScore: string
): string[] {
  const concerns: string[] = [];

  if (diversificationScore === 'low') {
    concerns.push(t('aiAdvisor.limitedDiversificationRisk'));
  }

  if (totalPnlPercent < -15) {
    concerns.push(t('aiAdvisor.significantLosses'));
  }

  if (assets.length === 0) {
    concerns.push(t('aiAdvisor.noAssetsDetected'));
  }

  return concerns;
}


