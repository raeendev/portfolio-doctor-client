'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useMemo } from 'react';

interface PortfolioLineChartProps {
  data?: Array<{ date: string; value: number }>;
  height?: number;
}

export function PortfolioLineChart({ data = [], height = 300 }: PortfolioLineChartProps) {
  // Generate sample data if no data provided (for demo)
  const chartData = useMemo(() => {
    if (data.length > 0) {
      return data.map((item, index) => ({
        date: item.date,
        value: item.value,
      }));
    }
    
    // Generate sample data for demonstration
    const sampleDates = ['05/05', '13/05', '20/05', '28/05', '05/06'];
    const baseValue = 3000;
    return sampleDates.map((date, index) => ({
      date,
      value: baseValue + Math.random() * 2000 + (index * 500),
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg transition-colors">
          <p className="text-[var(--foreground)] font-semibold">{`€${payload[0].value.toFixed(2)}`}</p>
          <p className="text-[var(--text-muted)] text-sm">{payload[0].payload.date}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" opacity={0.3} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#9ca3af' }}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorValue)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
