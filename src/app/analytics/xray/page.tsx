'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { SectorBreakdown } from '@/components/analytics/SectorBreakdown';
import { FunctionBreakdown } from '@/components/analytics/FunctionBreakdown';
import { CorrelationMatrix } from '@/components/analytics/CorrelationMatrix';
import { ConcentrationAnalysis } from '@/components/analytics/ConcentrationAnalysis';

export default function XRayPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="dashboard" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div className="rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navigation currentPage="dashboard" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold mb-2">{t('analytics.xray.title', 'Portfolio X-Ray')}</h1>
          <p className="text-[var(--text-muted)]">{t('analytics.xray.subtitle', 'Deep analysis of your portfolio')}</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectorBreakdown />
          <FunctionBreakdown />
          <CorrelationMatrix />
          <ConcentrationAnalysis />
        </div>
      </main>
    </div>
  );
}


