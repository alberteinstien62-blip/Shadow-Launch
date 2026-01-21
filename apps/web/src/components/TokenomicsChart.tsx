'use client';

import { useMemo } from 'react';
import { PieChart, Users, Droplets, Megaphone, Building2, Coins } from 'lucide-react';

interface TokenomicsData {
  teamAllocation?: number;
  communityAllocation?: number;
  liquidityAllocation?: number;
  marketingAllocation?: number;
  reserveAllocation?: number;
}

interface TokenomicsChartProps {
  data: TokenomicsData;
  totalSupply: number;
  tokenSymbol: string;
}

const COLORS = {
  team: '#f97316', // Orange
  community: '#22c55e', // Green (neon-green)
  liquidity: '#06b6d4', // Cyan (neon-cyan)
  marketing: '#a855f7', // Purple (neon-purple)
  reserve: '#ec4899', // Pink (neon-pink)
};

const LABELS = {
  team: { label: 'Team', icon: Users },
  community: { label: 'Public Sale', icon: Coins },
  liquidity: { label: 'Liquidity', icon: Droplets },
  marketing: { label: 'Marketing', icon: Megaphone },
  reserve: { label: 'Reserve', icon: Building2 },
};

export function TokenomicsChart({ data, totalSupply, tokenSymbol }: TokenomicsChartProps) {
  const segments = useMemo(() => {
    const allocationMap = [
      { key: 'community', value: data.communityAllocation || 0 },
      { key: 'liquidity', value: data.liquidityAllocation || 0 },
      { key: 'team', value: data.teamAllocation || 0 },
      { key: 'marketing', value: data.marketingAllocation || 0 },
      { key: 'reserve', value: data.reserveAllocation || 0 },
    ].filter(item => item.value > 0);

    let currentAngle = 0;
    return allocationMap.map(({ key, value }) => {
      const angle = (value / 100) * 360;
      const segment = {
        key,
        value,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: COLORS[key as keyof typeof COLORS],
        ...LABELS[key as keyof typeof LABELS],
      };
      currentAngle += angle;
      return segment;
    });
  }, [data]);

  const totalAllocated = useMemo(() => {
    return (data.teamAllocation || 0) +
      (data.communityAllocation || 0) +
      (data.liquidityAllocation || 0) +
      (data.marketingAllocation || 0) +
      (data.reserveAllocation || 0);
  }, [data]);

  // Generate SVG path for pie segment
  const createArcPath = (startAngle: number, endAngle: number, radius: number, cx: number, cy: number) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  if (segments.length === 0) {
    return (
      <div className="cyber-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-4">
          <PieChart className="w-5 h-5 text-neon-cyan" />
          <h3 className="text-lg font-bold">Tokenomics</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No tokenomics data available
        </div>
      </div>
    );
  }

  return (
    <div className="cyber-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-bold">Tokenomics</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="200" height="200" viewBox="0 0 200 200">
              {segments.map((segment, index) => (
                <path
                  key={segment.key}
                  d={createArcPath(segment.startAngle, segment.endAngle, 80, 100, 100)}
                  fill={segment.color}
                  className="transition-all duration-300 hover:opacity-80"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                />
              ))}
              {/* Center circle */}
              <circle cx="100" cy="100" r="50" fill="#0a0a0a" />
              <text
                x="100"
                y="95"
                textAnchor="middle"
                className="fill-white text-xl font-bold"
              >
                {totalAllocated}%
              </text>
              <text
                x="100"
                y="115"
                textAnchor="middle"
                className="fill-gray-400 text-xs"
              >
                Allocated
              </text>
            </svg>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {segments.map((segment) => {
            const Icon = segment.icon;
            const tokens = (segment.value / 100) * totalSupply;
            return (
              <div
                key={segment.key}
                className="flex items-center justify-between p-3 rounded-lg bg-cyber-dark/50 hover:bg-cyber-dark transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{segment.label}</span>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold" style={{ color: segment.color }}>
                    {segment.value}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {tokens.toLocaleString()} {tokenSymbol}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total Supply */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Total Supply</span>
          <span className="font-mono font-bold text-lg">
            {totalSupply.toLocaleString()} {tokenSymbol}
          </span>
        </div>
      </div>
    </div>
  );
}

// Simple horizontal bar version for smaller spaces
export function TokenomicsBar({ data }: { data: TokenomicsData }) {
  const segments = useMemo(() => {
    return [
      { key: 'community', value: data.communityAllocation || 0, color: COLORS.community, label: 'Public' },
      { key: 'liquidity', value: data.liquidityAllocation || 0, color: COLORS.liquidity, label: 'Liquidity' },
      { key: 'team', value: data.teamAllocation || 0, color: COLORS.team, label: 'Team' },
      { key: 'marketing', value: data.marketingAllocation || 0, color: COLORS.marketing, label: 'Marketing' },
      { key: 'reserve', value: data.reserveAllocation || 0, color: COLORS.reserve, label: 'Reserve' },
    ].filter(item => item.value > 0);
  }, [data]);

  if (segments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="h-3 rounded-full overflow-hidden flex bg-gray-800">
        {segments.map((segment) => (
          <div
            key={segment.key}
            className="h-full transition-all duration-300"
            style={{
              width: `${segment.value}%`,
              backgroundColor: segment.color,
            }}
            title={`${segment.label}: ${segment.value}%`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map((segment) => (
          <div key={segment.key} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-400">{segment.label}</span>
            <span className="font-mono" style={{ color: segment.color }}>
              {segment.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
