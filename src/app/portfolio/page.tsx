'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { PortfolioSummary, PortfolioSummary as PortfolioSummaryType } from '@/components/PortfolioSummary';
import { PortfolioAssetCard, PortfolioAsset } from '@/components/PortfolioAssetCard';
import { PortfolioDistribution } from '@/components/PortfolioDistribution';
import { portfolioApi } from '@/lib/api';
import { RefreshCw, TrendingUp, AlertCircle, ExternalLink } from 'lucide-react';

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
}

export default function PortfolioPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadPortfolio();
    }
  }, [user]);

  const loadPortfolio = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await portfolioApi.getPortfolio();
      setPortfolioData(response.data);
    } catch (error) {
      console.error('Failed to load portfolio:', error);
      setError('Failed to load portfolio data');
    } finally {
      setIsLoading(false);
    }
  };

  const syncPortfolio = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await portfolioApi.syncPortfolio();
      await loadPortfolio(); // Reload portfolio after sync
    } catch (error) {
      console.error('Failed to sync portfolio:', error);
      setError('Failed to sync portfolio from exchanges');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="portfolio" />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>Error Loading Portfolio</span>
              </CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={loadPortfolio} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation currentPage="portfolio" />
        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Portfolio Data</CardTitle>
              <CardDescription>
                Connect exchanges to start tracking your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/exchanges')} 
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Exchanges
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="portfolio" />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="mt-2 text-gray-600">
              Track your cryptocurrency investments across {portfolioData.connectedExchanges?.length || 0} exchange(s)
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={loadPortfolio}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={syncPortfolio}
              disabled={isRefreshing || (portfolioData.connectedExchanges?.length || 0) === 0}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Sync from Exchanges
            </Button>
          </div>
        </div>

        {/* Portfolio Summary */}
        {portfolioData.summary && (
          <PortfolioSummary
            summary={portfolioData.summary}
            lastUpdated={portfolioData.portfolio?.lastUpdated}
            onRefresh={syncPortfolio}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Connected Exchanges */}
        {(portfolioData.connectedExchanges?.length || 0) > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connected Exchanges</CardTitle>
              <CardDescription>
                Your portfolio data is synced from these exchanges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {(portfolioData.connectedExchanges || []).map((exchange) => (
                  <div
                    key={exchange}
                    className="flex items-center space-x-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg border border-green-200"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium capitalize">{exchange}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio Distribution */}
        {(portfolioData.portfolio?.assets?.length || 0) > 0 && portfolioData.portfolio && (
          <div className="mb-8">
            <PortfolioDistribution
              assets={portfolioData.portfolio.assets}
              totalValue={portfolioData.portfolio.totalValueUSD}
            />
          </div>
        )}

        {/* Assets List */}
        {(portfolioData.portfolio?.assets?.length || 0) > 0 && portfolioData.portfolio ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioData.portfolio.assets.map((asset) => (
                <PortfolioAssetCard key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Assets Found</CardTitle>
              <CardDescription>
                Your portfolio is empty. Connect exchanges and sync your data to see your assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button onClick={() => router.push('/exchanges')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Exchanges
                </Button>
                <Button variant="outline" onClick={syncPortfolio}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
