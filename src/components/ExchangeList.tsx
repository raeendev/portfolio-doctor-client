'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, ExternalLink, Shield, Zap, Globe, RefreshCw, X, Loader2 } from 'lucide-react';
import { exchangesApi } from '@/lib/api';

export interface Exchange {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming_soon' | 'maintenance';
  features: string[];
  icon: string;
  website: string;
  supportedFeatures: {
    spot: boolean;
    futures: boolean;
    margin: boolean;
    staking: boolean;
  };
}

interface ExchangeListProps {
  onSelectExchange: (exchange: Exchange) => void;
  connectedExchanges?: string[];
  onDisconnect?: (exchangeId: string) => Promise<void>;
  onRefresh?: () => void;
}

export function ExchangeList({ 
  onSelectExchange, 
  connectedExchanges = [], 
  onDisconnect,
  onRefresh 
}: ExchangeListProps) {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disconnectingExchange, setDisconnectingExchange] = useState<string | null>(null);

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await exchangesApi.getList();
      
      // Map API response to Exchange format
      const mappedExchanges: Exchange[] = response.data.exchanges.map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        description: ex.description,
        status: ex.status as 'available' | 'coming_soon' | 'maintenance',
        features: ex.features || [],
        icon: ex.icon || '📊',
        website: ex.website || '#',
        supportedFeatures: ex.supportedFeatures || {
          spot: false,
          futures: false,
          margin: false,
          staking: false,
        },
      }));
      
      setExchanges(mappedExchanges);
    } catch (error) {
      console.error('Failed to load exchanges:', error);
      setError('Failed to load exchanges. Please try again.');
      // Fallback to empty array
      setExchanges([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: Exchange['status']) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>;
      case 'coming_soon':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Coming Soon</Badge>;
      case 'maintenance':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      default:
        return null;
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature.toLowerCase()) {
      case 'spot trading':
        return <Zap className="h-4 w-4" />;
      case 'futures trading':
        return <ExternalLink className="h-4 w-4" />;
      case 'margin trading':
        return <Shield className="h-4 w-4" />;
      case 'staking':
        return <Globe className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const handleDisconnect = async (exchangeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to disconnect ${exchangeId}?`)) {
      return;
    }

    try {
      setDisconnectingExchange(exchangeId);
      if (onDisconnect) {
        await onDisconnect(exchangeId);
      }
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error: any) {
      console.error('Failed to disconnect exchange:', error);
      alert(error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to disconnect exchange');
    } finally {
      setDisconnectingExchange(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Exchange</h2>
          <p className="text-gray-600">
            Loading available exchanges...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Exchange</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadExchanges} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Exchange</h2>
        <p className="text-gray-600">
          Select an exchange to connect and start tracking your portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exchanges.map((exchange) => {
          const isConnected = connectedExchanges.includes(exchange.id);
          const isAvailable = exchange.status === 'available';
          
          return (
            <Card 
              key={exchange.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isConnected ? 'ring-2 ring-green-500 bg-green-50' : 
                isAvailable ? 'hover:ring-2 hover:ring-blue-500' : 
                'opacity-60'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{exchange.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{exchange.name}</CardTitle>
                      {getStatusBadge(exchange.status)}
                    </div>
                  </div>
                  {isConnected && (
                    <Badge className="bg-green-500 text-white flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Connected
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {exchange.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Supported Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {exchange.features.map((feature) => (
                        <div 
                          key={feature}
                          className="flex items-center space-x-1 text-xs bg-gray-100 px-2 py-1 rounded-md"
                        >
                          {getFeatureIcon(feature)}
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isConnected ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        disabled={disconnectingExchange === exchange.id}
                        onClick={(e) => handleDisconnect(exchange.id, e)}
                      >
                        {disconnectingExchange === exchange.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        disabled={!isAvailable}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isAvailable) {
                            onSelectExchange(exchange);
                          }
                        }}
                      >
                        {isAvailable ? (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Connect
                          </>
                        ) : (
                          'Coming Soon'
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(exchange.website, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
