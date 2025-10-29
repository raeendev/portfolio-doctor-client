'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw } from 'lucide-react';

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
}

export function PortfolioSummary({ 
  summary, 
  lastUpdated, 
  onRefresh, 
  isRefreshing = false 
}: PortfolioSummaryProps) {
  const isProfit = summary.totalPnl >= 0;
  const isLoss = summary.totalPnl < 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {/* Total Portfolio Value */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalValueUSD)}
          </div>
          <p className="text-xs text-muted-foreground">
            Across {summary.connectedExchangesCount} exchange(s)
          </p>
        </CardContent>
      </Card>

      {/* Total P&L */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          {isProfit ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.totalPnl)}
          </div>
          <p className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(summary.totalPnlPercent)}
          </p>
        </CardContent>
      </Card>

      {/* Total Assets */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalAssets}</div>
          <p className="text-xs text-muted-foreground">
            Different cryptocurrencies
          </p>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          <RefreshCw className={`h-4 w-4 text-muted-foreground ${isRefreshing ? 'animate-spin' : ''}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {lastUpdated ? (
              new Date(lastUpdated).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })
            ) : (
              'Never'
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {lastUpdated ? (
              new Date(lastUpdated).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            ) : (
              'No data available'
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
