'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, ExternalLink, Shield, Zap, Globe } from 'lucide-react';

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

const availableExchanges: Exchange[] = [
  {
    id: 'lbank',
    name: 'LBank',
    description: 'Global cryptocurrency exchange with advanced trading features',
    status: 'available',
    features: ['Spot Trading', 'Futures Trading', 'Staking', 'High Liquidity'],
    icon: '🏦',
    website: 'https://www.lbank.com',
    supportedFeatures: {
      spot: true,
      futures: true,
      margin: false,
      staking: true,
    },
  },
  {
    id: 'binance',
    name: 'Binance',
    description: 'World\'s largest cryptocurrency exchange by trading volume',
    status: 'coming_soon',
    features: ['Spot Trading', 'Futures Trading', 'Margin Trading', 'Staking', 'NFT Marketplace'],
    icon: '🟡',
    website: 'https://www.binance.com',
    supportedFeatures: {
      spot: true,
      futures: true,
      margin: true,
      staking: true,
    },
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    description: 'Leading US-based cryptocurrency exchange and wallet',
    status: 'coming_soon',
    features: ['Spot Trading', 'Staking', 'Institutional Services', 'NFT Marketplace'],
    icon: '🔵',
    website: 'https://www.coinbase.com',
    supportedFeatures: {
      spot: true,
      futures: false,
      margin: false,
      staking: true,
    },
  },
  {
    id: 'kraken',
    name: 'Kraken',
    description: 'Secure and reliable cryptocurrency exchange since 2011',
    status: 'coming_soon',
    features: ['Spot Trading', 'Futures Trading', 'Margin Trading', 'Staking'],
    icon: '🦑',
    website: 'https://www.kraken.com',
    supportedFeatures: {
      spot: true,
      futures: true,
      margin: true,
      staking: true,
    },
  },
  {
    id: 'okx',
    name: 'OKX',
    description: 'Global cryptocurrency exchange with comprehensive trading tools',
    status: 'coming_soon',
    features: ['Spot Trading', 'Futures Trading', 'Margin Trading', 'Options', 'Staking'],
    icon: '⚡',
    website: 'https://www.okx.com',
    supportedFeatures: {
      spot: true,
      futures: true,
      margin: true,
      staking: true,
    },
  },
];

interface ExchangeListProps {
  onSelectExchange: (exchange: Exchange) => void;
  connectedExchanges?: string[];
}

export function ExchangeList({ onSelectExchange, connectedExchanges = [] }: ExchangeListProps) {
  const [selectedExchange, setSelectedExchange] = useState<Exchange | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Exchange</h2>
        <p className="text-gray-600">
          Select an exchange to connect and start tracking your portfolio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableExchanges.map((exchange) => {
          const isConnected = connectedExchanges.includes(exchange.id);
          const isAvailable = exchange.status === 'available';
          
          return (
            <Card 
              key={exchange.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                isConnected ? 'ring-2 ring-green-500 bg-green-50' : 
                isAvailable ? 'hover:ring-2 hover:ring-blue-500 cursor-pointer' : 
                'opacity-60 cursor-not-allowed'
              }`}
              onClick={() => isAvailable && !isConnected && setSelectedExchange(exchange)}
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
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
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
                    <Button
                      variant={isConnected ? "outline" : "default"}
                      size="sm"
                      className="flex-1"
                      disabled={!isAvailable || isConnected}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isAvailable && !isConnected) {
                          onSelectExchange(exchange);
                        }
                      }}
                    >
                      {isConnected ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Connected
                        </>
                      ) : isAvailable ? (
                        <>
                          <Plus className="h-4 w-4 mr-1" />
                          Connect
                        </>
                      ) : (
                        'Coming Soon'
                      )}
                    </Button>
                    
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

      {selectedExchange && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Connect {selectedExchange.name}</h3>
            <p className="text-gray-600 mb-4">
              You will be redirected to {selectedExchange.name} to complete the connection process.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  onSelectExchange(selectedExchange);
                  setSelectedExchange(null);
                }}
                className="flex-1"
              >
                Continue
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedExchange(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
