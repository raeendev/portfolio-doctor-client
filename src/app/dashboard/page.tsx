'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Plus, ExternalLink, CheckCircle, PieChart } from 'lucide-react';
import { exchangesApi } from '@/lib/api';
import { Navigation } from '@/components/Navigation';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadConnectedExchanges();
    }
  }, [user]);

  const loadConnectedExchanges = async () => {
    try {
      const response = await exchangesApi.getConnectedExchanges();
      setConnectedExchanges(response.data.exchanges);
    } catch (error) {
      console.error('Failed to load connected exchanges:', error);
    } finally {
      setIsLoadingExchanges(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="mt-2 text-gray-600">
            Manage your cryptocurrency portfolio and track your investments
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                +0.00% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+$0.00</div>
              <p className="text-xs text-muted-foreground">
                +0.00% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{connectedExchanges.length}</div>
              <p className="text-xs text-muted-foreground">
                Across {connectedExchanges.length} exchanges
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                Complete risk assessment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Connected Exchanges */}
        {connectedExchanges.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Connected Exchanges</CardTitle>
              <CardDescription>
                Your currently connected exchange accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {connectedExchanges.map((exchange) => (
                  <div
                    key={exchange}
                    className="flex items-center space-x-2 bg-green-50 text-green-800 px-3 py-2 rounded-lg border border-green-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium capitalize">{exchange}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>View Portfolio</CardTitle>
              <CardDescription>
                Track your cryptocurrency investments and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => router.push('/portfolio')}
              >
                <PieChart className="h-4 w-4 mr-2" />
                View Portfolio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Exchanges</CardTitle>
              <CardDescription>
                {connectedExchanges.length > 0 
                  ? `Manage your ${connectedExchanges.length} connected exchange(s)`
                  : 'Link your exchange accounts to start tracking your portfolio'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => router.push('/exchanges')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {connectedExchanges.length > 0 ? 'Manage Exchanges' : 'Add Exchange'}
                </Button>
                {connectedExchanges.length > 0 && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={loadConnectedExchanges}
                    disabled={isLoadingExchanges}
                  >
                    {isLoadingExchanges ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        Refreshing...
                      </>
                    ) : (
                      'Refresh Status'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
              <CardDescription>
                Complete your risk profile to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Start Assessment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>
              Your portfolio performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No data available. Connect an exchange to see your portfolio performance.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
