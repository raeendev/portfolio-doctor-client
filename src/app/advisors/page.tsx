'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Users, TrendingUp, Sparkles } from 'lucide-react';
import { useAdvisorTeam, AdvisorTeam } from '@/contexts/AdvisorTeamContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AdvisorFilters } from '@/components/advisors/AdvisorFilters';
import { AdvisorCard } from '@/components/advisors/AdvisorCard';

export default function AdvisorsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { selectedTeam, setSelectedTeam, teams, isLoading } = useAdvisorTeam();
  const { t, isRTL } = useLanguage();
  const [filters, setFilters] = useState<{ specialty?: string; search?: string }>({});

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
            className="rounded-full h-32 w-32 border-4 border-[#3b82f6] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSelectTeam = (team: AdvisorTeam) => {
    setSelectedTeam(team);
  };

  const handleDeselectTeam = () => {
    setSelectedTeam(null);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <Navigation currentPage="advisors" />
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] mb-2 flex items-center">
                <Sparkles className={`h-8 w-8 ${isRTL ? 'ml-3' : 'mr-3'} text-[var(--primary)]`} />
                {t('advisors.title')}
              </h1>
              <p className="text-[var(--text-muted)]">
                {t('advisors.subtitle')}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6">
          <AdvisorFilters onChange={setFilters} />
        </div>

        {/* Selected Team Banner */}
        <AnimatePresence>
          {selectedTeam && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="bg-gradient-to-r from-[var(--primary)]/20 to-[var(--primary)]/10 border-[var(--primary)]/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                        style={{ backgroundColor: `${selectedTeam.color}20`, color: selectedTeam.color }}
                      >
                        {selectedTeam.icon || '👥'}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">
                          {isRTL ? selectedTeam.name : selectedTeam.nameEn || selectedTeam.name}
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          {t('advisors.currentlySelected')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleDeselectTeam}
                      className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                    >
                      {t('advisors.changeTeam')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {teams
            .filter((team) => {
              const byName = filters.search
                ? (team.name + ' ' + (team.nameEn || '')).toLowerCase().includes(filters.search.toLowerCase())
                : true;
              const bySpecialty = filters.specialty
                ? (team.specialtiesEn || team.specialties).join(' ').toLowerCase().includes(filters.specialty.toLowerCase())
                : true;
              return byName && bySpecialty;
            })
            .map((team) => {
            const isSelected = selectedTeam?.id === team.id;
            
            return (
              <motion.div
                key={team.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <AdvisorCard advisor={team as any} onClick={() => handleSelectTeam(team)} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-[var(--card-bg)] border-[var(--card-border)]">
            <CardHeader>
              <CardTitle className="text-[var(--foreground)]">{t('advisors.howItWorks')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                    <span className="text-[var(--primary)] font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {t('advisors.step1Title')}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t('advisors.step1Description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                    <span className="text-[var(--primary)] font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {t('advisors.step2Title')}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t('advisors.step2Description')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center">
                    <span className="text-[var(--primary)] font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--foreground)] mb-1">
                      {t('advisors.step3Title')}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)]">
                      {t('advisors.step3Description')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}

