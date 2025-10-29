'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortfolioAsset } from './PortfolioAssetCard';

interface PortfolioDistributionProps {
  assets: PortfolioAsset[];
  totalValue: number;
}

export function PortfolioDistribution({ assets, totalValue }: PortfolioDistributionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  // Sort assets by value (highest first)
  const sortedAssets = [...assets].sort((a, b) => b.valueUSD - a.valueUSD);

  // Calculate distribution percentages
  const assetsWithPercentage = sortedAssets.map(asset => ({
    ...asset,
    percentage: totalValue > 0 ? (asset.valueUSD / totalValue) * 100 : 0,
  }));

  // Group by tier
  const tierGroups = assetsWithPercentage.reduce((groups, asset) => {
    if (!groups[asset.tier]) {
      groups[asset.tier] = [];
    }
    groups[asset.tier].push(asset);
    return groups;
  }, {} as Record<string, typeof assetsWithPercentage>);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'CORE':
        return 'bg-blue-500';
      case 'SATELLITE':
        return 'bg-green-500';
      case 'SPECULATIVE':
        return 'bg-yellow-500';
      case 'STRATEGIC_RESERVE':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTierLabel = (tier: string) => {
    return tier.replace('_', ' ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Asset Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assetsWithPercentage.slice(0, 8).map((asset, index) => (
              <div key={asset.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{asset.symbol}</span>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatCurrency(asset.valueUSD)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(asset.percentage)}
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${getTierColor(asset.tier)}`}
                    style={{ width: `${Math.max(asset.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
            {assetsWithPercentage.length > 8 && (
              <div className="text-center text-sm text-gray-500">
                +{assetsWithPercentage.length - 8} more assets
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tier Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio by Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(tierGroups).map(([tier, tierAssets]) => {
              const tierValue = tierAssets.reduce((sum, asset) => sum + asset.valueUSD, 0);
              const tierPercentage = totalValue > 0 ? (tierValue / totalValue) * 100 : 0;
              
              return (
                <div key={tier} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      {getTierLabel(tier)}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatCurrency(tierValue)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPercentage(tierPercentage)}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getTierColor(tier)}`}
                      style={{ width: `${Math.max(tierPercentage, 2)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    {tierAssets.length} asset{tierAssets.length !== 1 ? 's' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
