'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ExchangeList, Exchange } from '@/components/ExchangeList';
import { ExchangeConnectionModal } from '@/components/ExchangeConnectionModal';
import { ExchangeManagement } from '@/components/ExchangeManagement';
import { UpdateExchangeModal } from '@/components/UpdateExchangeModal';
import { exchangesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, Settings } from 'lucide-react';
import { Navigation } from '@/components/Navigation';

export default function ExchangesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);
  const [connectedExchanges, setConnectedExchanges] = useState<string[]>([]);
  const [connectedExchangesDetails, setConnectedExchangesDetails] = useState<any[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingExchange, setEditingExchange] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'connect' | 'manage'>('connect');

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
      
      // For now, create mock details - in production, this would come from a detailed endpoint
      const details = response.data.exchanges.map((exchange: string) => ({
        exchange,
        createdAt: new Date().toISOString(),
        id: `mock-${exchange}`,
      }));
      setConnectedExchangesDetails(details);
    } catch (error) {
      console.error('Failed to load connected exchanges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectExchange = (exchange: Exchange) => {
    if (exchange.status === 'available') {
      setSelectedExchange(exchange);
    }
  };

  const handleConnectExchange = async (exchangeId: string, apiKey: string, apiSecret: string) => {
    setIsConnecting(true);
    try {
      await exchangesApi.connect(exchangeId, apiKey, apiSecret);
      await loadConnectedExchanges();
      setSelectedExchange(null);
    } catch (error) {
      console.error('Failed to connect exchange:', error);
      // TODO: Show error message to user
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedExchange(null);
  };

  const handleEditExchange = (exchangeId: string) => {
    setEditingExchange(exchangeId);
  };

  const handleCloseEditModal = () => {
    setEditingExchange(null);
  };

  const handleExchangeUpdated = () => {
    loadConnectedExchanges();
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentPage="exchanges" />
      
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">Exchange Management</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadConnectedExchanges}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('connect')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'connect'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Connect New Exchange
              </button>
              <button
                onClick={() => setActiveTab('manage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'manage'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Manage Connected Exchanges
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'connect' ? (
          <ExchangeList
            onSelectExchange={handleSelectExchange}
            connectedExchanges={connectedExchanges}
          />
        ) : (
          <ExchangeManagement
            connectedExchanges={connectedExchangesDetails}
            onRefresh={loadConnectedExchanges}
            onUpdate={handleExchangeUpdated}
            onEdit={handleEditExchange}
          />
        )}
      </main>

      {/* Connection Modal */}
      <ExchangeConnectionModal
        exchange={selectedExchange}
        onClose={handleCloseModal}
        onConnect={handleConnectExchange}
        isConnecting={isConnecting}
      />

      {/* Update Exchange Modal */}
      {editingExchange && (
        <UpdateExchangeModal
          exchangeId={editingExchange}
          onClose={handleCloseEditModal}
          onUpdate={handleExchangeUpdated}
        />
      )}
    </div>
  );
}
