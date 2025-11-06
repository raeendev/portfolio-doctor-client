'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { RebalancingAssistant } from '@/components/rebalancing/RebalancingAssistant';

export default function RebalancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="portfolio" />
        <div className="min-h-screen flex items-center justify-center">
          <motion.div className="rounded-full h-32 w-32 border-4 border-[var(--primary)] border-t-transparent" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navigation currentPage="portfolio" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">{t('rebalancing.title', 'Rebalancing Assistant')}</h1>
        <RebalancingAssistant />
      </main>
    </div>
  );
}


