'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Rocket,
  Plus,
  Users,
  Coins,
  Clock,
  Eye,
  BarChart3,
  ArrowRight,
  Shield,
  TrendingUp,
  CheckCircle,
  Wallet,
  Gift,
  AlertTriangle,
  RefreshCw,
  Lock,
  Unlock,
  ExternalLink,
} from 'lucide-react';
import { PhaseIndicator } from '@/components/PhaseIndicator';
import { CountdownTimer } from '@/components/CountdownTimer';
import { TrustBadgesCompact } from '@/components/TrustBadges';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';

interface Launch {
  id: string;
  name: string;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  status: 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'FAILED';
  participantCount: number;
  totalRevealed?: number;
  totalCommitted?: number;
  commitEndsAt: string;
  revealEndsAt: string;
  createdAt: string;
  creatorAddress?: string;
  softCap?: number;
  hardCap?: number;
  isAudited?: boolean;
  isKycVerified?: boolean;
  isSafu?: boolean;
}

interface Participation {
  launchId: string;
  launchName: string;
  tokenSymbol: string;
  status: string;
  committedAmount: number;
  tokensAllocated: number;
  claimed: boolean;
  refunded: boolean;
  refundAmount: number;
  vestingEnabled: boolean;
  claimable: boolean;
  refundable: boolean;
}

interface DashboardStats {
  totalLaunches: number;
  activeLaunches: number;
  totalParticipants: number;
  totalValueLocked: number;
}

interface PortfolioStats {
  totalCommitted: number;
  totalTokensAllocated: number;
  totalClaimable: number;
  totalRefundable: number;
  activeParticipations: number;
}

// Mock data for participations (when API is not available)
const mockParticipations: Participation[] = [
  {
    launchId: '1',
    launchName: 'Shadow Protocol',
    tokenSymbol: 'SHDW',
    status: 'COMMIT',
    committedAmount: 50,
    tokensAllocated: 0,
    claimed: false,
    refunded: false,
    refundAmount: 0,
    vestingEnabled: false,
    claimable: false,
    refundable: false,
  },
  {
    launchId: '2',
    launchName: 'Stealth Finance',
    tokenSymbol: 'STLTH',
    status: 'DISTRIBUTION',
    committedAmount: 100,
    tokensAllocated: 20000,
    claimed: false,
    refunded: false,
    refundAmount: 10,
    vestingEnabled: true,
    claimable: true,
    refundable: false,
  },
  {
    launchId: '3',
    launchName: 'Failed Project',
    tokenSymbol: 'FAIL',
    status: 'FAILED',
    committedAmount: 25,
    tokensAllocated: 0,
    claimed: false,
    refunded: false,
    refundAmount: 25,
    vestingEnabled: false,
    claimable: false,
    refundable: true,
  },
];

