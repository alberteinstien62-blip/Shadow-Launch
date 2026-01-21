import { PrismaClient, PendingCommit } from '@prisma/client';
import CryptoJS from 'crypto-js';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/error.middleware';
import launchService from './launch.service';

const prisma = new PrismaClient();

export interface PrepareRevealInput {
  launchId: string;
  userAddress: string;
  secret: string;
}

export interface PrepareRevealResponse {
  commitId: string;
  amount: number;
  isValid: boolean;
  tokensAllocated: number;
  transaction: {
    programId: string;
    functionName: string;
    inputs: string[];
  };
}

// Hash data using SHA-256
function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

export class RevealService {
  /**
   * Prepare a reveal transaction
   * Verifies the secret matches the commitment and calculates allocation
   */
  async prepareReveal(input: PrepareRevealInput): Promise<PrepareRevealResponse> {
    const { launchId, userAddress, secret } = input;

    try {
      // Verify launch exists and is in reveal phase
      const launch = await launchService.getLaunchById(launchId);

      if (!launch) {
        throw ApiError.notFound('Launch not found', 'LAUNCH_NOT_FOUND');
      }

      if (launch.status !== 'REVEAL') {
        throw ApiError.badRequest('Launch is not in reveal phase', 'INVALID_PHASE');
      }

      // Check if reveal phase has ended
      if (new Date() > new Date(launch.revealEndsAt)) {
        throw ApiError.badRequest('Reveal phase has ended', 'REVEAL_PHASE_ENDED');
      }

      // Hash the user address for lookup
      const userAddressHash = hashData(userAddress);

      // Find user's commit
      const commit = await prisma.pendingCommit.findUnique({
        where: {
          launchId_userAddressHash: {
            launchId,
            userAddressHash,
          },
        },
      });

      if (!commit) {
        throw ApiError.notFound('No commitment found for this user', 'COMMIT_NOT_FOUND');
      }

      if (!commit.confirmed) {
        throw ApiError.badRequest('Commitment was not confirmed', 'COMMIT_NOT_CONFIRMED');
      }

      if (commit.revealed) {
        throw ApiError.conflict('Commitment already revealed', 'ALREADY_REVEALED');
      }

      // Verify the secret
      const commitmentData = `${userAddressHash}:${commit.amount}:${secret}`;
      const computedHash = hashData(commitmentData);

      if (computedHash !== commit.commitmentHash) {
        throw ApiError.badRequest('Invalid secret - does not match commitment', 'INVALID_SECRET');
      }

      // Calculate token allocation
      const tokensAllocated = Math.floor(commit.amount / launch.pricePerToken);

      // Convert amount to microcredits for on-chain transaction (1 ALEO = 1,000,000 microcredits)
      const amountInMicrocredits = Math.floor(commit.amount * 1_000_000);

      // Build Aleo transaction placeholder
      const transaction = {
        programId: 'shadowlaunch_v2.aleo',
        functionName: 'reveal',
        inputs: [
          launchId,
          secret,
          amountInMicrocredits.toString(),
        ],
      };

      logger.info(`Reveal prepared for launch ${launchId}`, {
        commitId: commit.id,
        userHash: userAddressHash.substring(0, 8),
        tokensAllocated,
      });

      return {
        commitId: commit.id,
        amount: commit.amount,
        isValid: true,
        tokensAllocated,
        transaction,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to prepare reveal:', error);
      throw ApiError.internal('Failed to prepare reveal');
    }
  }

  /**
   * Confirm a reveal after transaction is broadcast
   */
  async confirmReveal(commitId: string, transactionId: string): Promise<PendingCommit> {
    try {
      const commit = await prisma.pendingCommit.findUnique({
        where: { id: commitId },
        include: { launch: true },
      });

      if (!commit) {
        throw ApiError.notFound('Commit not found', 'COMMIT_NOT_FOUND');
      }

      if (commit.revealed) {
        throw ApiError.conflict('Already revealed', 'ALREADY_REVEALED');
      }

      // Update commit as revealed
      const updated = await prisma.pendingCommit.update({
        where: { id: commitId },
        data: {
          revealed: true,
          revealTransactionId: transactionId,
          revealedAt: new Date(),
        },
      });

      // Update launch total revealed
      await launchService.addReveal(commit.launchId, commit.amount);

      logger.info(`Reveal confirmed for commit ${commitId}`, { transactionId });

      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to confirm reveal:', error);
      throw ApiError.internal('Failed to confirm reveal');
    }
  }

  /**
   * Get all revealed commits for a launch
   */
  async getRevealedCommits(launchId: string): Promise<PendingCommit[]> {
    try {
      return await prisma.pendingCommit.findMany({
        where: {
          launchId,
          revealed: true,
        },
        orderBy: { revealedAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to get revealed commits:', error);
      throw ApiError.internal('Failed to get revealed commits');
    }
  }

  /**
   * Get reveal statistics for a launch
   */
  async getRevealStats(launchId: string): Promise<{
    totalCommits: number;
    totalRevealed: number;
    revealPercentage: number;
  }> {
    try {
      const [totalCommits, totalRevealed] = await Promise.all([
        prisma.pendingCommit.count({
          where: { launchId, confirmed: true },
        }),
        prisma.pendingCommit.count({
          where: { launchId, revealed: true },
        }),
      ]);

      const revealPercentage = totalCommits > 0 ? (totalRevealed / totalCommits) * 100 : 0;

      return {
        totalCommits,
        totalRevealed,
        revealPercentage: Math.round(revealPercentage * 100) / 100,
      };
    } catch (error) {
      logger.error('Failed to get reveal stats:', error);
      throw ApiError.internal('Failed to get reveal stats');
    }
  }
}

export default new RevealService();
