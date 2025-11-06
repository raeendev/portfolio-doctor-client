'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAdvisorTeam } from '@/contexts/AdvisorTeamContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AdvisorProfilePage() {
  const params = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const { teams, setSelectedTeam } = useAdvisorTeam();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] transition-colors">
        <Navigation currentPage="advisors" />
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

  const advisor = teams.find((t) => t.id === params.id);

  if (!advisor) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navigation currentPage="advisors" />
        <main className="max-w-4xl mx-auto py-8 px-4">
          <p className="text-[var(--text-muted)]">{t('advisors.notFound', 'Advisor not found')}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navigation currentPage="advisors" />
      <main className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: `${advisor.color}20`, color: advisor.color }}>
                {advisor.icon || '👤'}
              </div>
              <div>
                <CardTitle className="text-2xl">{isRTL ? advisor.name : advisor.nameEn || advisor.name}</CardTitle>
                <CardDescription>{isRTL ? advisor.description : advisor.descriptionEn || advisor.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">{t('advisors.specialties', 'Specialties')}</h4>
              <div className="flex flex-wrap gap-2">
                {(advisor.specialtiesEn || advisor.specialties).map((sp, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded border border-[var(--card-border)] bg-[var(--input-bg)]">{sp}</span>
                ))}
              </div>
            </div>
            <Button onClick={() => setSelectedTeam(advisor)} className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white">
              {t('advisors.selectTeam', 'Select Team')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


