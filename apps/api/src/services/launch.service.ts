import { PrismaClient, Launch } from '@prisma/client';

// Launch status type (matches schema)
type LaunchStatus = 'PENDING' | 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'CANCELLED' | 'FAILED';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

// Block time in seconds (Aleo average)
const BLOCK_TIME_SECONDS = parseInt(process.env.BLOCK_TIME_SECONDS || '15');

export interface CreateLaunchInput {
  name: string;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  commitDurationHours: number;
  revealDurationHours: number;
  creatorAddress?: string;
  description?: string;

  // Soft cap & Anti-whale protection
  softCap?: number;
  hardCap?: number;
  maxPerWallet?: number;
  minPerWallet?: number;

  // Project details & Social links
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

  // Tokenomics allocations (percentages)
  teamAllocation?: number;
  communityAllocation?: number;
  liquidityAllocation?: number;
  marketingAllocation?: number;
  reserveAllocation?: number;

  // Vesting schedule
  vestingEnabled?: boolean;
  vestingCliff?: number;
  vestingDuration?: number;
  vestingInitialRelease?: number;
}

export interface LaunchResponse {
  id: string;
  name: string;
  description?: string | null;
  tokenSymbol: string;
  totalSupply: number;
  pricePerToken: number;
  status: LaunchStatus;
  participantCount: number;
  totalRevealed: number;
  totalCommitted: number;
  commitEndsAt: string;
  revealEndsAt: string;
  createdAt: string;
  creatorAddress?: string | null;

  // Soft cap & Anti-whale protection
  softCap?: number | null;
  hardCap?: number | null;
  maxPerWallet?: number | null;
  minPerWallet?: number | null;

  // Project details & Social links
  longDescription?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  telegramUrl?: string | null;
  logoUrl?: string | null;

  // Trust indicators
  isAudited?: boolean;
  auditUrl?: string | null;
  auditFirm?: string | null;
  isKycVerified?: boolean;
  kycProvider?: string | null;
  isSafu?: boolean;

  // Tokenomics allocations
  teamAllocation?: number | null;
  communityAllocation?: number | null;
  liquidityAllocation?: number | null;
  marketingAllocation?: number | null;
  reserveAllocation?: number | null;

  // Vesting schedule
  vestingEnabled?: boolean;
  vestingCliff?: number | null;
  vestingDuration?: number | null;
  vestingInitialRelease?: number | null;

  // On-chain tracking
  transactionId?: string | null;
  onChainStatus?: string | null;
  onChainBlockHeight?: number | null;
  programId?: string | null;
  launchIdHash?: string | null;
}

// Convert hours to blocks
function hoursToBlocks(hours: number): number {
  const seconds = hours * 3600;
  return Math.ceil(seconds / BLOCK_TIME_SECONDS);
}

export class LaunchService {
  /**
   * Create a new token launch
   */
  async createLaunch(input: CreateLaunchInput): Promise<LaunchResponse> {
    const {
      name,
      tokenSymbol,
      totalSupply,
      pricePerToken,
      commitDurationHours,
      revealDurationHours,
      creatorAddress,
      description,
      // New fields
      softCap,
      hardCap,
      maxPerWallet,
      minPerWallet,
      longDescription,
      websiteUrl,
      twitterUrl,
      discordUrl,
      telegramUrl,
      logoUrl,
      isAudited,
      auditUrl,
      auditFirm,
      isKycVerified,
      kycProvider,
      isSafu,
      teamAllocation,
      communityAllocation,
      liquidityAllocation,
      marketingAllocation,
      reserveAllocation,
      vestingEnabled,
      vestingCliff,
      vestingDuration,
      vestingInitialRelease,
    } = input;

    const now = new Date();
    const commitEndsAt = new Date(now.getTime() + commitDurationHours * 3600 * 1000);
    const revealEndsAt = new Date(commitEndsAt.getTime() + revealDurationHours * 3600 * 1000);

    try {
      const launch = await prisma.launch.create({
        data: {
          id: uuidv4(),
          name,
          description,
          tokenSymbol: tokenSymbol.toUpperCase(),
          totalSupply,
          pricePerToken,
          commitDurationBlocks: hoursToBlocks(commitDurationHours),
          revealDurationBlocks: hoursToBlocks(revealDurationHours),
          status: 'COMMIT',
          commitStartTime: now,
          commitEndTime: commitEndsAt,
          revealStartTime: commitEndsAt,
          revealEndTime: revealEndsAt,
          creatorAddress,
          participantCount: 0,
          totalCommitted: 0,
          totalRevealed: 0,
          // New fields
          softCap,
          hardCap,
          maxPerWallet,
          minPerWallet,
          longDescription,
          websiteUrl,
          twitterUrl,
          discordUrl,
          telegramUrl,
          logoUrl,
          isAudited: isAudited ?? false,
          auditUrl,
          auditFirm,
          isKycVerified: isKycVerified ?? false,
          kycProvider,
          isSafu: isSafu ?? false,
          teamAllocation,
          communityAllocation,
          liquidityAllocation,
          marketingAllocation,
          reserveAllocation,
          vestingEnabled: vestingEnabled ?? false,
          vestingCliff,
          vestingDuration,
          vestingInitialRelease,
        },
      });

      logger.info('Launch created', { launchId: launch.id, name, tokenSymbol });

      return this.formatLaunchResponse(launch);
    } catch (error) {
      logger.error('Failed to create launch:', error);
      throw ApiError.internal('Failed to create launch');
    }
  }

