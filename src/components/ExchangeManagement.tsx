'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { exchangesApi } from '@/lib/api';

interface ConnectedExchange {
  exchange: string;
  createdAt: string;
  id?: string;
}

interface ExchangeManagementProps {
  connectedExchanges: ConnectedExchange[];
  onRefresh: () => void;
  onUpdate: () => void;
  onEdit?: (exchangeId: string) => void;
}

export function ExchangeManagement({ connectedExchanges, onRefresh, onUpdate, onEdit }: ExchangeManagementProps) {
  const [editingExchange, setEditingExchange] = useState<string | null>(null);
  const [deletingExchange, setDeletingExchange] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const handleDisconnect = async (exchangeId: string) => {
    if (!confirm(`Are you sure you want to disconnect ${exchangeId}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      setDisconnectError(null);
      await exchangesApi.disconnect(exchangeId);
      onRefresh();
      onUpdate();
      setDeletingExchange(null);
    } catch (error: any) {
      console.error('Failed to disconnect exchange:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to disconnect exchange. Please try again.';
      setDisconnectError(errorMessage);
      alert(errorMessage);
    } finally {
      setIsLoading(false);
      if (!disconnectError) {
        setDeletingExchange(null);
      }
    }
  };

  const handleEdit = (exchangeId: string) => {
    if (onEdit) {
      onEdit(exchangeId);
    } else {
      setEditingExchange(exchangeId);
    }
  };

  const getExchangeIcon = (exchange: string) => {
    switch (exchange.toLowerCase()) {
      case 'lbank':
        return '🏦';
      case 'binance':
        return '🟡';
      case 'coinbase':
        return '🔵';
      case 'kraken':
        return '🦑';
      case 'okx':
        return '⚡';
      default:
        return '📊';
    }
  };

  const getExchangeName = (exchange: string) => {
    switch (exchange.toLowerCase()) {
      case 'lbank':
        return 'LBank';
      case 'binance':
        return 'Binance';
      case 'coinbase':
        return 'Coinbase';
      case 'kraken':
        return 'Kraken';
      case 'okx':
        return 'OKX';
      default:
        return exchange.charAt(0).toUpperCase() + exchange.slice(1);
    }
  };

  if (connectedExchanges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Connected Exchanges</CardTitle>
          <CardDescription>
            You haven't connected any exchanges yet. Connect an exchange to start tracking your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRefresh} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Connected Exchanges</h3>
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {connectedExchanges.map((exchange) => (
          <Card key={exchange.exchange} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getExchangeIcon(exchange.exchange)}</div>
                  <div>
                    <CardTitle className="text-lg">{getExchangeName(exchange.exchange)}</CardTitle>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription>
                Connected on {new Date(exchange.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(exchange.exchange)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Update Keys
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingExchange(exchange.exchange)}
                  disabled={isLoading}
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Disconnect
                </Button>
              </div>
            </CardContent>

            {/* Delete Confirmation */}
            {deletingExchange === exchange.exchange && (
              <div className="absolute inset-0 bg-white bg-opacity-95 rounded-lg flex items-center justify-center p-4">
                <div className="text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-medium mb-3">
                    Disconnect {getExchangeName(exchange.exchange)}?
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDeletingExchange(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDisconnect(exchange.exchange)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1" />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
