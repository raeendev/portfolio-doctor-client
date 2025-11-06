'use client';

import { InstitutionalCard } from './InstitutionalCard';

export function InstitutionalCardsSection() {
  // Mock holdings; replace with API when available
  const grayscale = [
    { symbol: 'BTC', percent: 88.0, color: '#f59e0b' },
    { symbol: 'ETH', percent: 11.0, color: '#8b5cf6' },
    { symbol: 'Others', percent: 1.0, color: '#6b7280' },
  ];

  const etfs = [
    { symbol: 'BTC Futures', percent: 92.0, color: '#3b82f6' },
    { symbol: 'Cash/Other', percent: 8.0, color: '#6b7280' },
  ];

  const vcs = [
    { symbol: 'L1/L2', percent: 40.0, color: '#10b981' },
    { symbol: 'DeFi', percent: 30.0, color: '#3b82f6' },
    { symbol: 'Infrastructure', percent: 20.0, color: '#8b5cf6' },
    { symbol: 'Others', percent: 10.0, color: '#6b7280' },
  ];

  return (
    <div className="space-y-4">
      <InstitutionalCard name="Grayscale Trusts" subtitle="GBTC, ETHE" holdings={grayscale} />
      <InstitutionalCard name="ETFs" subtitle="BITO, IBIT" holdings={etfs} />
      <InstitutionalCard name="Top VCs" subtitle="a16z, Pantera" holdings={vcs} />
    </div>
  );
}