  /**
   * Get launch by ID
   */
  async getLaunchById(id: string): Promise<LaunchResponse | null> {
    try {
      const launch = await prisma.launch.findUnique({
        where: { id },
      });

      if (!launch) {
        return null;
      }

      // Check and update phase if needed
      const updatedLaunch = await this.updateLaunchPhase(launch);

      return this.formatLaunchResponse(updatedLaunch);
    } catch (error) {
      logger.error(`Failed to get launch ${id}:`, error);
      throw ApiError.internal('Failed to fetch launch');
    }
  }

  /**
   * Get all launches with optional filtering
   */
  async getAllLaunches(
    status?: LaunchStatus,
    limit = 20,
    offset = 0
  ): Promise<{ launches: LaunchResponse[]; total: number }> {
    try {
      const where = status ? { status } : {};

      const [launches, total] = await Promise.all([
        prisma.launch.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.launch.count({ where }),
      ]);

      // Update phases for all launches
      const updatedLaunches = await Promise.all(launches.map(l => this.updateLaunchPhase(l)));

      return {
        launches: updatedLaunches.map(l => this.formatLaunchResponse(l)),
        total,
      };
    } catch (error) {
      logger.error('Failed to list launches:', error);
      throw ApiError.internal('Failed to list launches');
    }
  }

