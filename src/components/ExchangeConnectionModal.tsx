'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Exchange } from './ExchangeList';

interface ExchangeConnectionModalProps {
  exchange: Exchange | null;
  onClose: () => void;
  onConnect: (exchangeId: string, apiKey: string, apiSecret: string) => Promise<void>;
  isConnecting?: boolean;
}

export function ExchangeConnectionModal({ 
  exchange, 
  onClose, 
  onConnect, 
  isConnecting = false 
}: ExchangeConnectionModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!exchange) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!apiKey.trim()) {
      newErrors.apiKey = 'API Key is required';
    } else if (apiKey.length < 10) {
      newErrors.apiKey = 'API Key must be at least 10 characters';
    }

    if (!apiSecret.trim()) {
      newErrors.apiSecret = 'API Secret is required';
    } else if (apiSecret.length < 10) {
      newErrors.apiSecret = 'API Secret must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConnect = async () => {
    if (!validateForm()) return;

    try {
      await onConnect(exchange.id, apiKey, apiSecret);
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleClose = () => {
    setApiKey('');
    setApiSecret('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-lg">Connect {exchange.name}</CardTitle>
            <CardDescription>
              Enter your API credentials to connect your {exchange.name} account
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl">{exchange.icon}</div>
            <div>
              <h4 className="font-medium">{exchange.name}</h4>
              <p className="text-sm text-gray-600">{exchange.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <Input
                id="apiKey"
                type="text"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={errors.apiKey ? 'border-red-500' : ''}
              />
              {errors.apiKey && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.apiKey}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700 mb-1">
                API Secret
              </label>
              <div className="relative">
                <Input
                  id="apiSecret"
                  type={showApiSecret ? 'text' : 'password'}
                  placeholder="Enter your API secret"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  className={errors.apiSecret ? 'border-red-500 pr-10' : 'pr-10'}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                >
                  {showApiSecret ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {errors.apiSecret && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.apiSecret}
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  Your API credentials are encrypted and stored securely. We only request read-only permissions 
                  to track your portfolio. Never share your API secret with anyone.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isConnecting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConnect}
              disabled={isConnecting || !apiKey.trim() || !apiSecret.trim()}
              className="flex-1"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Connect Exchange
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
