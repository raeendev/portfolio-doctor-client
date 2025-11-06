'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RebalanceRecommendations } from './RebalanceRecommendations';
import { TradeCalculator } from './TradeCalculator';
import { PriorityMatrix } from './PriorityMatrix';

export function RebalancingAssistant() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle>{t('rebalancing.recommendations', 'Recommended Actions')}</CardTitle>
          <CardDescription>{t('rebalancing.recommendationsDesc', 'Increase/decrease allocations based on target')}</CardDescription>
        </CardHeader>
        <CardContent>
          <RebalanceRecommendations />
        </CardContent>
      </Card>

      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle>{t('rebalancing.tradeCalc', 'Trade Calculator')}</CardTitle>
          <CardDescription>{t('rebalancing.tradeCalcDesc', 'Exact buy/sell amounts')}</CardDescription>
        </CardHeader>
        <CardContent>
          <TradeCalculator />
        </CardContent>
      </Card>

      <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle>{t('rebalancing.priority', 'Priority Matrix')}</CardTitle>
          <CardDescription>{t('rebalancing.priorityDesc', 'Urgency × Impact')}</CardDescription>
        </CardHeader>
        <CardContent>
          <PriorityMatrix />
        </CardContent>
      </Card>
    </div>
  );
}


