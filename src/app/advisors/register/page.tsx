'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navigation } from '@/components/Navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdvisorRegisterPage() {
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
      <main className="max-w-3xl mx-auto py-8 px-4">
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <CardTitle>{t('advisors.register', 'Advisor Registration')}</CardTitle>
            <CardDescription>{t('advisors.registerDesc', 'Apply to become an advisor')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-[var(--text-muted)] mb-4">{t('advisors.registerPlaceholder', 'Registration form placeholder')}</div>
            <Button className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">{t('common.save', 'Save')}</Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


