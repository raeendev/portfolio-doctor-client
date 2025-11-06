'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AdvisorFiltersProps {
  onChange: (filters: { specialty?: string; search?: string }) => void;
}

export function AdvisorFilters({ onChange }: AdvisorFiltersProps) {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');

  const apply = () => onChange({ specialty, search });

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder={t('advisors.searchPlaceholder', 'Search by name...')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="bg-[var(--input-bg)] border border-[var(--card-border)] rounded px-3 py-2 text-sm"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
      >
        <option value="">{t('advisors.allSpecialties', 'All specialties')}</option>
        <option value="technical">{t('advisors.specialty.technical', 'Technical Analysis')}</option>
        <option value="fundamental">{t('advisors.specialty.fundamental', 'Fundamental Analysis')}</option>
        <option value="defi">DeFi</option>
        <option value="nft">NFT</option>
        <option value="strategy">{t('advisors.specialty.strategy', 'Trading Strategies')}</option>
      </select>
      <Button onClick={apply}>{t('common.apply', 'Apply')}</Button>
    </div>
  );
}


