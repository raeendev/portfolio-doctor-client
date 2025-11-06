'use client';

import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Demo component to show how to use position notifications
 * This can be integrated into your trading/position management logic
 */
export function PositionNotificationDemo() {
  const { showPositionNotification } = useToast();

  const handleOpenLongPosition = () => {
    showPositionNotification({
      type: 'LONG',
      symbol: 'BTC/USDT',
      size: 0.5,
      price: 65432.50,
    });
  };

  const handleOpenShortPosition = () => {
    showPositionNotification({
      type: 'SHORT',
      symbol: 'ETH/USDT',
      size: 10.25,
      price: 3421.75,
    });
  };

  return (
    <div className="p-4 space-y-2">
      <Button
        onClick={handleOpenLongPosition}
        className="bg-[#10b981] hover:bg-[#059669] text-white"
      >
        <TrendingUp className="h-4 w-4 mr-2" />
        Test LONG Position
      </Button>
      <Button
        onClick={handleOpenShortPosition}
        className="bg-[#ef4444] hover:bg-[#dc2626] text-white"
      >
        <TrendingDown className="h-4 w-4 mr-2" />
        Test SHORT Position
      </Button>
    </div>
  );
}

