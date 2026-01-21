// Aleo blockchain utilities

import { ALEO_TESTNET_URL, DEFAULT_FEE } from './constants';
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
 * Format an amount as u64 for Aleo
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
 * Build a transaction for AnonPay create_link
 */
export function buildCreateLinkTx(
  linkId: string,
  secret: string
): TransactionData {
  return {
    programId: 'anonpay_v1.aleo',
    functionName: 'create_link',
    inputs: [linkId, secret],
    fee: DEFAULT_FEE,
  };
}

/**
 * Build a transaction for AnonPay send_payment
 */
export function buildSendPaymentTx(
  linkId: string,
  amount: number,
  recipient: string,
  secret: string,
  paymentId: string
): TransactionData {
  return {
    programId: 'anonpay_v1.aleo',
    functionName: 'send_payment',
    inputs: [
      linkId,
      formatAmount(amount),
      recipient,
      secret,
      paymentId,
    ],
    fee: DEFAULT_FEE,
  };
}

/**
 * Build a transaction for PrivyDrop claim
 */
export function buildClaimTx(
  airdropId: string,
  amount: number,
  proofElements: Array<{ hash: string; isLeft: boolean }>,
  proofLength: number
): TransactionData {
  const inputs = [
    airdropId,
    formatAmount(amount),
    ...proofElements.map(p => `{ hash: ${p.hash}, is_left: ${p.isLeft} }`),
    proofLength.toString() + 'u8',
  ];

  return {
    programId: 'privydrop_v1.aleo',
    functionName: 'claim',
    inputs,
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
    programId: 'shadowlaunch_v1.aleo',
    functionName: 'commit',
    inputs: [launchId, formatAmount(amount), secret],
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