  /**
   * Get active launches (COMMIT, REVEAL, or DISTRIBUTION phase)
   */
  async getActiveLaunches(): Promise<LaunchResponse[]> {
    try {
      const launches = await prisma.launch.findMany({
        where: {
          status: {
            in: ['COMMIT', 'REVEAL', 'DISTRIBUTION'],
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const updatedLaunches = await Promise.all(launches.map(l => this.updateLaunchPhase(l)));

      return updatedLaunches.map(l => this.formatLaunchResponse(l));
    } catch (error) {
      logger.error('Failed to get active launches:', error);
      throw ApiError.internal('Failed to get active launches');
    }
  }

  /**
   * Update launch phase based on current time
   * Also checks soft cap when transitioning to DISTRIBUTION
   */
  async updateLaunchPhase(launch: Launch): Promise<Launch> {
    const now = new Date();
    let newStatus: LaunchStatus = launch.status as LaunchStatus;

    // Check phase transitions
    if (launch.status === 'COMMIT' && launch.commitEndTime && now >= launch.commitEndTime) {
      newStatus = 'REVEAL';
      logger.info('Launch transitioning to REVEAL phase', { launchId: launch.id });
    } else if (launch.status === 'REVEAL' && launch.revealEndTime && now >= launch.revealEndTime) {
      // Check soft cap before transitioning to DISTRIBUTION
      if (launch.softCap && launch.totalRevealed < launch.softCap) {
        newStatus = 'FAILED';
        logger.info('Launch FAILED - soft cap not met', {
          launchId: launch.id,
          softCap: launch.softCap,
          totalRevealed: launch.totalRevealed,
        });
      } else {
        newStatus = 'DISTRIBUTION';
        logger.info('Launch transitioning to DISTRIBUTION phase', { launchId: launch.id });
      }
    }

    // Update if status changed
    if (newStatus !== launch.status) {
      return prisma.launch.update({
        where: { id: launch.id },
        data: { status: newStatus },
      });
    }

    return launch;
  }

  /**
   * Check if soft cap is met
   */
  async isSoftCapMet(launchId: string): Promise<boolean> {
    const launch = await prisma.launch.findUnique({
      where: { id: launchId },
    });

    if (!launch) {
      throw ApiError.notFound('Launch not found');
    }

    // If no soft cap, it's always "met"
    if (!launch.softCap) {
      return true;
    }

    return launch.totalRevealed >= launch.softCap;
  }

  /**
   * Get user's allocation for a launch
   */
  async getUserAllocation(launchId: string, userAddressHash: string) {
    return prisma.allocation.findUnique({
      where: {
        launchId_userAddressHash: {
          launchId,
          userAddressHash,
        },
      },
    });
  }

  /**
   * Process refund for a user (when launch failed)
   */
  async processRefund(launchId: string, userAddressHash: string, transactionId: string) {
    const launch = await prisma.launch.findUnique({
      where: { id: launchId },
    });

    if (!launch) {
      throw ApiError.notFound('Launch not found');
    }

    if (launch.status !== 'FAILED') {
      throw ApiError.badRequest('Refunds are only available for failed launches');
    }

    const allocation = await prisma.allocation.findUnique({
      where: {
        launchId_userAddressHash: {
          launchId,
          userAddressHash,
        },
      },
    });

    if (!allocation) {
      throw ApiError.notFound('No allocation found for this user');
    }

    if (allocation.refunded) {
      throw ApiError.badRequest('Refund already processed');
    }

    return prisma.allocation.update({
      where: { id: allocation.id },
      data: {
        refunded: true,
        refundedAt: new Date(),
        refundTxId: transactionId,
        refundAmount: allocation.committedAmount,
      },
    });
  }

  /**
   * Process token claim for a user
   */
  async processClaim(launchId: string, userAddressHash: string, transactionId: string) {
    const launch = await prisma.launch.findUnique({
      where: { id: launchId },
    });

    if (!launch) {
      throw ApiError.notFound('Launch not found');
    }

    if (launch.status !== 'DISTRIBUTION' && launch.status !== 'ENDED') {
      throw ApiError.badRequest('Claims are only available after distribution phase');
    }

    const allocation = await prisma.allocation.findUnique({
      where: {
        launchId_userAddressHash: {
          launchId,
          userAddressHash,
        },
      },
    });

    if (!allocation) {
      throw ApiError.notFound('No allocation found for this user');
    }

    if (allocation.claimed) {
      throw ApiError.badRequest('Tokens already claimed');
    }

    // Calculate vested amount if vesting is enabled
    let claimableAmount = allocation.tokensAllocated;
    if (launch.vestingEnabled && launch.vestingCliff && launch.vestingDuration) {
      claimableAmount = this.calculateVestedAmount(
        allocation.tokensAllocated,
        launch.revealEndTime || new Date(),
        launch.vestingCliff,
        launch.vestingDuration,
        launch.vestingInitialRelease || 0
      );
    }

    return prisma.allocation.update({
      where: { id: allocation.id },
      data: {
        claimed: true,
        claimedAt: new Date(),
        claimTxId: transactionId,
        totalVested: claimableAmount,
        lastVestingClaim: new Date(),
      },
    });
  }

  /**
   * Calculate vested amount based on schedule
   */
  calculateVestedAmount(
    totalTokens: number,
    launchEndDate: Date,
    cliffDays: number,
    durationDays: number,
    initialReleasePercent: number
  ): number {
    const now = new Date();
    const daysSinceLaunch = Math.floor(
      (now.getTime() - launchEndDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Before cliff - only initial release
    if (daysSinceLaunch < cliffDays) {
      return (initialReleasePercent / 100) * totalTokens;
    }

    // After full vesting - all tokens
    if (daysSinceLaunch >= durationDays) {
      return totalTokens;
    }

    // During vesting period
    const daysAfterCliff = daysSinceLaunch - cliffDays;
    const vestingDuration = durationDays - cliffDays;
    const vestingRatio = daysAfterCliff / vestingDuration;
    const remainingToVest = 100 - initialReleasePercent;
    const vestedPercent = initialReleasePercent + remainingToVest * vestingRatio;

    return (vestedPercent / 100) * totalTokens;
  }

  /**
   * Increment participant count
   */
  async incrementParticipants(launchId: string): Promise<void> {
    await prisma.launch.update({
      where: { id: launchId },
      data: {
        participantCount: { increment: 1 },
      },
    });
  }

  /**
   * Update total committed
   */
  async addCommitment(launchId: string, amount: number): Promise<void> {
    await prisma.launch.update({
      where: { id: launchId },
      data: {
        totalCommitted: { increment: amount },
      },
    });
  }

  /**
   * Update total revealed
   */
  async addReveal(launchId: string, amount: number): Promise<void> {
    await prisma.launch.update({
      where: { id: launchId },
      data: {
        totalRevealed: { increment: amount },
      },
    });
  }

  /**
   * Mark launch as ended
   */
  async endLaunch(launchId: string): Promise<Launch> {
    return prisma.launch.update({
      where: { id: launchId },
      data: { status: 'ENDED' },
    });
  }

  /**
   * Mark launch as failed (soft cap not met)
   */
  async failLaunch(launchId: string): Promise<Launch> {
    return prisma.launch.update({
      where: { id: launchId },
      data: { status: 'FAILED' },
    });
  }

  /**
   * Update launch with on-chain status
   */
  async updateLaunch(launchId: string, data: {
    transactionId?: string;
    onChainStatus?: string;
    onChainBlockHeight?: number;
    launchIdHash?: string;
  }): Promise<LaunchResponse> {
    const launch = await prisma.launch.findUnique({
      where: { id: launchId },
    });

    if (!launch) {
      throw ApiError.notFound('Launch not found');
    }

    const updatedLaunch = await prisma.launch.update({
      where: { id: launchId },
      data: {
        transactionId: data.transactionId ?? launch.transactionId,
        onChainStatus: data.onChainStatus ?? launch.onChainStatus,
        onChainBlockHeight: data.onChainBlockHeight ?? launch.onChainBlockHeight,
        launchIdHash: data.launchIdHash ?? launch.launchIdHash,
      },
    });

    logger.info('Launch updated', { launchId, ...data });

    return this.formatLaunchResponse(updatedLaunch);
  }

  /**
   * Format launch for API response
   */
  private formatLaunchResponse(launch: Launch): LaunchResponse {
    return {
      id: launch.id,
      name: launch.name,
      description: launch.description,
      tokenSymbol: launch.tokenSymbol,
      totalSupply: launch.totalSupply,
      pricePerToken: launch.pricePerToken,
      status: launch.status as LaunchStatus,
      participantCount: launch.participantCount,
      totalCommitted: launch.status === 'COMMIT' ? 0 : launch.totalCommitted, // Hidden during commit
      totalRevealed: launch.totalRevealed,
      commitEndsAt: launch.commitEndTime?.toISOString() || '',
      revealEndsAt: launch.revealEndTime?.toISOString() || '',
      createdAt: launch.createdAt.toISOString(),
      creatorAddress: launch.creatorAddress,

      // Soft cap & Anti-whale protection
      softCap: launch.softCap,
      hardCap: launch.hardCap,
      maxPerWallet: launch.maxPerWallet,
      minPerWallet: launch.minPerWallet,

      // Project details & Social links
      longDescription: launch.longDescription,
      websiteUrl: launch.websiteUrl,
      twitterUrl: launch.twitterUrl,
      discordUrl: launch.discordUrl,
      telegramUrl: launch.telegramUrl,
      logoUrl: launch.logoUrl,

      // Trust indicators
      isAudited: launch.isAudited,
      auditUrl: launch.auditUrl,
      auditFirm: launch.auditFirm,
      isKycVerified: launch.isKycVerified,
      kycProvider: launch.kycProvider,
      isSafu: launch.isSafu,

      // Tokenomics allocations
      teamAllocation: launch.teamAllocation,
      communityAllocation: launch.communityAllocation,
      liquidityAllocation: launch.liquidityAllocation,
      marketingAllocation: launch.marketingAllocation,
      reserveAllocation: launch.reserveAllocation,

      // Vesting schedule
      vestingEnabled: launch.vestingEnabled,
      vestingCliff: launch.vestingCliff,
      vestingDuration: launch.vestingDuration,
      vestingInitialRelease: launch.vestingInitialRelease,

      // On-chain tracking
      transactionId: launch.transactionId,
      onChainStatus: launch.onChainStatus,
      onChainBlockHeight: launch.onChainBlockHeight,
      programId: launch.programId,
      launchIdHash: launch.launchIdHash,
    };
  }
}

export default new LaunchService();
