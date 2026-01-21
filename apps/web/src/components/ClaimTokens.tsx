'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Gift
} from 'lucide-react';

interface VestingSchedule {
  enabled: boolean;
  cliff: number; // days
  duration: number; // days
  initialRelease: number; // percentage
}

interface AllocationData {
  tokensAllocated: number;
  tokensClaimed: number;
  tokensVested: number;
  committedAmount: number;
  refundAmount: number;
  isRefunded: boolean;
}

interface ClaimTokensProps {
  launchId: string;
  tokenSymbol: string;
  allocation: AllocationData;
  vesting?: VestingSchedule;
  launchEndDate: string;
  onClaim: () => Promise<void>;
  onRefund?: () => Promise<void>;
  launchFailed?: boolean;
}

export function ClaimTokens({
  launchId,
  tokenSymbol,
  allocation,
  vesting,
  launchEndDate,
  onClaim,
  onRefund,
  launchFailed = false,
}: ClaimTokensProps) {
  const [claiming, setClaiming] = useState(false);
  const [refunding, setRefunding] = useState(false);

  const now = new Date();
  const endDate = new Date(launchEndDate);
  const daysSinceLaunch = Math.floor((now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));

  // Calculate vesting
  const vestingInfo = vesting?.enabled ? calculateVesting(vesting, daysSinceLaunch, allocation.tokensAllocated) : null;

  const claimableTokens = vestingInfo
    ? Math.max(0, vestingInfo.vestedAmount - allocation.tokensClaimed)
    : allocation.tokensAllocated - allocation.tokensClaimed;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim();
    } finally {
      setClaiming(false);
    }
  };

  const handleRefund = async () => {
    if (!onRefund) return;
    setRefunding(true);
    try {
      await onRefund();
    } finally {
      setRefunding(false);
    }
  };

  // Launch failed - show refund UI
  if (launchFailed && !allocation.isRefunded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6 rounded-2xl border-2 border-red-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-400">Launch Failed</h3>
            <p className="text-sm text-gray-400">Soft cap was not reached</p>
          </div>
        </div>

        <div className="bg-cyber-dark/50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Your Commitment</span>
            <span className="font-mono font-bold">{allocation.committedAmount} ALEO</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Refund Amount</span>
            <span className="font-mono font-bold text-neon-green">{allocation.committedAmount} ALEO</span>
          </div>
        </div>

        <button
          onClick={handleRefund}
          disabled={refunding}
          className="w-full py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {refunding ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing Refund...
            </>
          ) : (
            <>
              <Unlock className="w-5 h-5" />
              Claim Refund
            </>
          )}
        </button>
      </motion.div>
    );
  }

  // Already refunded
  if (allocation.isRefunded) {
    return (
      <div className="cyber-card p-6 rounded-2xl">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-gray-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-400 mb-2">Refund Completed</h3>
          <p className="text-sm text-gray-500">
            Your commitment of {allocation.committedAmount} ALEO has been refunded.
          </p>
        </div>
      </div>
    );
  }

  // All tokens claimed
  if (allocation.tokensClaimed >= allocation.tokensAllocated) {
    return (
      <div className="cyber-card p-6 rounded-2xl">
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-neon-green" />
          </div>
          <h3 className="text-lg font-bold text-neon-green mb-2">All Tokens Claimed!</h3>
          <p className="text-sm text-gray-400">
            You have claimed all {allocation.tokensAllocated.toLocaleString()} {tokenSymbol} tokens.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-6 rounded-2xl"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center">
          <Gift className="w-6 h-6 text-neon-green" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Claim Your Tokens</h3>
          <p className="text-sm text-gray-400">Your allocation is ready</p>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-400">Total Allocated</span>
          <span className="font-mono font-bold">
            {allocation.tokensAllocated.toLocaleString()} {tokenSymbol}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-b border-gray-800">
          <span className="text-gray-400">Already Claimed</span>
          <span className="font-mono text-gray-500">
            {allocation.tokensClaimed.toLocaleString()} {tokenSymbol}
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-400">Available to Claim</span>
          <span className="font-mono font-bold text-neon-green">
            {claimableTokens.toLocaleString()} {tokenSymbol}
          </span>
        </div>
      </div>

      {/* Vesting Schedule */}
      {vestingInfo && (
        <div className="bg-cyber-dark/50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-neon-cyan" />
            <span className="font-medium text-neon-cyan">Vesting Schedule</span>
          </div>

          {/* Vesting Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Vested</span>
              <span>{vestingInfo.vestedPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-cyan to-neon-green transition-all duration-500"
                style={{ width: `${vestingInfo.vestedPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Cliff Period</span>
              <div className="font-mono">{vesting?.cliff || 0} days</div>
            </div>
            <div>
              <span className="text-gray-500">Total Duration</span>
              <div className="font-mono">{vesting?.duration || 0} days</div>
            </div>
            <div>
              <span className="text-gray-500">Initial Release</span>
              <div className="font-mono">{vesting?.initialRelease || 0}%</div>
            </div>
            <div>
              <span className="text-gray-500">Days Remaining</span>
              <div className="font-mono">{Math.max(0, (vesting?.duration || 0) - daysSinceLaunch)} days</div>
            </div>
          </div>

          {vestingInfo.inCliffPeriod && (
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-yellow-400">
                Cliff period active. Tokens unlock in {vestingInfo.daysUntilCliffEnd} days.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Claim Button */}
      <button
        onClick={handleClaim}
        disabled={claiming || claimableTokens <= 0}
        className="cyber-button w-full py-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {claiming ? (
          <>
            <RefreshCw className="w-5 h-5 animate-spin" />
            Claiming...
          </>
        ) : claimableTokens > 0 ? (
          <>
            <Coins className="w-5 h-5" />
            Claim {claimableTokens.toLocaleString()} {tokenSymbol}
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            No Tokens Available
          </>
        )}
      </button>

      {/* Refund for excess */}
      {allocation.refundAmount > 0 && (
        <div className="mt-4 p-3 bg-neon-purple/10 border border-neon-purple/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-neon-purple" />
              <span className="text-sm text-neon-purple">Excess Refund</span>
            </div>
            <span className="font-mono font-bold text-neon-purple">
              {allocation.refundAmount} ALEO
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Automatically returned due to oversubscription
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Helper function to calculate vesting
function calculateVesting(
  vesting: VestingSchedule,
  daysSinceLaunch: number,
  totalTokens: number
) {
  const { cliff, duration, initialRelease } = vesting;

  // Before cliff
  if (daysSinceLaunch < cliff) {
    return {
      vestedAmount: (initialRelease / 100) * totalTokens,
      vestedPercentage: initialRelease,
      inCliffPeriod: true,
      daysUntilCliffEnd: cliff - daysSinceLaunch,
    };
  }

  // After cliff, during vesting
  const daysAfterCliff = daysSinceLaunch - cliff;
  const vestingDuration = duration - cliff;

  if (vestingDuration <= 0 || daysAfterCliff >= vestingDuration) {
    // Fully vested
    return {
      vestedAmount: totalTokens,
      vestedPercentage: 100,
      inCliffPeriod: false,
      daysUntilCliffEnd: 0,
    };
  }

  // Partial vesting
  const vestingRatio = daysAfterCliff / vestingDuration;
  const remainingToVest = 100 - initialRelease;
  const vestedPercentage = initialRelease + (remainingToVest * vestingRatio);

  return {
    vestedAmount: (vestedPercentage / 100) * totalTokens,
    vestedPercentage,
    inCliffPeriod: false,
    daysUntilCliffEnd: 0,
  };
}
