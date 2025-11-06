'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PortfolioAsset {
  id: string;
  symbol: string;
  quantity: number;
  valueUSD: number;
  costBasis: number;
  averageBuyPrice: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  tier: 'CORE' | 'SATELLITE' | 'SPECULATIVE' | 'STRATEGIC_RESERVE';
  accountType?: 'SPOT' | 'FUTURES' | 'COMBINED';
  lastUpdated: string;
  isMemeCoin?: boolean;
  crashRisk?: number;
  pumpRisk?: number;
}

interface PortfolioAssetCardProps {
  asset: PortfolioAsset;
}

export function PortfolioAssetCard({ asset }: PortfolioAssetCardProps) {
  const { t, isRTL } = useLanguage();
  const isProfit = asset.unrealizedPnl >= 0;
  const isLoss = asset.unrealizedPnl < 0;

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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (num: number, symbol: string) => {
    // Determine decimal places based on asset symbol
    let decimals = 3; // Default for most cryptocurrencies
    
    // Bitcoin needs high precision (8 decimals)
    if (symbol === 'BTC' || symbol === 'BITCOIN') {
      decimals = 8;
    }
    // Stablecoins need 2 decimals (like fiat)
    else if (['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'PAXG'].includes(symbol)) {
      decimals = 2;
    }
    // Ethereum and major altcoins need 3 decimals
    else if (['ETH', 'ETHEREUM', 'BNB', 'SOL', 'ADA', 'DOT', 'MATIC', 'AVAX'].includes(symbol)) {
      decimals = 3;
    }
    // Default to 3 decimals for other cryptocurrencies
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getTierTranslationKey = (tier: string) => {
    return tier.toLowerCase().replace('_', '');
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--primary)] transition-all duration-300 overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardContent className="p-4 relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                {asset.symbol.charAt(0)}
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg text-[#e5e7eb]">{asset.symbol}</h3>
                <div className="flex space-x-2 mt-1 flex-wrap">
                  <Badge className={`${getTierColor(asset.tier)} border text-xs`}>
                    {t(`assetCard.tier.${getTierTranslationKey(asset.tier)}`)}
                  </Badge>
                  {asset.isMemeCoin && (
                    <Badge className="bg-[#ef4444]/20 text-[#ef4444] border-[#ef4444] text-xs">
                      {t('assetCard.meme')}
                    </Badge>
                  )}
                  {asset.accountType && (
                    <Badge variant="outline" className="text-xs border-[var(--card-border)] text-[var(--text-muted)] bg-[var(--input-bg)] transition-colors">
                      {t(`assetCard.accountType.${asset.accountType.toLowerCase()}`)}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <motion.div
                key={asset.valueUSD}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-lg font-semibold text-[var(--foreground)]"
              >
                {formatCurrency(asset.valueUSD)}
              </motion.div>
              <div className="text-sm text-[var(--text-muted)]">
                {formatNumber(asset.quantity, asset.symbol)} {asset.symbol}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">{t('assetCard.averagePrice')}</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {formatCurrency(asset.averageBuyPrice)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">{t('assetCard.costBasis')}</span>
              <span className="text-sm font-medium text-[var(--foreground)]">
                {formatCurrency(asset.costBasis)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">{t('assetCard.unrealizedPnL')}</span>
              <div className="flex items-center space-x-1">
                <motion.div
                  animate={{ rotate: isProfit ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isProfit ? (
                    <TrendingUp className="h-4 w-4 text-[#10b981]" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-[#ef4444]" />
                  )}
                </motion.div>
                <span
                  className={`text-sm font-medium ${
                    isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'
                  }`}
                >
                  {formatCurrency(asset.unrealizedPnl)}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-muted)]">{t('assetCard.pnlPercent')}</span>
              <span
                className={`text-sm font-medium ${
                  isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'
                }`}
              >
                {formatPercentage(asset.unrealizedPnlPercent)}
              </span>
            </div>

            {/* Meme Coin Risk Indicators */}
            {asset.isMemeCoin && (asset.crashRisk !== undefined || asset.pumpRisk !== undefined) && (
              <div className="mt-2 pt-2 border-t border-[var(--card-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">{t('assetCard.memeCoinRisk')}</span>
                </div>
                {asset.crashRisk !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--danger)]">{t('assetCard.crashRisk')}</span>
                    <span className="text-xs font-semibold text-[#ef4444]">
                      {asset.crashRisk.toFixed(1)}%
                    </span>
                  </div>
                )}
                {asset.pumpRisk !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--success)]">{t('assetCard.pumpPotential')}</span>
                    <span className="text-xs font-semibold text-[#10b981]">
                      {asset.pumpRisk.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--card-border)]">
            <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
              <span>{t('assetCard.lastUpdated')}</span>
              <span>
                {new Date(asset.lastUpdated).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
