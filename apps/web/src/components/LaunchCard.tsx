'use client';

import Link from 'next/link';
import { Users, Clock, Coins, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { PhaseIndicator } from './PhaseIndicator';
import { CountdownTimer } from './CountdownTimer';
import { TrustBadgesCompact } from './TrustBadges';

interface Launch {
  id: string;
  name: string;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  status: 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'FAILED';
  participantCount: number;
  endsAt: string;
  totalRevealed?: number;
  // Trust indicators
  isAudited?: boolean;
  isKycVerified?: boolean;
  isSafu?: boolean;
  // Caps
  softCap?: number;
  hardCap?: number;
  totalCommitted?: number;
}

interface LaunchCardProps {
  launch: Launch;
}

export function LaunchCard({ launch }: LaunchCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const totalValue = launch.totalSupply * launch.pricePerToken;
  const hasTrustBadges = launch.isAudited || launch.isKycVerified || launch.isSafu;

  // Calculate progress percentage
  const progressTarget = launch.hardCap || totalValue;
  const currentProgress = launch.totalCommitted || 0;
  const progressPercentage = progressTarget > 0 ? Math.min(100, (currentProgress / progressTarget) * 100) : 0;
  const softCapPercentage = launch.softCap && progressTarget > 0 ? (launch.softCap / progressTarget) * 100 : 0;

  return (
    <Link href={`/launch/${launch.id}`}>
      <div className="cyber-card p-6 rounded-xl group cursor-pointer h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-white group-hover:text-neon-green transition-colors">
                {launch.name}
              </h3>
              {hasTrustBadges && (
                <TrustBadgesCompact
                  isAudited={launch.isAudited}
                  isKycVerified={launch.isKycVerified}
                  isSafu={launch.isSafu}
                />
              )}
            </div>
            <span className="text-neon-cyan font-mono text-sm">${launch.tokenSymbol}</span>
          </div>
          <PhaseIndicator phase={launch.status} />
        </div>

        {/* Fundraising Progress (if applicable) */}
        {(launch.status === 'COMMIT' || launch.status === 'REVEAL') && (launch.hardCap || launch.softCap) && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Raised</span>
              <span className="text-xs font-mono">
                {formatNumber(currentProgress)} / {formatNumber(progressTarget)} ALEO
              </span>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              {/* Soft cap marker */}
              {softCapPercentage > 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-yellow-500 z-10"
                  style={{ left: `${softCapPercentage}%` }}
                  title={`Soft cap: ${formatNumber(launch.softCap || 0)} ALEO`}
                />
              )}
              {/* Progress bar */}
              <div
                className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">{progressPercentage.toFixed(1)}%</span>
              {launch.softCap && (
                <span className="text-xs text-yellow-500">
                  Soft cap: {formatNumber(launch.softCap)} ALEO
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6 flex-grow">
          <div className="bg-cyber-black/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Supply</div>
            <div className="font-mono text-white font-bold">
              {formatNumber(launch.totalSupply)}
            </div>
          </div>
          <div className="bg-cyber-black/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Price</div>
            <div className="font-mono text-white font-bold">
              {launch.pricePerToken} ALEO
            </div>
          </div>
          <div className="bg-cyber-black/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              Participants
            </div>
            <div className="font-mono text-neon-green font-bold">
              {launch.participantCount}
            </div>
          </div>
          <div className="bg-cyber-black/50 rounded-lg p-3">
            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3 h-3" />
              {launch.hardCap ? 'Hard Cap' : 'Total Value'}
            </div>
            <div className="font-mono text-neon-cyan font-bold">
              {formatNumber(launch.hardCap || totalValue)} ALEO
            </div>
          </div>
        </div>

        {/* Countdown or Status */}
        <div className="border-t border-neon-green/10 pt-4">
          {launch.status === 'COMMIT' || launch.status === 'REVEAL' ? (
            <div className="flex items-center justify-between">
              <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {launch.status === 'COMMIT' ? 'Commit ends in' : 'Reveal ends in'}
              </div>
              <CountdownTimer targetDate={launch.endsAt} compact />
            </div>
          ) : launch.status === 'DISTRIBUTION' ? (
            <div className="flex items-center justify-between">
              <span className="text-neon-purple text-sm font-medium">Distributing tokens...</span>
              <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
            </div>
          ) : launch.status === 'FAILED' ? (
            <div className="flex items-center justify-between">
              <span className="text-red-400 text-sm font-medium">Launch failed - Refunds available</span>
              <Target className="w-4 h-4 text-red-400" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Launch ended</span>
              {launch.totalRevealed && (
                <span className="text-gray-400 font-mono text-sm">
                  {formatNumber(launch.totalRevealed)} revealed
                </span>
              )}
            </div>
          )}
        </div>

        {/* Hover indicator */}
        <div className="flex items-center justify-center mt-4 text-neon-green opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm mr-2">View Launch</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
}
