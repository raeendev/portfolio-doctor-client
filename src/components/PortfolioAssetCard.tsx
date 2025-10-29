'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

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
  lastUpdated: string;
}

interface PortfolioAssetCardProps {
  asset: PortfolioAsset;
}

export function PortfolioAssetCard({ asset }: PortfolioAssetCardProps) {
  const isProfit = asset.unrealizedPnl >= 0;
  const isLoss = asset.unrealizedPnl < 0;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CORE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SATELLITE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SPECULATIVE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'STRATEGIC_RESERVE':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${formatNumber(percent, 2)}%`;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {asset.symbol.charAt(0)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{asset.symbol}</h3>
              <Badge className={getTierColor(asset.tier)}>
                {asset.tier.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">
              {formatCurrency(asset.valueUSD)}
            </div>
            <div className="text-sm text-gray-500">
              {formatNumber(asset.quantity)} {asset.symbol}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Average Price</span>
            <span className="text-sm font-medium">
              {formatCurrency(asset.averageBuyPrice)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Cost Basis</span>
            <span className="text-sm font-medium">
              {formatCurrency(asset.costBasis)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Unrealized P&L</span>
            <div className="flex items-center space-x-1">
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  isProfit ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(asset.unrealizedPnl)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">P&L %</span>
            <span
              className={`text-sm font-medium ${
                isProfit ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatPercentage(asset.unrealizedPnlPercent)}
            </span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Last updated</span>
            <span>
              {new Date(asset.lastUpdated).toLocaleDateString('en-US', {
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
  );
}
