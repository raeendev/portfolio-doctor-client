'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { AdvisorTeam } from '@/contexts/AdvisorTeamContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdvisorCardProps {
  advisor: AdvisorTeam & { avatarUrl?: string; socials?: { twitter?: string; telegram?: string } };
  onClick?: () => void;
}

export function AdvisorCard({ advisor, onClick }: AdvisorCardProps) {
  const { isRTL } = useLanguage();
  return (
    <Card className="bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--primary)]/50 cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${advisor.color}20`, color: advisor.color }}>
            {advisor.icon || '👤'}
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg truncate">{isRTL ? advisor.name : advisor.nameEn || advisor.name}</CardTitle>
            <CardDescription className="truncate">{isRTL ? advisor.description : advisor.descriptionEn || advisor.description}</CardDescription>
          </div>
          {advisor.rating && (
            <div className="ml-auto flex items-center gap-1 text-yellow-500">
              <Star className="h-4 w-4 fill-yellow-500" />
              <span className="text-sm font-semibold">{advisor.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(advisor.specialtiesEn || advisor.specialties).slice(0, 3).map((sp, i) => (
            <Badge key={i} variant="outline" className="text-xs border-[var(--card-border)] bg-[var(--input-bg)]">{sp}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


