import { PrismaClient, Allocation } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/error.middleware';
import launchService from './launch.service';

const prisma = new PrismaClient();

export interface AllocationResult {
  userAddressHash: string;
  committedAmount: number;
  tokensAllocated: number;
  refundAmount: number;
}

export class AllocationService {
  /**
   * Calculate token allocations for all participants
   * Uses pro-rata distribution based on revealed commitments
   */
  async calculateAllocations(launchId: string): Promise<AllocationResult[]> {
    try {
      const launch = await launchService.getLaunchById(launchId);

      if (!launch) {
        throw ApiError.notFound('Launch not found', 'LAUNCH_NOT_FOUND');
      }

      // Get all revealed commits
      const commits = await prisma.pendingCommit.findMany({
        where: {
          launchId,
          confirmed: true,
          revealed: true,
        },
      });

      if (commits.length === 0) {
        return [];
      }

      const totalSupply = launch.totalSupply;
      const pricePerToken = launch.pricePerToken;

      // Calculate total revealed amount
      const totalRevealed = commits.reduce((sum, commit) => sum + commit.amount, 0);

      // Maximum tokens that can be sold
      const maxTokensAvailable = totalSupply;

      // Total credits needed to buy all tokens
      const totalCreditsNeeded = maxTokensAvailable * pricePerToken;

      // Determine if we're oversubscribed
      const isOversubscribed = totalRevealed > totalCreditsNeeded;

      const allocations: AllocationResult[] = [];

      for (const commit of commits) {
        let tokensAllocated: number;
        let refundAmount: number;

        if (isOversubscribed) {
          // Pro-rata allocation
          // allocation = (commitAmount / totalRevealed) * maxTokensAvailable
          tokensAllocated = Math.floor((commit.amount / totalRevealed) * maxTokensAvailable);

          // Calculate credits used
          const creditsUsed = tokensAllocated * pricePerToken;
          refundAmount = commit.amount - creditsUsed;
        } else {
          // Not oversubscribed, everyone gets what they asked for
          tokensAllocated = Math.floor(commit.amount / pricePerToken);
          refundAmount = commit.amount % pricePerToken; // Only refund remainder
        }

        allocations.push({
          userAddressHash: commit.userAddressHash,
          committedAmount: commit.amount,
          tokensAllocated,
          refundAmount,
        });

        // Create or update allocation record
        await prisma.allocation.upsert({
          where: {
            launchId_userAddressHash: {
              launchId,
              userAddressHash: commit.userAddressHash,
            },
          },
          update: {
            committedAmount: commit.amount,
            tokensAllocated,
            refundAmount,
          },
          create: {
            id: uuidv4(),
            launchId,
            userAddressHash: commit.userAddressHash,
            committedAmount: commit.amount,
            tokensAllocated,
            refundAmount,
          },
        });
      }

      logger.info(`Calculated allocations for ${commits.length} participants`, { launchId });

      return allocations;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to calculate allocations:', error);
      throw ApiError.internal('Failed to calculate allocations');
    }
  }

  /**
   * Get allocation for a specific user
   */
  async getUserAllocation(launchId: string, userAddressHash: string): Promise<Allocation | null> {
    try {
      return await prisma.allocation.findUnique({
        where: {
          launchId_userAddressHash: {
            launchId,
            userAddressHash,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get user allocation:', error);
      throw ApiError.internal('Failed to get user allocation');
    }
  }

  /**
   * Get all allocations for a launch
   */
  async getLaunchAllocations(launchId: string): Promise<Allocation[]> {
    try {
      return await prisma.allocation.findMany({
        where: { launchId },
        orderBy: { tokensAllocated: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to get launch allocations:', error);
      throw ApiError.internal('Failed to get launch allocations');
    }
  }

  /**
   * Mark allocation as distributed
   */
  async markDistributed(allocationId: string, transactionId: string): Promise<Allocation> {
    try {
      return await prisma.allocation.update({
        where: { id: allocationId },
        data: {
          distributed: true,
          distributionTxId: transactionId,
          distributedAt: new Date(),
        },
      });
    } catch (error) {
      logger.error('Failed to mark allocation as distributed:', error);
      throw ApiError.internal('Failed to mark allocation as distributed');
    }
  }

  /**
   * Get allocation statistics for a launch
   */
  async getAllocationStats(launchId: string): Promise<{
    totalParticipants: number;
    totalTokensAllocated: number;
    totalRefunded: number;
    totalDistributed: number;
    distributionProgress: number;
  }> {
    try {
      const allocations = await prisma.allocation.findMany({
        where: { launchId },
      });

      const totalParticipants = allocations.length;
      const totalTokensAllocated = allocations.reduce((sum, a) => sum + a.tokensAllocated, 0);
      const totalRefunded = allocations.reduce((sum, a) => sum + a.refundAmount, 0);
      const totalDistributed = allocations.filter(a => a.distributed).length;
      const distributionProgress = totalParticipants > 0
        ? (totalDistributed / totalParticipants) * 100
        : 0;

      return {
        totalParticipants,
        totalTokensAllocated,
        totalRefunded,
        totalDistributed,
        distributionProgress: Math.round(distributionProgress * 100) / 100,
      };
    } catch (error) {
      logger.error('Failed to get allocation stats:', error);
      throw ApiError.internal('Failed to get allocation stats');
    }
  }
}

export default new AllocationService();
