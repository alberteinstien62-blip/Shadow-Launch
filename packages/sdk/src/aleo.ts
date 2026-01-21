// Aleo blockchain utilities for ShadowLaunch

import { ALEO_TESTNET_URL, DEFAULT_FEE, SHADOWLAUNCH_PROGRAM_ID } from './constants';
import type { TransactionData, TransactionResult } from './types';

/**
 * Convert a string to an Aleo field representation
 */
export function stringToField(str: string): string {
  let result = BigInt(0);
  for (let i = 0; i < str.length && i < 31; i++) {
    result = result * BigInt(256) + BigInt(str.charCodeAt(i));
  }
  return result.toString() + 'field';
}

/**
 * Generate a random field value
 */
export function randomField(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let result = BigInt(0);
  for (let i = 0; i < 31; i++) {
    result = result * BigInt(256) + BigInt(bytes[i]);
  }
  return result.toString() + 'field';
}

/**
 * Format an amount as u64 for Aleo (microcredits)
 */
export function formatAmount(amount: number): string {
  return Math.floor(amount * 1000000).toString() + 'u64';
}

/**
 * Parse a u64 amount from Aleo format
 */
export function parseAmount(aleoAmount: string): number {
  const numStr = aleoAmount.replace('u64', '');
  return parseInt(numStr) / 1000000;
}

/**
 * Build a transaction for ShadowLaunch create_launch
 */
export function buildCreateLaunchTx(
  launchId: string,
  tokenSymbol: string,
  totalSupply: number,
  pricePerToken: number,
  commitDurationBlocks: number,
  revealDurationBlocks: number
): TransactionData {
  return {
    programId: SHADOWLAUNCH_PROGRAM_ID,
    functionName: 'create_launch',
    inputs: [
      launchId,
      tokenSymbol,
      totalSupply.toString() + 'u64',
      formatAmount(pricePerToken),
      commitDurationBlocks.toString() + 'u32',
      revealDurationBlocks.toString() + 'u32',
    ],
    fee: DEFAULT_FEE,
  };
}

/**
 * Build a transaction for ShadowLaunch commit
 */
export function buildCommitTx(
  launchId: string,
  amount: number,
  secret: string
): TransactionData {
  return {
    programId: SHADOWLAUNCH_PROGRAM_ID,
    functionName: 'commit',
    inputs: [launchId, formatAmount(amount), secret],
    fee: DEFAULT_FEE,
  };
}

/**
 * Build a transaction for ShadowLaunch reveal
 */
export function buildRevealTx(
  launchId: string,
  secret: string,
  amount: number
): TransactionData {
  return {
    programId: SHADOWLAUNCH_PROGRAM_ID,
    functionName: 'reveal',
    inputs: [launchId, secret, formatAmount(amount)],
    fee: DEFAULT_FEE,
  };
}

/**
 * Fetch transaction status from Aleo network
 */
export async function getTransactionStatus(
  transactionId: string,
  rpcUrl: string = ALEO_TESTNET_URL
): Promise<TransactionResult> {
  try {
    const response = await fetch(`${rpcUrl}/transaction/${transactionId}`);
    if (!response.ok) {
      return { transactionId, status: 'pending' };
    }
    const data = await response.json();
    return {
      transactionId,
      status: data.status === 'confirmed' ? 'confirmed' : 'pending',
      blockHeight: data.block_height,
    };
  } catch (error) {
    return { transactionId, status: 'pending' };
  }
}

/**
 * Fetch mapping value from Aleo network
 */
export async function getMappingValue(
  programId: string,
  mappingName: string,
  key: string,
  rpcUrl: string = ALEO_TESTNET_URL
): Promise<string | null> {
  try {
    const response = await fetch(
      `${rpcUrl}/program/${programId}/mapping/${mappingName}/${key}`
    );
    if (!response.ok) return null;
    return await response.text();
  } catch (error) {
    return null;
  }
}
