'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExchangeList, Exchange } from '@/components/ExchangeList';
import { ExchangeConnectionModal } from '@/components/ExchangeConnectionModal';
import { ImportTradeData } from '@/components/ImportTradeData';
import { exchangesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, AlertCircle, X } from 'lucide-react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function ExchangesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);

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
      // Handle response format: {exchanges: [{exchange: "...", createdAt: "..."}]}
      const exchangesData = response.data.exchanges || [];
      
      // Extract exchange names (IDs)
      const exchanges = exchangesData.map((ex: any) => 
        typeof ex === 'string' ? ex : ex.exchange || ex.id || ex
      );
      setConnectedExchanges(exchanges);
    } catch (error) {
      console.error('Failed to load connected exchanges:', error);
      setConnectedExchanges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const [connectError, setConnectError] = useState<string | null>(null);

  const handleSelectExchange = (exchange: Exchange) => {
    if (exchange.status === 'available') {
      setSelectedExchange(exchange);
    }
  };

  const handleConnectExchange = async (exchangeId: string, apiKey: string, apiSecret: string) => {
    setIsConnecting(true);
    setConnectError(null);
    try {
      await exchangesApi.connect(exchangeId, apiKey, apiSecret);
      await loadConnectedExchanges(); // Refresh connected exchanges list
      setSelectedExchange(null);
    } catch (error: any) {
      console.error('Failed to connect exchange:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to connect exchange. Please try again.';
      setConnectError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectExchange = async (exchangeId: string) => {
    try {
      await exchangesApi.disconnect(exchangeId);
      await loadConnectedExchanges(); // Refresh connected exchanges list
    } catch (error: any) {
      console.error('Failed to disconnect exchange:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to disconnect exchange. Please try again.';
      setConnectError(errorMessage);
      throw error; // Re-throw to let ExchangeList handle it
    }
  };

  const handleCloseModal = () => {
    setSelectedExchange(null);
    setConnectError(null);
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center transition-colors">
        <div className="animate-spin rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navigation currentPage="exchanges" />
      
      {/* Page Header */}
      <div className="bg-[var(--nav-bg)] border-b border-[var(--nav-border)] backdrop-blur-sm bg-opacity-95 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2 bg-transparent border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-[var(--nav-border)]" />
              <h1 className="text-xl font-semibold text-[var(--foreground)]">Exchange Management</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConnectedExchanges}
              className="flex items-center space-x-2 bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--card-hover)]"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Trade History Import & Analysis CTA */}
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <CardTitle className="text-[var(--foreground)]">Trade History Analysis</CardTitle>
            <CardDescription className="text-[var(--text-muted)]">Upload and analyze your trade history in the Analytics section</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/analytics/trades')}
              className="bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white"
            >
              Go to Trade Analysis
            </Button>
          </CardContent>
        </Card>
        
        {/* Exchange List */}
        <ExchangeList
          onSelectExchange={handleSelectExchange}
          connectedExchanges={connectedExchanges}
          onDisconnect={handleDisconnectExchange}
          onRefresh={loadConnectedExchanges}
        />
      </main>

      {/* Connection Modal */}
      <ExchangeConnectionModal
        exchange={selectedExchange}
        onClose={handleCloseModal}
        onConnect={handleConnectExchange}
        isConnecting={isConnecting}
      />
      
      {/* Error Alert */}
      {connectError && (
        <div className="fixed top-20 right-4 px-4 py-3 rounded-md shadow-lg z-50 max-w-md bg-[var(--danger)]/20 border border-[var(--danger)] text-[var(--danger)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{connectError}</span>
            </div>
            <button
              onClick={() => setConnectError(null)}
              className="ml-4 hover:opacity-80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
