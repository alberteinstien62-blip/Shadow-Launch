import { AleoTransaction } from '../types';
import env from '../config/env';
import { CryptoUtils } from '../utils/crypto';

export class AleoService {
  private programId: string;

  constructor() {
    this.programId = env.ALEO_PROGRAM_ID;
  }

  /**
   * Build transaction for creating a new launch
   */
  buildCreateLaunchTransaction(params: {
    tokenSymbol: string;
    totalSupply: string;
    pricePerToken: string;
    commitDuration: number;
    revealDuration: number;
  }): AleoTransaction {
    return {
      programId: this.programId,
      functionName: 'create_launch',
      inputs: [
        `${params.tokenSymbol}field`, // token_symbol as field
        `${params.totalSupply}u128`, // total_supply
        `${params.pricePerToken}u64`, // price_per_token
        `${params.commitDuration}u32`, // commit_duration_blocks
        `${params.revealDuration}u32`, // reveal_duration_blocks
      ],
      fee: '1000000', // 1 credit
    };
  }

  /**
   * Build transaction for committing to a launch
   */
  buildCommitTransaction(params: {
    launchId: string;
    secretHash: string;
    amount: string;
  }): AleoTransaction {
    return {
      programId: this.programId,
      functionName: 'commit',
      inputs: [
        `${params.launchId}field`, // launch_id
        `${params.secretHash}field`, // secret_hash (commitment)
        `${params.amount}u64`, // amount in credits
      ],
      fee: '500000', // 0.5 credits
    };
  }

  /**
   * Build transaction for revealing commitment
   */
  buildRevealTransaction(params: {
    launchId: string;
    secret: string;
    amount: string;
  }): AleoTransaction {
    return {
      programId: this.programId,
      functionName: 'reveal',
      inputs: [
        `${params.launchId}field`, // launch_id
        `${params.secret}field`, // secret (to verify commitment)
        `${params.amount}u64`, // amount
      ],
      fee: '500000', // 0.5 credits
    };
  }

  /**
   * Build transaction for finalizing launch and distributing tokens
   */
  buildFinalizeTransaction(params: {
    launchId: string;
  }): AleoTransaction {
    return {
      programId: this.programId,
      functionName: 'finalize_launch',
      inputs: [
        `${params.launchId}field`, // launch_id
      ],
      fee: '2000000', // 2 credits (higher due to distribution)
    };
  }

  /**
   * Build transaction for claiming allocated tokens
   */
  buildClaimTransaction(params: {
    launchId: string;
    allocation: string;
  }): AleoTransaction {
    return {
      programId: this.programId,
      functionName: 'claim_tokens',
      inputs: [
        `${params.launchId}field`, // launch_id
        `${params.allocation}u128`, // allocated_amount
      ],
      fee: '500000', // 0.5 credits
    };
  }

  /**
   * Generate commitment hash from secret
   */
  generateCommitmentHash(secret: string): string {
    return CryptoUtils.hash(secret);
  }

  /**
   * Verify that a secret matches a commitment
   */
  verifyCommitment(secret: string, commitment: string): boolean {
    const computedCommitment = this.generateCommitmentHash(secret);
    return computedCommitment === commitment;
  }

  /**
   * Convert Aleo field to string representation
   */
  fieldToString(field: string): string {
    return field.replace('field', '');
  }

  /**
   * Convert string to Aleo field representation
   */
  stringToField(value: string): string {
    return `${value}field`;
  }

  /**
   * Parse transaction ID from Aleo transaction response
   */
  parseTransactionId(txResponse: any): string {
    // This would parse the actual Aleo SDK response
    // For now, we assume the transaction ID is provided
    return txResponse.id || txResponse.transaction_id;
  }

  /**
   * Get current block height from Aleo network
   */
  async getCurrentBlockHeight(): Promise<number> {
    try {
      const response = await fetch(`${env.ALEO_API_URL}/latest/block`);
      const data = await response.json();
      return data.height || 0;
    } catch (error) {
      // Fallback to 0 if network is unavailable
      return 0;
    }
  }

  /**
   * Estimate blocks until timestamp
   */
  estimateBlocksUntil(targetTime: Date): number {
    const now = new Date();
    const diffMs = targetTime.getTime() - now.getTime();
    const diffSeconds = diffMs / 1000;

    // Aleo averages ~10 seconds per block
    const AVERAGE_BLOCK_TIME = 10;
    return Math.ceil(diffSeconds / AVERAGE_BLOCK_TIME);
  }

  /**
   * Estimate timestamp for future block
   */
  estimateTimestampForBlock(currentBlock: number, targetBlock: number): Date {
    const blockDiff = targetBlock - currentBlock;
    const AVERAGE_BLOCK_TIME = 10; // seconds

    const secondsUntilTarget = blockDiff * AVERAGE_BLOCK_TIME;
    return new Date(Date.now() + secondsUntilTarget * 1000);
  }
}

export default new AleoService();
