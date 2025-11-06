'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export function RiskQuestionnaire() {
  const { t, isRTL } = useLanguage();
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-muted)]">{t('profiling.progress', 'Progress')}</span>
        <span className="text-sm font-semibold">{progress}%</span>
      </div>
      <div className="w-full h-2 bg-[var(--card-border)] rounded">
        <div className="h-2 bg-[var(--primary)] rounded" style={{ width: `${progress}%` }} />
      </div>

      <Card className="bg-[var(--input-bg)] border-[var(--card-border)]">
        <CardHeader>
          <CardTitle className="text-base">{t('profiling.dimensions.mindset', 'Investment Mindset')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-muted)] mb-3">{t('profiling.questions.example', 'Example question placeholder')}</p>
          <div className={`flex ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>{t('common.low', 'Low')}</Button>
            <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>{t('common.medium', 'Medium')}</Button>
            <Button size="sm" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>{t('common.high', 'High')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


