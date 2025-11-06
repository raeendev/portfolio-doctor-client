'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface AdvisorTeam {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  icon?: string;
  color: string;
  specialties: string[];
  specialtiesEn?: string[];
  memberCount: number;
  rating?: number;
  totalUsers?: number;
}

interface AdvisorTeamContextType {
  selectedTeam: AdvisorTeam | null;
  setSelectedTeam: (team: AdvisorTeam | null) => void;
  teams: AdvisorTeam[];
  isLoading: boolean;
  error: string | null;
}

const AdvisorTeamContext = createContext<AdvisorTeamContextType | undefined>(undefined);

interface AdvisorTeamProviderProps {
  children: ReactNode;
}

const DEFAULT_TEAMS: AdvisorTeam[] = [
  {
    id: 'conservative',
    name: 'تیم محافظه‌کار',
    nameEn: 'Conservative Team',
    description: 'تیم متخصص در مدیریت ریسک و سرمایه‌گذاری محافظه‌کارانه با تمرکز بر حفظ سرمایه',
    descriptionEn: 'Expert team in risk management and conservative investment with focus on capital preservation',
    icon: '🛡️',
    color: '#3b82f6',
    specialties: ['مدیریت ریسک', 'استراتژی‌های محافظه‌کارانه', 'تحلیل فاندامنتال'],
    specialtiesEn: ['Risk Management', 'Conservative Strategies', 'Fundamental Analysis'],
    memberCount: 5,
    rating: 4.8,
    totalUsers: 1250,
  },
  {
    id: 'balanced',
    name: 'تیم متعادل',
    nameEn: 'Balanced Team',
    description: 'تیم متعادل با رویکرد ترکیبی از رشد و حفظ سرمایه، مناسب برای سرمایه‌گذاران با تحمل ریسک متوسط',
    descriptionEn: 'Balanced team with combined approach of growth and capital preservation, suitable for investors with moderate risk tolerance',
    icon: '⚖️',
    color: '#10b981',
    specialties: ['تنوع‌سازی', 'تحلیل تکنیکال', 'مدیریت پرتفوی متعادل'],
    specialtiesEn: ['Diversification', 'Technical Analysis', 'Balanced Portfolio Management'],
    memberCount: 8,
    rating: 4.9,
    totalUsers: 2840,
  },
  {
    id: 'aggressive',
    name: 'تیم تهاجمی',
    nameEn: 'Aggressive Team',
    description: 'تیم متخصص در معاملات پرریسک با پتانسیل بازدهی بالا، مناسب برای معامله‌گران باتجربه',
    descriptionEn: 'Expert team in high-risk trading with high return potential, suitable for experienced traders',
    icon: '🚀',
    color: '#ef4444',
    specialties: ['معاملات کوتاه‌مدت', 'استراتژی‌های تهاجمی', 'تحلیل مومنتوم'],
    specialtiesEn: ['Short-term Trading', 'Aggressive Strategies', 'Momentum Analysis'],
    memberCount: 6,
    rating: 4.6,
    totalUsers: 980,
  },
  {
    id: 'defi',
    name: 'تیم DeFi',
    nameEn: 'DeFi Team',
    description: 'متخصصان DeFi و پروژه‌های دیفای، استیکینگ و ییلد فارمینگ',
    descriptionEn: 'DeFi experts specializing in DeFi projects, staking and yield farming',
    icon: '💎',
    color: '#8b5cf6',
    specialties: ['DeFi Protocols', 'Yield Farming', 'Staking Strategies'],
    specialtiesEn: ['DeFi Protocols', 'Yield Farming', 'Staking Strategies'],
    memberCount: 7,
    rating: 4.7,
    totalUsers: 1520,
  },
  {
    id: 'ai',
    name: 'تیم هوش مصنوعی',
    nameEn: 'AI Team',
    description: 'تیم پیشرو در استفاده از هوش مصنوعی و الگوریتم‌های یادگیری ماشین برای تحلیل و پیش‌بینی بازار',
    descriptionEn: 'Leading team in using artificial intelligence and machine learning algorithms for market analysis and prediction',
    icon: '🤖',
    color: '#06b6d4',
    specialties: ['هوش مصنوعی', 'یادگیری ماشین', 'تحلیل پیش‌بینی'],
    specialtiesEn: ['Artificial Intelligence', 'Machine Learning', 'Predictive Analysis'],
    memberCount: 10,
    rating: 4.9,
    totalUsers: 3200,
  },
];

export function AdvisorTeamProvider({ children }: AdvisorTeamProviderProps) {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeamState] = useState<AdvisorTeam | null>(null);
  const [teams] = useState<AdvisorTeam[]>(DEFAULT_TEAMS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load selected team from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedTeamId = localStorage.getItem(`advisorTeam_${user.id}`);
      if (savedTeamId) {
        const team = teams.find(t => t.id === savedTeamId);
        if (team) {
          setSelectedTeamState(team);
        }
      }
    }
  }, [user, teams]);

  const setSelectedTeam = (team: AdvisorTeam | null) => {
    setSelectedTeamState(team);
    if (user) {
      if (team) {
        localStorage.setItem(`advisorTeam_${user.id}`, team.id);
      } else {
        localStorage.removeItem(`advisorTeam_${user.id}`);
      }
    }
  };

  return (
    <AdvisorTeamContext.Provider
      value={{
        selectedTeam,
        setSelectedTeam,
        teams,
        isLoading,
        error,
      }}
    >
      {children}
    </AdvisorTeamContext.Provider>
  );
}

export function useAdvisorTeam() {
  const context = useContext(AdvisorTeamContext);
  if (context === undefined) {
    throw new Error('useAdvisorTeam must be used within an AdvisorTeamProvider');
  }
  return context;
}

