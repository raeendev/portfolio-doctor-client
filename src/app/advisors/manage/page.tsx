'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdvisorManagePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navigation currentPage="advisors" />
      <main className="max-w-5xl mx-auto py-8 px-4 space-y-6">
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <CardTitle>{t('advisors.manage', 'Advisor Management')}</CardTitle>
            <CardDescription>{t('advisors.manageDesc', 'Track referred users and performance')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-[var(--text-muted)]">{t('advisors.managePlaceholder', 'Dashboard placeholder')}</div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


