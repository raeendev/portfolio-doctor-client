'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { RiskQuestionnaire } from '@/components/profiling/RiskQuestionnaire';
import { RiskProfileResult } from '@/components/profiling/RiskProfileResult';
import { IdealAllocationCalculator } from '@/components/profiling/IdealAllocationCalculator';
import { DeviationDetector } from '@/components/profiling/DeviationDetector';

export default function RiskAssessmentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="dashboard" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            className="rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navigation currentPage="dashboard" />

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">{t('profiling.riskAssessment.title', 'Risk Assessment')}</h1>
          <p className="text-[var(--text-muted)]">{t('profiling.riskAssessment.subtitle', 'Determine your risk profile and ideal portfolio allocation')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
          {/* Left: Questionnaire and Results */}
          <div className="space-y-6">
            <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
              <CardHeader>
                <CardTitle>{t('profiling.riskAssessment.questionnaire', 'Risk Questionnaire')}</CardTitle>
                <CardDescription>{t('profiling.riskAssessment.questionnaireDesc', 'Answer a few questions across six dimensions')}</CardDescription>
              </CardHeader>
              <CardContent>
                <RiskQuestionnaire />
              </CardContent>
            </Card>

            <RiskProfileResult />
          </div>

          {/* Right: Ideal Allocation & Deviation */}
          <div className="space-y-6">
            <IdealAllocationCalculator />
            <DeviationDetector />
          </div>
        </div>
      </main>
    </div>
  );
}


