import { PrismaClient, PendingCommit } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from 'crypto-js';
import { logger } from '../utils/logger';
import { ApiError } from '../middleware/error.middleware';
import launchService from './launch.service';

const prisma = new PrismaClient();

export interface PrepareCommitInput {
  launchId: string;
  amount: number;
  userAddress: string;
  secret?: string; // Optional client-provided secret
}

export interface PrepareCommitResponse {
  commitId: string;
  secret: string;
  commitmentHash: string;
  transaction: {
    programId: string;
    functionName: string;
    inputs: string[];
  };
}

export interface ConfirmCommitInput {
  commitId: string;
  transactionId: string;
}

// Generate a secure random secret
function generateSecret(): string {
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  return randomBytes.toString(CryptoJS.enc.Hex);
}

// Hash data using SHA-256
function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

// Encrypt data with a password
function encryptData(data: string, password: string): string {
  return CryptoJS.AES.encrypt(data, password).toString();
}

export class CommitService {
  /**
   * Prepare a commitment for a launch
   * Generates a secret and creates the commitment hash
   */
  async prepareCommit(input: PrepareCommitInput): Promise<PrepareCommitResponse> {
    const { launchId, amount, userAddress, secret: providedSecret } = input;

    try {
      // Verify launch exists and is in commit phase
      const launch = await launchService.getLaunchById(launchId);

      if (!launch) {
        throw ApiError.notFound('Launch not found', 'LAUNCH_NOT_FOUND');
      }

      if (launch.status !== 'COMMIT') {
        throw ApiError.badRequest('Launch is not in commit phase', 'INVALID_PHASE');
      }

      // Check if commit phase has ended
      if (new Date() > new Date(launch.commitEndsAt)) {
        throw ApiError.badRequest('Commit phase has ended', 'COMMIT_PHASE_ENDED');
      }

      // Validate amount
      if (amount <= 0) {
        throw ApiError.badRequest('Amount must be greater than 0', 'INVALID_AMOUNT');
      }

      // Per-wallet minimum contribution check
      if (launch.minPerWallet && amount < launch.minPerWallet) {
        throw ApiError.badRequest(
          `Minimum contribution is ${launch.minPerWallet} ALEO`,
          'BELOW_MIN_CONTRIBUTION'
        );
      }

      // Per-wallet maximum contribution check
      if (launch.maxPerWallet && amount > launch.maxPerWallet) {
        throw ApiError.badRequest(
          `Maximum contribution per wallet is ${launch.maxPerWallet} ALEO`,
          'EXCEEDS_MAX_CONTRIBUTION'
        );
      }

      // Hard cap check - verify total raised won't exceed hard cap
      if (launch.hardCap) {
        const currentTotal = launch.totalCommitted || 0;
        if (currentTotal + amount > launch.hardCap) {
          const remaining = launch.hardCap - currentTotal;
          if (remaining <= 0) {
            throw ApiError.badRequest('Launch hard cap has been reached', 'HARD_CAP_REACHED');
          }
          throw ApiError.badRequest(
            `Only ${remaining.toFixed(2)} ALEO remaining to reach hard cap`,
            'EXCEEDS_HARD_CAP'
          );
        }
      }

      // Hash the user address for privacy
      const userAddressHash = hashData(userAddress);

      // Check if user already has a confirmed commit
      const existingCommit = await prisma.pendingCommit.findUnique({
        where: {
          launchId_userAddressHash: {
            launchId,
            userAddressHash,
          },
        },
      });

      if (existingCommit && existingCommit.confirmed) {
        // User already has a confirmed commit - check if total would exceed max
        if (launch.maxPerWallet) {
          const newTotal = existingCommit.amount + amount;
          if (newTotal > launch.maxPerWallet) {
            throw ApiError.badRequest(
              `Total contribution would exceed max per wallet (${launch.maxPerWallet} ALEO). You have already committed ${existingCommit.amount} ALEO.`,
              'EXCEEDS_MAX_CONTRIBUTION'
            );
          }
        }
        // Allow updating the commit with additional amount
        logger.info(`User updating existing commit for launch ${launchId}`, {
          existingAmount: existingCommit.amount,
          additionalAmount: amount,
        });
      }

      // Generate a random secret or use provided one
      const secret = providedSecret || generateSecret();

      // Create commitment hash: hash(userAddressHash + amount + secret)
      const commitmentData = `${userAddressHash}:${amount}:${secret}`;
      const commitmentHash = hashData(commitmentData);

      // Encrypt the secret with user's address as password (backup)
      const encryptedSecret = encryptData(secret, userAddress);

      // Create or update pending commit
      const commit = await prisma.pendingCommit.upsert({
        where: {
          launchId_userAddressHash: {
            launchId,
            userAddressHash,
          },
        },
        update: {
          encryptedSecret,
          commitmentHash,
          amount,
          confirmed: false,
        },
        create: {
          id: uuidv4(),
          launchId,
          userAddressHash,
          encryptedSecret,
          commitmentHash,
          amount,
          confirmed: false,
        },
      });

      // Convert amount to microcredits for on-chain transaction (1 ALEO = 1,000,000 microcredits)
      const amountInMicrocredits = Math.floor(amount * 1_000_000);

      // Build Aleo transaction placeholder
      const transaction = {
        programId: 'shadowlaunch_v1.aleo',
        functionName: 'commit',
        inputs: [
          launchId,
          commitmentHash,
          amountInMicrocredits.toString(),
        ],
      };

      logger.info(`Commit prepared for launch ${launchId}`, {
        commitId: commit.id,
        userHash: userAddressHash.substring(0, 8),
      });

      return {
        commitId: commit.id,
        secret,
        commitmentHash,
        transaction,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to prepare commit:', error);
      throw ApiError.internal('Failed to prepare commit');
    }
  }

  /**
   * Confirm a commitment after transaction is broadcast
   */
  async confirmCommit(input: ConfirmCommitInput): Promise<PendingCommit> {
    const { commitId, transactionId } = input;

    try {
      const commit = await prisma.pendingCommit.findUnique({
        where: { id: commitId },
      });

      if (!commit) {
        throw ApiError.notFound('Commit not found', 'COMMIT_NOT_FOUND');
      }

      if (commit.confirmed) {
        throw ApiError.conflict('Commit already confirmed', 'COMMIT_ALREADY_CONFIRMED');
      }

      // Update commit with transaction ID
      const updated = await prisma.pendingCommit.update({
        where: { id: commitId },
        data: {
          confirmed: true,
          transactionId,
          confirmedAt: new Date(),
        },
      });

      // Update launch statistics
      await launchService.incrementParticipants(commit.launchId);
      await launchService.addCommitment(commit.launchId, commit.amount);

      logger.info(`Commit ${commitId} confirmed`, { transactionId });

      return updated;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Failed to confirm commit:', error);
      throw ApiError.internal('Failed to confirm commit');
    }
  }

  /**
   * Get user's commit for a launch
   */
  async getUserCommit(launchId: string, userAddress: string): Promise<PendingCommit | null> {
    try {
      const userAddressHash = hashData(userAddress);

      return await prisma.pendingCommit.findUnique({
        where: {
          launchId_userAddressHash: {
            launchId,
            userAddressHash,
          },
        },
      });
    } catch (error) {
      logger.error('Failed to get user commit:', error);
      throw ApiError.internal('Failed to get user commit');
    }
  }

  /**
   * Get all confirmed commits for a launch
   */
  async getLaunchCommits(launchId: string): Promise<PendingCommit[]> {
    try {
      return await prisma.pendingCommit.findMany({
        where: {
          launchId,
          confirmed: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Failed to get launch commits:', error);
      throw ApiError.internal('Failed to get launch commits');
    }
  }

  /**
   * Get commit count for a launch
   */
  async getCommitCount(launchId: string): Promise<number> {
    return prisma.pendingCommit.count({
      where: {
        launchId,
        confirmed: true,
      },
    });
  }
}

export default new CommitService();
