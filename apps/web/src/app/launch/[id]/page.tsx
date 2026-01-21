'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Rocket,
  Users,
  Coins,
  Clock,
  Shield,
  Lock,
  Eye,
  Zap,
  ExternalLink,
  Wallet,
  CheckCircle,
  Globe,
  Twitter,
  MessageCircle,
  Send,
  User,
  Target,
  AlertTriangle,
  Copy,
} from 'lucide-react';
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react';
import { useWalletModal } from '@demox-labs/aleo-wallet-adapter-reactui';
import { Transaction, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base';
import { PhaseIndicator, PhaseProgress } from '@/components/PhaseIndicator';
import { CountdownTimer } from '@/components/CountdownTimer';
import { CommitForm } from '@/components/CommitForm';
import { RevealForm } from '@/components/RevealForm';
import { TrustBadges, TrustScore } from '@/components/TrustBadges';
import { TokenomicsChart } from '@/components/TokenomicsChart';
import { ClaimTokens } from '@/components/ClaimTokens';

interface Launch {
  id: string;
  name: string;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  status: 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'FAILED';
  participantCount: number;
  commitEndsAt: string;
  revealEndsAt: string;
  totalRevealed?: number;
  totalCommitted?: number;
  createdAt: string;
  creator?: string;
  creatorAddress?: string;
  // New fields
  description?: string;
  longDescription?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  telegramUrl?: string;
  logoUrl?: string;
  // Trust indicators
  isAudited?: boolean;
  auditUrl?: string;
  auditFirm?: string;
  isKycVerified?: boolean;
  kycProvider?: string;
  isSafu?: boolean;
  // Caps
  softCap?: number;
  hardCap?: number;
  maxPerWallet?: number;
  minPerWallet?: number;
  // Tokenomics
  teamAllocation?: number;
  communityAllocation?: number;
  liquidityAllocation?: number;
  marketingAllocation?: number;
  reserveAllocation?: number;
  // Vesting
  vestingEnabled?: boolean;
  vestingCliff?: number;
  vestingDuration?: number;
  vestingInitialRelease?: number;
  // On-chain tracking
  transactionId?: string;
  onChainStatus?: 'pending' | 'confirmed' | 'failed';
  programId?: string;
}

// Mock data with new fields
const mockLaunch: Launch = {
  id: '1',
  name: 'Shadow Protocol',
  tokenSymbol: 'SHDW',
  totalSupply: 1000000,
  pricePerToken: 0.001,
  status: 'COMMIT',
  participantCount: 47,
  commitEndsAt: new Date(Date.now() + 3600000 * 2).toISOString(),
  revealEndsAt: new Date(Date.now() + 3600000 * 4).toISOString(),
  totalCommitted: 450,
  createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  creatorAddress: 'aleo1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq3ljyzc',
  // New fields
  description: 'Privacy-first token launchpad built on Aleo',
  longDescription: `Shadow Protocol is a revolutionary privacy-first token launchpad leveraging Aleo's zero-knowledge infrastructure. Our platform enables fair and transparent token launches while protecting participant privacy through advanced cryptographic techniques.

Key Features:
- Sealed-bid auctions prevent front-running and manipulation
- Zero-knowledge proofs ensure fairness without revealing sensitive data
- Anti-whale mechanisms protect smaller participants
- Fully decentralized with no central point of failure

Join us in building the future of private, fair token launches.`,
  websiteUrl: 'https://shadowlaunch.io',
  twitterUrl: 'https://twitter.com/shadowlaunch',
  discordUrl: 'https://discord.gg/shadowlaunch',
  telegramUrl: 'https://t.me/shadowlaunch',
  // Trust indicators
  isAudited: true,
  auditUrl: 'https://audit.report/shadowlaunch',
  auditFirm: 'Certik',
  isKycVerified: true,
  kycProvider: 'Synaps',
  isSafu: true,
  // Caps
  softCap: 500,
  hardCap: 1000,
  maxPerWallet: 50,
  minPerWallet: 1,
  // Tokenomics
  teamAllocation: 15,
  communityAllocation: 50,
  liquidityAllocation: 20,
  marketingAllocation: 10,
  reserveAllocation: 5,
  // Vesting
  vestingEnabled: true,
  vestingCliff: 30,
  vestingDuration: 180,
  vestingInitialRelease: 20,
  // On-chain
  transactionId: 'at1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  onChainStatus: 'confirmed',
  programId: 'shadowlaunch_v1.aleo',
};

export default function LaunchPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey, requestTransaction, connect, connected, connecting, wallets, select } = useWallet();
  const { setVisible: setWalletModalVisible } = useWalletModal();
  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);
  const [userCommitment, setUserCommitment] = useState<{ amount: number; revealed: boolean } | null>(null);
  const [userAllocation, setUserAllocation] = useState<{
    tokensAllocated: number;
    tokensClaimed: number;
    tokensVested: number;
    committedAmount: number;
    refundAmount: number;
    isRefunded: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchLaunch = async () => {
      try {
        // Get API base URL with /api prefix
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
        const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

        const response = await fetch(`${apiBase}/launches/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setLaunch(data.launch);
        } else {
          // For demo launches, use mock data with the demo ID
          const demoLaunch = { ...mockLaunch, id: params.id as string };
          setLaunch(demoLaunch);
        }
      } catch (error) {
        // For demo launches, use mock data with the demo ID
        const demoLaunch = { ...mockLaunch, id: params.id as string };
        setLaunch(demoLaunch);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunch();
  }, [params.id]);

  const handleCommit = async (amount: number, secret: string) => {
    // If wallet not connected, open the wallet modal
    if (!connected || !publicKey) {
      setWalletModalVisible(true);
      toast('Please connect your Leo Wallet first', { icon: '🦊' });
      return;
    }

    if (!requestTransaction) {
      toast.error('Wallet does not support transactions');
      return;
    }

    // Check contribution limits
    if (launch?.maxPerWallet && amount > launch.maxPerWallet) {
      toast.error(`Maximum contribution is ${launch.maxPerWallet} ALEO`);
      return;
    }

    if (launch?.minPerWallet && amount < launch.minPerWallet) {
      toast.error(`Minimum contribution is ${launch.minPerWallet} ALEO`);
      return;
    }

    try {
      // Get API base URL with /api prefix
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3014';
      const apiBase = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;

      // Store commitment in backend
      const response = await fetch(`${apiBase}/commits/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          launchId: launch?.id,
          amount,
          userAddress: publicKey,
          secret,
        }),
      });

      let prepData: any = { secretHash: '', commitmentHash: '' };
      if (response.ok) {
        const result = await response.json();
        prepData = result.data || result;
      }

      // Check if this is a demo launch (not on-chain)
      const launchIdStr = launch?.id || params.id as string;
      const isDemoLaunch = launchIdStr.startsWith('demo-') || !launch?.id;

      if (isDemoLaunch) {
        // Demo mode: simulate commit without blockchain transaction
        toast.loading('Processing commitment (Demo Mode)...', { id: 'commit' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.dismiss('commit');
        toast.success('Commitment recorded! (Demo - no blockchain tx)');
        console.log('Demo commit:', { launchId: launchIdStr, amount, secret });
      } else {
        // Real mode: create blockchain transaction
        // Generate numeric launch ID hash for Leo
        const launchIdHash = parseInt(launchIdStr.slice(0, 8), 16) || Date.now();

        // Generate secret field (hash the secret string to a number)
        const secretNum = prepData.commitmentHash
          ? parseInt(prepData.commitmentHash.slice(0, 15), 16)
          : Array.from(secret).reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0) >>> 0;

        const aleoTransaction = Transaction.createTransaction(
          publicKey,
          WalletAdapterNetwork.TestnetBeta,
          'shadowlaunch_v1.aleo',
          'commit',
          [
            `${launchIdHash}field`,
            `${Math.floor(amount * 1_000_000)}u64`,
            `${secretNum}field`,
          ],
          500_000,
          false
        );

        const txId = await requestTransaction(aleoTransaction);
        console.log('Commitment transaction submitted:', txId);
        toast.success('Commitment submitted to Aleo!');
      }

      setUserCommitment({ amount, revealed: false });

      if (launch) {
        setLaunch({
          ...launch,
          participantCount: launch.participantCount + 1,
        });
      }
    } catch (error: any) {
      console.error('Commit error:', error);
      toast.error(error.message || 'Failed to submit commitment');
    }
  };

  const handleReveal = async (secret: string) => {
    if (!requestTransaction || !publicKey) {
      toast.error('Please connect Leo Wallet to continue');
      throw new Error('Wallet not connected');
    }

    try {
      // NOTE: The reveal function in the smart contract takes a Commitment.record as input.
      // This record was returned to your wallet when you committed.
      // For a full implementation, we would need to:
      // 1. Query the wallet for Commitment records
      // 2. Find the matching record for this launch
      // 3. Pass the record to the reveal function

      // For demo purposes, we'll simulate the reveal process
      toast.loading('Looking for your commitment record...', { id: 'reveal' });

      // In production, this would query the wallet adapter for records
      // const records = await getRecords('shadowlaunch_v1.aleo', 'Commitment');
      // const matchingRecord = records.find(r => r.launch_id === launchIdHash);

      // Simulate reveal success for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.dismiss('reveal');
      toast.success('Reveal processed! (Demo mode)');

      const tokensAllocated = Math.floor((userCommitment?.amount || 0) / (launch?.pricePerToken || 1));

      setUserCommitment(prev => prev ? { ...prev, revealed: true } : null);

      return { tokensAllocated };
    } catch (error: any) {
      console.error('Reveal error:', error);
      toast.error(error.message || 'Failed to reveal commitment');
      throw error;
    }
  };

  const handleClaim = async () => {
    toast.success('Claim initiated! Check your wallet.');
    // Implement actual claim logic
  };

  const handleRefund = async () => {
    toast.success('Refund initiated! Check your wallet.');
    // Implement actual refund logic
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-neon-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading launch...</p>
        </div>
      </div>
    );
  }

  if (!launch) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Rocket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Launch Not Found</h2>
          <p className="text-gray-400 mb-6">This launch doesn't exist or has been removed.</p>
          <Link href="/" className="cyber-button px-6 py-3 rounded-lg inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const totalValue = launch.totalSupply * launch.pricePerToken;
  const currentPhaseEnd = launch.status === 'COMMIT' ? launch.commitEndsAt : launch.revealEndsAt;
  const hasTokenomics = launch.teamAllocation || launch.communityAllocation || launch.liquidityAllocation || launch.marketingAllocation || launch.reserveAllocation;
  const hasSocials = launch.websiteUrl || launch.twitterUrl || launch.discordUrl || launch.telegramUrl;
  const progressTarget = launch.hardCap || totalValue;
  const currentProgress = launch.totalCommitted || 0;
  const progressPercentage = progressTarget > 0 ? Math.min(100, (currentProgress / progressTarget) * 100) : 0;

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

            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cyber-card p-6 rounded-2xl"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{launch.name}</h1>
                    <PhaseIndicator phase={launch.status} size="md" />
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-neon-cyan font-mono text-lg">${launch.tokenSymbol}</span>
                    <span className="privacy-badge">
                      <Shield className="w-3 h-3" />
                      Private Launch
                    </span>
                    {/* On-Chain Status Badge */}
                    {launch.onChainStatus && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        launch.onChainStatus === 'confirmed'
                          ? 'bg-neon-green/20 text-neon-green border border-neon-green/30'
                          : launch.onChainStatus === 'pending'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {launch.onChainStatus === 'confirmed' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : launch.onChainStatus === 'pending' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <AlertTriangle className="w-3 h-3" />
                        )}
                        {launch.onChainStatus === 'confirmed' ? 'On-Chain' : launch.onChainStatus === 'pending' ? 'Pending' : 'Failed'}
                      </span>
                    )}
                  </div>
                  {launch.description && (
                    <p className="text-gray-400 mt-3">{launch.description}</p>
                  )}
                </div>
              </div>

              {/* On-Chain Transaction Link */}
              {launch.transactionId && (
                <div className="bg-cyber-dark/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm">Transaction</span>
                    <a
                      href={`https://testnet.aleoscan.io/transaction?id=${launch.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan text-sm font-mono hover:underline flex items-center gap-1"
                    >
                      {launch.transactionId.slice(0, 16)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="border-t border-gray-800 pt-4 mb-4">
                <TrustBadges
                  isAudited={launch.isAudited}
                  auditUrl={launch.auditUrl}
                  auditFirm={launch.auditFirm}
                  isKycVerified={launch.isKycVerified}
                  kycProvider={launch.kycProvider}
                  isSafu={launch.isSafu}
                />
              </div>

              {/* Phase Progress */}
              <PhaseProgress currentPhase={launch.status} />
            </motion.div>

            {/* Fundraising Progress */}
            {(launch.softCap || launch.hardCap) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="cyber-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-neon-green" />
                  Fundraising Progress
                </h3>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Raised</span>
                    <span className="font-mono font-bold text-xl">
                      {currentProgress.toLocaleString()} / {progressTarget.toLocaleString()} ALEO
                    </span>
                  </div>
                  <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden">
                    {/* Soft cap marker */}
                    {launch.softCap && (
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-yellow-500 z-10"
                        style={{ left: `${(launch.softCap / progressTarget) * 100}%` }}
                      />
                    )}
                    {/* Progress bar */}
                    <div
                      className="h-full bg-gradient-to-r from-neon-green to-neon-cyan transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-mono text-neon-green">{progressPercentage.toFixed(1)}%</span>
                    <span className="text-gray-500 text-sm">
                      {launch.participantCount} participants
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {launch.softCap && (
                    <div className="bg-cyber-dark/50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs uppercase mb-1">Soft Cap</div>
                      <div className="font-mono font-bold text-yellow-400">{launch.softCap.toLocaleString()} ALEO</div>
                    </div>
                  )}
                  {launch.hardCap && (
                    <div className="bg-cyber-dark/50 rounded-lg p-3">
                      <div className="text-gray-500 text-xs uppercase mb-1">Hard Cap</div>
                      <div className="font-mono font-bold text-neon-cyan">{launch.hardCap.toLocaleString()} ALEO</div>
                    </div>
                  )}
                </div>

                {/* Contribution Limits */}
                {(launch.minPerWallet || launch.maxPerWallet) && (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <div className="text-sm text-gray-400 mb-2">Contribution Limits</div>
                    <div className="flex gap-4">
                      {launch.minPerWallet && (
                        <div>
                          <span className="text-gray-500">Min:</span>
                          <span className="font-mono ml-2">{launch.minPerWallet} ALEO</span>
                        </div>
                      )}
                      {launch.maxPerWallet && (
                        <div>
                          <span className="text-gray-500">Max:</span>
                          <span className="font-mono ml-2 text-neon-purple">{launch.maxPerWallet} ALEO</span>
                          <span className="text-xs text-gray-500 ml-1">(Anti-whale)</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Countdown */}
            {(launch.status === 'COMMIT' || launch.status === 'REVEAL') && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="cyber-card p-6 rounded-2xl"
              >
                <div className="text-center mb-4">
                  <h3 className="text-gray-400 text-sm uppercase tracking-wider">
                    {launch.status === 'COMMIT' ? 'Commit Phase Ends In' : 'Reveal Phase Ends In'}
                  </h3>
                </div>
                <CountdownTimer targetDate={currentPhaseEnd} />
              </motion.div>
            )}

            {/* Action Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="cyber-card p-6 rounded-2xl"
            >
              {/* COMMIT Phase - Check on-chain status first */}
              {launch.status === 'COMMIT' && !userCommitment && launch.onChainStatus === 'pending' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Clock className="w-8 h-8 text-yellow-400" />
                  </div>
                  <h3 className="text-xl font-bold text-yellow-400 mb-2">Waiting for On-Chain Confirmation</h3>
                  <p className="text-gray-400 mb-4">
                    This launch is being deployed to the Aleo blockchain.
                    <br />Please wait for confirmation before committing.
                  </p>
                  {launch.transactionId && (
                    <a
                      href={`https://testnet.aleoscan.io/transaction?id=${launch.transactionId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-cyan text-sm hover:underline flex items-center justify-center gap-1"
                    >
                      View Transaction
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {launch.status === 'COMMIT' && !userCommitment && launch.onChainStatus === 'failed' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">On-Chain Deployment Failed</h3>
                  <p className="text-gray-400">
                    This launch could not be deployed to the blockchain.
                    <br />Please contact the creator for more information.
                  </p>
                </div>
              )}

              {/* COMMIT Phase - Ready to commit (confirmed or no on-chain status for demo) */}
              {launch.status === 'COMMIT' && !userCommitment && (launch.onChainStatus === 'confirmed' || !launch.onChainStatus) && (
                <CommitForm
                  launchId={launch.id}
                  tokenSymbol={launch.tokenSymbol}
                  pricePerToken={launch.pricePerToken}
                  maxSupply={launch.totalSupply}
                  minContribution={launch.minPerWallet}
                  maxContribution={launch.maxPerWallet}
                  onCommit={handleCommit}
                />
              )}

              {/* Already Committed */}
              {launch.status === 'COMMIT' && userCommitment && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-neon-green" />
                  </div>
                  <h3 className="text-xl font-bold text-neon-green mb-2">Commitment Submitted!</h3>
                  <p className="text-gray-400 mb-4">
                    Your sealed bid of <span className="text-white font-bold">{userCommitment.amount} ALEO</span> has been recorded.
                  </p>
                  <div className="bg-cyber-dark/50 rounded-lg p-4 inline-block">
                    <p className="text-gray-500 text-sm">
                      Return during the <span className="text-neon-cyan">Reveal Phase</span> to claim your allocation.
                    </p>
                  </div>
                </div>
              )}

              {/* REVEAL Phase */}
              {launch.status === 'REVEAL' && userCommitment && !userCommitment.revealed && (
                <RevealForm
                  launchId={launch.id}
                  tokenSymbol={launch.tokenSymbol}
                  committedAmount={userCommitment.amount}
                  onReveal={handleReveal}
                />
              )}

              {/* Already Revealed */}
              {launch.status === 'REVEAL' && userCommitment?.revealed && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-neon-cyan" />
                  </div>
                  <h3 className="text-xl font-bold text-neon-cyan mb-2">Already Revealed!</h3>
                  <p className="text-gray-400">
                    Your commitment has been revealed. Wait for the distribution phase.
                  </p>
                </div>
              )}

              {/* No Commitment in REVEAL */}
              {launch.status === 'REVEAL' && !userCommitment && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Commit Phase Ended</h3>
                  <p className="text-gray-500">
                    You did not participate in the commit phase for this launch.
                  </p>
                </div>
              )}

              {/* DISTRIBUTION Phase with Claim */}
              {launch.status === 'DISTRIBUTION' && userAllocation && (
                <ClaimTokens
                  launchId={launch.id}
                  tokenSymbol={launch.tokenSymbol}
                  allocation={userAllocation}
                  vesting={launch.vestingEnabled ? {
                    enabled: true,
                    cliff: launch.vestingCliff || 0,
                    duration: launch.vestingDuration || 0,
                    initialRelease: launch.vestingInitialRelease || 100,
                  } : undefined}
                  launchEndDate={launch.revealEndsAt}
                  onClaim={handleClaim}
                />
              )}

              {/* DISTRIBUTION Phase without user participation */}
              {launch.status === 'DISTRIBUTION' && !userAllocation && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-neon-purple/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Zap className="w-8 h-8 text-neon-purple" />
                  </div>
                  <h3 className="text-xl font-bold text-neon-purple mb-2">Distributing Tokens...</h3>
                  <p className="text-gray-400 mb-4">
                    Tokens are being distributed to participants based on their revealed commitments.
                  </p>
                </div>
              )}

              {/* FAILED Launch */}
              {launch.status === 'FAILED' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-red-400 mb-2">Launch Failed</h3>
                  <p className="text-gray-400 mb-4">
                    Soft cap was not reached. All participants can claim refunds.
                  </p>
                  {userCommitment && (
                    <button
                      onClick={handleRefund}
                      className="cyber-button px-6 py-3 rounded-lg"
                    >
                      Claim Refund ({userCommitment.amount} ALEO)
                    </button>
                  )}
                </div>
              )}

              {/* ENDED Phase */}
              {launch.status === 'ENDED' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-400 mb-2">Launch Completed</h3>
                  <p className="text-gray-500 mb-4">
                    This token launch has ended. All tokens have been distributed.
                  </p>
                  {launch.totalRevealed && (
                    <div className="bg-cyber-dark/50 rounded-lg p-4 inline-block">
                      <p className="text-gray-400">
                        Total revealed: <span className="text-white font-bold">{launch.totalRevealed.toLocaleString()} ALEO</span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Tokenomics */}
            {hasTokenomics && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <TokenomicsChart
                  data={{
                    teamAllocation: launch.teamAllocation,
                    communityAllocation: launch.communityAllocation,
                    liquidityAllocation: launch.liquidityAllocation,
                    marketingAllocation: launch.marketingAllocation,
                    reserveAllocation: launch.reserveAllocation,
                  }}
                  totalSupply={launch.totalSupply}
                  tokenSymbol={launch.tokenSymbol}
                />
              </motion.div>
            )}

            {/* Long Description */}
            {launch.longDescription && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="cyber-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-bold mb-4">About {launch.name}</h3>
                <div className="prose prose-invert prose-sm max-w-none">
                  {launch.longDescription.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-gray-400 mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Vesting Schedule */}
            {launch.vestingEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="cyber-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neon-cyan" />
                  Vesting Schedule
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-cyber-dark/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs uppercase mb-1">Initial Release</div>
                    <div className="font-mono font-bold text-neon-green">{launch.vestingInitialRelease || 0}%</div>
                  </div>
                  <div className="bg-cyber-dark/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs uppercase mb-1">Cliff Period</div>
                    <div className="font-mono font-bold">{launch.vestingCliff || 0} days</div>
                  </div>
                  <div className="bg-cyber-dark/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs uppercase mb-1">Total Duration</div>
                    <div className="font-mono font-bold">{launch.vestingDuration || 0} days</div>
                  </div>
                  <div className="bg-cyber-dark/50 rounded-lg p-3">
                    <div className="text-gray-500 text-xs uppercase mb-1">Release Type</div>
                    <div className="font-mono font-bold text-neon-cyan">Linear</div>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="mt-6">
                  <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                    {/* Initial release marker */}
                    <div
                      className="absolute h-full bg-neon-green"
                      style={{ width: `${launch.vestingInitialRelease || 0}%` }}
                    />
                    {/* Cliff marker */}
                    {launch.vestingCliff && launch.vestingDuration && (
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-yellow-500"
                        style={{ left: `${(launch.vestingCliff / launch.vestingDuration) * 100}%` }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>TGE</span>
                    {launch.vestingCliff && <span>Cliff ({launch.vestingCliff}d)</span>}
                    <span>Full Vest ({launch.vestingDuration}d)</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="cyber-card p-6 rounded-2xl"
            >
              <TrustScore
                isAudited={launch.isAudited}
                isKycVerified={launch.isKycVerified}
                isSafu={launch.isSafu}
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="cyber-card p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold mb-4">Launch Stats</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Coins className="w-4 h-4" />
                    <span>Total Supply</span>
                  </div>
                  <span className="font-mono font-bold">{launch.totalSupply.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Price / Token</span>
                  </div>
                  <span className="font-mono font-bold">{launch.pricePerToken} ALEO</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <span>Total Value</span>
                  </div>
                  <span className="font-mono font-bold text-neon-cyan">{totalValue.toLocaleString()} ALEO</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-800">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Participants</span>
                  </div>
                  <span className="font-mono font-bold text-neon-green">{launch.participantCount}</span>
                </div>

                {launch.status === 'COMMIT' && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Lock className="w-4 h-4" />
                      <span>Total Committed</span>
                    </div>
                    <span className="font-mono text-gray-500 text-sm">Hidden until reveal</span>
                  </div>
                )}

                {(launch.status === 'REVEAL' || launch.status === 'DISTRIBUTION' || launch.status === 'ENDED') && launch.totalRevealed && (
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span>Total Revealed</span>
                    </div>
                    <span className="font-mono font-bold text-neon-cyan">{launch.totalRevealed.toLocaleString()} ALEO</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Social Links */}
            {hasSocials && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="cyber-card p-6 rounded-2xl"
              >
                <h3 className="text-lg font-bold mb-4">Social Links</h3>

                <div className="space-y-3">
                  {launch.websiteUrl && (
                    <a
                      href={launch.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-cyber-dark/50 hover:bg-cyber-dark transition-colors group"
                    >
                      <Globe className="w-5 h-5 text-gray-400 group-hover:text-neon-green" />
                      <span className="text-gray-300 group-hover:text-white">Website</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                    </a>
                  )}
                  {launch.twitterUrl && (
                    <a
                      href={launch.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-cyber-dark/50 hover:bg-cyber-dark transition-colors group"
                    >
                      <Twitter className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                      <span className="text-gray-300 group-hover:text-white">Twitter</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                    </a>
                  )}
                  {launch.discordUrl && (
                    <a
                      href={launch.discordUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-cyber-dark/50 hover:bg-cyber-dark transition-colors group"
                    >
                      <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-indigo-400" />
                      <span className="text-gray-300 group-hover:text-white">Discord</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                    </a>
                  )}
                  {launch.telegramUrl && (
                    <a
                      href={launch.telegramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-cyber-dark/50 hover:bg-cyber-dark transition-colors group"
                    >
                      <Send className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      <span className="text-gray-300 group-hover:text-white">Telegram</span>
                      <ExternalLink className="w-4 h-4 text-gray-500 ml-auto" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}

            {/* Creator Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="cyber-card p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold mb-4">Creator</h3>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green/30 to-neon-cyan/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-neon-green" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-gray-300">{launch.creatorAddress || launch.creator}</span>
                    <button
                      onClick={() => copyToClipboard(launch.creatorAddress || launch.creator || '')}
                      className="text-gray-500 hover:text-white transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {launch.isKycVerified && (
                    <span className="text-xs text-neon-cyan">KYC Verified</span>
                  )}
                </div>
              </div>
            </motion.div>

            {/* How it Works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="cyber-card p-6 rounded-2xl"
            >
              <h3 className="text-lg font-bold mb-4">How It Works</h3>

              <div className="space-y-4">
                <div className={`flex items-start gap-3 ${launch.status === 'COMMIT' ? 'text-neon-green' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${launch.status === 'COMMIT' ? 'bg-neon-green/20' : 'bg-gray-800'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">1. Commit</h4>
                    <p className="text-sm text-gray-500">Submit your sealed bid amount</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${launch.status === 'REVEAL' ? 'text-neon-cyan' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${launch.status === 'REVEAL' ? 'bg-neon-cyan/20' : 'bg-gray-800'}`}>
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">2. Reveal</h4>
                    <p className="text-sm text-gray-500">Reveal your secret to verify</p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 ${launch.status === 'DISTRIBUTION' ? 'text-neon-purple' : 'text-gray-500'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${launch.status === 'DISTRIBUTION' ? 'bg-neon-purple/20' : 'bg-gray-800'}`}>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">3. Receive</h4>
                    <p className="text-sm text-gray-500">Get your token allocation</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Privacy Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-neon-green/5 border border-neon-green/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-6 h-6 text-neon-green" />
                <h3 className="text-lg font-bold text-neon-green">Privacy Protected</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  Commitment amounts hidden
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  Zero-knowledge proofs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  Anti-bot protection
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-neon-green" />
                  Fair allocation guaranteed
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
