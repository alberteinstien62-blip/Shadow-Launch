import { Request } from 'express';

// Launch status type (matches schema)
export type LaunchStatus = 'PENDING' | 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'CANCELLED' | 'FAILED';

export interface AuthRequest extends Request {
  user?: {
    addressHash: string;
  };
}

export interface CreateLaunchInput {
  name: string;
  description?: string;
  tokenSymbol: string;
  totalSupply: string;
  pricePerToken: string;
  commitDurationBlocks: number;
  revealDurationBlocks: number;
  creatorAddress: string;
}

export interface PrepareCommitInput {
  launchId: string;
  userAddress: string;
  amount: string;
}

export interface PrepareCommitResponse {
  commitId: string;
  secretHash: string;
  encryptedSecret: string;
  transaction: AleoTransaction;
}

export interface ConfirmCommitInput {
  commitId: string;
  transactionId: string;
}

export interface PrepareRevealInput {
  launchId: string;
  userAddress: string;
}

export interface PrepareRevealResponse {
  secret: string;
  transaction: AleoTransaction;
}

export interface AleoTransaction {
  programId: string;
  functionName: string;
  inputs: string[];
  fee: string;
}

export interface LaunchWithStats {
  id: string;
  name: string;
  description?: string;
  tokenSymbol: string;
  totalSupply: string;
  pricePerToken: string;
  commitDurationBlocks: number;
  revealDurationBlocks: number;
  commitStartTime?: Date;
  commitEndTime?: Date;
  revealStartTime?: Date;
  revealEndTime?: Date;
  status: LaunchStatus;
  participantCount: number;
  totalCommitted: string;
  totalRevealed: string;
  creatorAddress: string;
  createdAt: Date;
  currentBlock?: number;
  timeRemaining?: number;
}

export interface AllocationResult {
  userAddressHash: string;
  commitment: string;
  allocation: string;
  refund: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export enum ErrorCode {
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Launch
  LAUNCH_NOT_FOUND = 'LAUNCH_NOT_FOUND',
  LAUNCH_NOT_ACTIVE = 'LAUNCH_NOT_ACTIVE',
  LAUNCH_ENDED = 'LAUNCH_ENDED',
  INVALID_PHASE = 'INVALID_PHASE',

  // Commit
  COMMIT_NOT_FOUND = 'COMMIT_NOT_FOUND',
  COMMIT_ALREADY_EXISTS = 'COMMIT_ALREADY_EXISTS',
  COMMIT_ALREADY_CONFIRMED = 'COMMIT_ALREADY_CONFIRMED',
  COMMIT_PHASE_ENDED = 'COMMIT_PHASE_ENDED',

  // Reveal
  REVEAL_NOT_READY = 'REVEAL_NOT_READY',
  REVEAL_ALREADY_DONE = 'REVEAL_ALREADY_DONE',
  REVEAL_PHASE_ENDED = 'REVEAL_PHASE_ENDED',
  NO_COMMIT_FOUND = 'NO_COMMIT_FOUND',

  // Auth
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
