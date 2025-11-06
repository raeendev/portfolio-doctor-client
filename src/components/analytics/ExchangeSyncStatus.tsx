'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { exchangesApi } from '@/lib/api';

export function ExchangeSyncStatus() {
  const { t } = useLanguage();
  const [exchanges, setExchanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await exchangesApi.getConnectedExchanges();
        const list = (res.data?.exchanges || []).map((ex: any) => (typeof ex === 'string' ? ex : ex.exchange || ex.id || ex));
        setExchanges(list);
      } catch (e) {
        setExchanges([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
      <CardHeader>
        <CardTitle>{t('analytics.trades.syncStatus', 'Exchange Sync Status')}</CardTitle>
        <CardDescription>{t('analytics.trades.syncStatusDesc', 'Keep your trade history updated')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(loading ? ['placeholder-1', 'placeholder-2', 'placeholder-3'] : exchanges).map((ex, i) => (
            <div key={`${String(ex)}-${i}`} className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--input-bg)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold capitalize">{String(ex)}</span>
                <Button size="sm" variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  {t('common.refresh', 'Refresh')}
                </Button>
              </div>
              <p className="text-xs text-[var(--text-muted)]">{t('analytics.trades.neverSynced', 'Never synced')}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


