'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useMemo } from 'react';

interface AssetDistribution {
  symbol: string;
  value: number;
  percentage: number;
  color: string;
}

interface PortfolioDonutChartProps {
  assets?: AssetDistribution[];
  totalValue?: number;
  height?: number;
}

const COLORS = ['#3b82f6', '#f59e0b', '#ec4899', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];

export function PortfolioDonutChart({ assets = [], totalValue = 0, height = 250 }: PortfolioDonutChartProps) {
  const chartData = useMemo(() => {
    if (assets.length > 0) {
      return assets.map((asset, index) => ({
        name: asset.symbol,
        value: asset.value,
        percentage: asset.percentage,
        color: asset.color || COLORS[index % COLORS.length],
      }));
    }
    
    // Sample data for demonstration
    return [
      { name: 'Bitcoin', value: 3500, percentage: 24, color: '#ec4899' },
      { name: 'Ethereum', value: 2625, percentage: 18, color: '#3b82f6' },
      { name: 'Shard', value: 4666, percentage: 32, color: '#10b981' },
      { name: 'Binance', value: 3200, percentage: 22, color: '#f59e0b' },
    ];
  }, [assets]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-lg p-3 shadow-lg transition-colors">
          <p className="text-[var(--foreground)] font-semibold">{data.name}</p>
          <p className="text-[var(--primary)] font-medium">€{data.value.toFixed(3)}</p>
          <p className="text-[var(--text-muted)] text-sm">{typeof data.payload.percentage === 'number' ? data.payload.percentage.toFixed(3) : data.payload.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if slice is too small

    return (
      <text
        x={x}
        y={y}
        fill="#e5e7eb"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            innerRadius={50}
            fill="#8884d8"
            dataKey="value"
            animationDuration={1500}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