// Mock stats
const mockStats: DashboardStats = {
  totalLaunches: 3,
  activeLaunches: 2,
  totalParticipants: 370,
  totalValueLocked: 1225,
};

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [portfolioStats, setPortfolioStats] = useState<PortfolioStats>({
    totalCommitted: 0,
    totalTokensAllocated: 0,
    totalClaimable: 0,
    totalRefundable: 0,
    activeParticipations: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'launches' | 'participation'>('participation');
  const [filter, setFilter] = useState<'all' | 'active' | 'ended' | 'failed'>('all');
  const [claiming, setClaiming] = useState<string | null>(null);
  const [refunding, setRefunding] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get API base URL with /api prefix
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
        const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

        // Fetch launches
        const launchResponse = await fetch(`${apiBase}/launches`);
        if (launchResponse.ok) {
          const data = await launchResponse.json();
          setLaunches(data.launches || []);
          setStats(data.stats || mockStats);
        }

        // For now, use mock participations (API would need user auth)
        setParticipations(mockParticipations);

        // Calculate portfolio stats
        const portfolio = mockParticipations.reduce(
          (acc, p) => ({
            totalCommitted: acc.totalCommitted + p.committedAmount,
            totalTokensAllocated: acc.totalTokensAllocated + p.tokensAllocated,
            totalClaimable: acc.totalClaimable + (p.claimable && !p.claimed ? p.tokensAllocated : 0),
            totalRefundable: acc.totalRefundable + (p.refundable && !p.refunded ? p.refundAmount : 0),
            activeParticipations: acc.activeParticipations + (p.status !== 'ENDED' && p.status !== 'FAILED' ? 1 : 0),
          }),
          {
            totalCommitted: 0,
            totalTokensAllocated: 0,
            totalClaimable: 0,
            totalRefundable: 0,
            activeParticipations: 0,
          }
        );
        setPortfolioStats(portfolio);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setParticipations(mockParticipations);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [publicKey]);

  const filteredLaunches = launches.filter((launch) => {
    if (filter === 'all') return true;
    if (filter === 'active') return launch.status !== 'ENDED' && launch.status !== 'FAILED';
    if (filter === 'ended') return launch.status === 'ENDED';
    if (filter === 'failed') return launch.status === 'FAILED';
    return true;
  });

  const filteredParticipations = participations.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'active') return p.status !== 'ENDED' && p.status !== 'FAILED';
    if (filter === 'ended') return p.status === 'ENDED';
    if (filter === 'failed') return p.status === 'FAILED';
    return true;
  });

  const handleClaim = async (launchId: string) => {
    if (!publicKey) return;
    setClaiming(launchId);
    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update participation
      setParticipations((prev) =>
        prev.map((p) =>
          p.launchId === launchId ? { ...p, claimed: true, claimable: false } : p
        )
      );
    } finally {
      setClaiming(null);
    }
  };

  const handleRefund = async (launchId: string) => {
    if (!publicKey) return;
    setRefunding(launchId);
    try {
      // Simulate transaction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update participation
      setParticipations((prev) =>
        prev.map((p) =>
          p.launchId === launchId ? { ...p, refunded: true, refundable: false } : p
        )
      );
    } finally {
      setRefunding(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMMIT':
        return 'text-neon-green';
      case 'REVEAL':
        return 'text-neon-cyan';
      case 'DISTRIBUTION':
        return 'text-neon-purple';
      case 'ENDED':
        return 'text-gray-400';
      case 'FAILED':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-cyber-black/80 backdrop-blur-md border-b border-neon-green/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
                <Rocket className="w-6 h-6 text-cyber-black" />
              </div>
              <span className="font-display font-bold text-xl tracking-wider">
                SHADOW<span className="text-neon-green">LAUNCH</span>
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
              </Link>
              <Link
                href="/create"
                className="cyber-button px-4 py-2 rounded-lg text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Launch
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Track your launches and participations</p>
        </motion.div>

        {/* Portfolio Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
        >
          <div className="cyber-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-neon-green/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-neon-green" />
              </div>
              <span className="text-gray-400 text-xs">Total Committed</span>
            </div>
            <div className="text-2xl font-bold font-mono">{portfolioStats.totalCommitted}</div>
            <div className="text-gray-500 text-xs">ALEO</div>
          </div>

          <div className="cyber-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-neon-cyan/20 flex items-center justify-center">
                <Coins className="w-5 h-5 text-neon-cyan" />
              </div>
              <span className="text-gray-400 text-xs">Tokens Allocated</span>
            </div>
            <div className="text-2xl font-bold font-mono text-neon-cyan">
              {portfolioStats.totalTokensAllocated.toLocaleString()}
            </div>
          </div>

          <div className="cyber-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-neon-purple/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-neon-purple" />
              </div>
              <span className="text-gray-400 text-xs">Claimable</span>
            </div>
            <div className="text-2xl font-bold font-mono text-neon-purple">
              {portfolioStats.totalClaimable.toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs">tokens</div>
          </div>

          <div className="cyber-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Unlock className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-gray-400 text-xs">Refundable</span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-400">
              {portfolioStats.totalRefundable}
            </div>
            <div className="text-gray-500 text-xs">ALEO</div>
          </div>

          <div className="cyber-card p-5 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg bg-neon-pink/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neon-pink" />
              </div>
              <span className="text-gray-400 text-xs">Active</span>
            </div>
            <div className="text-2xl font-bold font-mono text-neon-pink">
              {portfolioStats.activeParticipations}
            </div>
            <div className="text-gray-500 text-xs">participations</div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4 mb-6 border-b border-gray-800 pb-4"
        >
          <button
            onClick={() => setActiveTab('participation')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'participation'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            My Participation
          </button>
          <button
            onClick={() => setActiveTab('launches')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'launches'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Rocket className="w-4 h-4" />
            My Launches
          </button>
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-6"
        >
          {(['all', 'active', 'ended', 'failed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? f === 'failed'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                  : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* My Participation Tab */}
        {activeTab === 'participation' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cyber-card p-6 rounded-xl animate-pulse">
                    <div className="h-6 bg-cyber-light rounded w-1/3 mb-4" />
                    <div className="h-4 bg-cyber-light rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredParticipations.length > 0 ? (
              <div className="space-y-4">
                {filteredParticipations.map((participation, index) => (
                  <motion.div
                    key={participation.launchId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="cyber-card p-6 rounded-xl"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                          <Coins className="w-6 h-6 text-neon-cyan" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/launch/${participation.launchId}`}
                              className="text-lg font-bold hover:text-neon-green transition-colors"
                            >
                              {participation.launchName}
                            </Link>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(
                                participation.status
                              )} border-current/30 bg-current/10`}
                            >
                              {participation.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span className="font-mono text-neon-cyan">
                              ${participation.tokenSymbol}
                            </span>
                            <span>Committed: {participation.committedAmount} ALEO</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Allocation Info */}
                        {participation.tokensAllocated > 0 && (
                          <div className="text-right">
                            <div className="text-gray-500 text-xs">Allocated</div>
                            <div className="font-mono font-bold text-neon-green">
                              {participation.tokensAllocated.toLocaleString()} {participation.tokenSymbol}
                            </div>
                            {participation.vestingEnabled && (
                              <div className="text-xs text-neon-purple flex items-center gap-1 justify-end">
                                <Lock className="w-3 h-3" /> Vesting
                              </div>
                            )}
                          </div>
                        )}

                        {/* Refund Info */}
                        {participation.refundAmount > 0 && !participation.refunded && (
                          <div className="text-right">
                            <div className="text-gray-500 text-xs">Refund Available</div>
                            <div className="font-mono font-bold text-neon-purple">
                              {participation.refundAmount} ALEO
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {/* Claim Button */}
                          {participation.claimable && !participation.claimed && (
                            <button
                              onClick={() => handleClaim(participation.launchId)}
                              disabled={claiming === participation.launchId}
                              className="cyber-button px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                              {claiming === participation.launchId ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Claiming...
                                </>
                              ) : (
                                <>
                                  <Gift className="w-4 h-4" />
                                  Claim
                                </>
                              )}
                            </button>
                          )}

                          {/* Claimed Badge */}
                          {participation.claimed && (
                            <div className="flex items-center gap-1 text-neon-green text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Claimed
                            </div>
                          )}

                          {/* Refund Button */}
                          {participation.refundable && !participation.refunded && (
                            <button
                              onClick={() => handleRefund(participation.launchId)}
                              disabled={refunding === participation.launchId}
                              className="px-4 py-2 rounded-lg text-sm flex items-center gap-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            >
                              {refunding === participation.launchId ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-4 h-4" />
                                  Refund
                                </>
                              )}
                            </button>
                          )}

                          {/* Refunded Badge */}
                          {participation.refunded && (
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <CheckCircle className="w-4 h-4" />
                              Refunded
                            </div>
                          )}

                          {/* View Launch */}
                          <Link
                            href={`/launch/${participation.launchId}`}
                            className="p-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Status Bar for Pending Status */}
                    {participation.status === 'COMMIT' && (
                      <div className="mt-4 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg flex items-center gap-2">
                        <Clock className="w-4 h-4 text-neon-green" />
                        <span className="text-sm text-neon-green">
                          Waiting for commit phase to end. Your commitment is recorded.
                        </span>
                      </div>
                    )}

                    {participation.status === 'REVEAL' && (
                      <div className="mt-4 p-3 bg-neon-cyan/5 border border-neon-cyan/20 rounded-lg flex items-center gap-2">
                        <Eye className="w-4 h-4 text-neon-cyan" />
                        <span className="text-sm text-neon-cyan">
                          Reveal phase active. Allocation will be calculated soon.
                        </span>
                      </div>
                    )}

                    {participation.status === 'FAILED' && !participation.refunded && (
                      <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400">
                          Launch failed to reach soft cap. Your full commitment is available for refund.
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="cyber-card p-12 rounded-xl text-center">
                <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Participations Found</h3>
                <p className="text-gray-400 mb-6">
                  {filter === 'all'
                    ? "You haven't participated in any launches yet."
                    : `No ${filter} participations found.`}
                </p>
                <Link
                  href="/"
                  className="cyber-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  Explore Launches
                </Link>
              </div>
            )}
          </motion.div>
        )}

        {/* My Launches Tab */}
        {activeTab === 'launches' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="cyber-card p-6 rounded-xl animate-pulse">
                    <div className="h-6 bg-cyber-light rounded w-1/3 mb-4" />
                    <div className="h-4 bg-cyber-light rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredLaunches.length > 0 ? (
              <div className="space-y-4">
                {filteredLaunches.map((launch, index) => (
                  <motion.div
                    key={launch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={`/launch/${launch.id}`}>
                      <div className="cyber-card p-6 rounded-xl group cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 flex items-center justify-center">
                              <Rocket className="w-6 h-6 text-neon-green" />
                            </div>
                            <div>
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold group-hover:text-neon-green transition-colors">
                                  {launch.name}
                                </h3>
                                <PhaseIndicator phase={launch.status} size="sm" />
                                <TrustBadgesCompact
                                  isAudited={launch.isAudited}
                                  isKycVerified={launch.isKycVerified}
                                  isSafu={launch.isSafu}
                                />
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                <span className="font-mono text-neon-cyan">${launch.tokenSymbol}</span>
                                <span>Created {formatDate(launch.createdAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            {/* Stats */}
                            <div className="hidden md:flex items-center gap-6">
                              <div className="text-right">
                                <div className="text-gray-500 text-xs uppercase tracking-wider">Participants</div>
                                <div className="font-mono font-bold text-neon-green">{launch.participantCount}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-gray-500 text-xs uppercase tracking-wider">Supply</div>
                                <div className="font-mono">{launch.totalSupply.toLocaleString()}</div>
                              </div>
                              {launch.status !== 'ENDED' && launch.status !== 'FAILED' && (
                                <div className="text-right">
                                  <div className="text-gray-500 text-xs uppercase tracking-wider">
                                    {launch.status === 'COMMIT' ? 'Commit ends' : 'Reveal ends'}
                                  </div>
                                  <CountdownTimer
                                    targetDate={launch.status === 'COMMIT' ? launch.commitEndsAt : launch.revealEndsAt}
                                    compact
                                  />
                                </div>
                              )}
                              {(launch.status === 'ENDED' || launch.status === 'FAILED') && launch.totalRevealed !== undefined && (
                                <div className="text-right">
                                  <div className="text-gray-500 text-xs uppercase tracking-wider">Total Raised</div>
                                  <div className="font-mono text-neon-cyan">{launch.totalRevealed.toLocaleString()} ALEO</div>
                                </div>
                              )}
                            </div>

                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-neon-green transition-colors" />
                          </div>
                        </div>

                        {/* Mobile Stats */}
                        <div className="md:hidden grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-800">
                          <div>
                            <div className="text-gray-500 text-xs">Participants</div>
                            <div className="font-mono font-bold text-neon-green">{launch.participantCount}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">Supply</div>
                            <div className="font-mono">{launch.totalSupply.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500 text-xs">
                              {launch.status === 'ENDED' || launch.status === 'FAILED' ? 'Raised' : 'Ends in'}
                            </div>
                            {launch.status === 'ENDED' || launch.status === 'FAILED' ? (
                              <div className="font-mono">{launch.totalRevealed?.toLocaleString() || '0'}</div>
                            ) : (
                              <CountdownTimer
                                targetDate={launch.status === 'COMMIT' ? launch.commitEndsAt : launch.revealEndsAt}
                                compact
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="cyber-card p-12 rounded-xl text-center">
                <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">No Launches Found</h3>
                <p className="text-gray-400 mb-6">
                  {filter === 'all'
                    ? "You haven't created any launches yet."
                    : `No ${filter} launches found.`}
                </p>
                {filter === 'all' && (
                  <Link
                    href="/create"
                    className="cyber-button px-6 py-3 rounded-lg inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Launch
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <Link href="/create">
            <div className="cyber-card p-6 rounded-xl group cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center group-hover:bg-neon-green/30 transition-colors">
                <Plus className="w-6 h-6 text-neon-green" />
              </div>
              <div>
                <h3 className="font-bold group-hover:text-neon-green transition-colors">Create Launch</h3>
                <p className="text-gray-500 text-sm">Start a new token sale</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 ml-auto group-hover:text-neon-green transition-colors" />
            </div>
          </Link>

          <Link href="/">
            <div className="cyber-card p-6 rounded-xl group cursor-pointer flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/20 flex items-center justify-center group-hover:bg-neon-cyan/30 transition-colors">
                <Rocket className="w-6 h-6 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-bold group-hover:text-neon-cyan transition-colors">Explore Launches</h3>
                <p className="text-gray-500 text-sm">Find new opportunities</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 ml-auto group-hover:text-neon-cyan transition-colors" />
            </div>
          </Link>

          <div className="cyber-card p-6 rounded-xl flex items-center gap-4 opacity-60">
            <div className="w-12 h-12 rounded-xl bg-neon-purple/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-bold">Analytics</h3>
              <p className="text-gray-500 text-sm">Coming soon</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
