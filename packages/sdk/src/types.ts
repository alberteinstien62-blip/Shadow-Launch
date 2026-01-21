// Shared types for Aleo Privacy Suite

// AnonPay Types
export interface PaymentLink {
  id: string;
  username: string;
  displayName?: string;
  bio?: string;
  isActive: boolean;
  totalReceived: string;
  paymentCount: number;
  createdAt: Date;
}

export interface Payment {
  id: string;
  amount: string;
  senderHash: string;
  note?: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  transactionId?: string;
  createdAt: Date;
}

// PrivyDrop Types
export interface Airdrop {
  id: string;
  name: string;
  tokenSymbol: string;
  merkleRoot: string;
  totalAllocated: string;
  totalRecipients: number;
  totalClaimed: string;
  claimCount: number;
  startTime: Date;
  endTime: Date;
  status: 'PENDING' | 'ACTIVE' | 'ENDED';
}

export interface ClaimEligibility {
  eligible: boolean;
  amount?: string;
  claimed?: boolean;
  proof?: MerkleProof;
}

export interface MerkleProof {
  leaf: string;
  path: ProofElement[];
}

export interface ProofElement {
  hash: string;
  isLeft: boolean;
}

// ShadowLaunch Types
export interface Launch {
  id: string;
  name: string;
  tokenSymbol: string;
  totalSupply: string;
  pricePerToken: string;
  phase: LaunchPhase;
  commitEndTime: Date;
  revealEndTime: Date;
  participantCount: number;
  totalRevealed?: string;
  status: 'PENDING' | 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED';
}

export type LaunchPhase = 0 | 1 | 2 | 3 | 4;
// 0 = Pending
// 1 = Commit Phase
// 2 = Reveal Phase
// 3 = Distribution
// 4 = Ended

export interface Commitment {
  launchId: string;
  amount: string;
  secret: string;
  committedAt: Date;
}

export interface TokenAllocation {
  launchId: string;
  tokensAllocated: string;
  amountPaid: string;
  refundAmount: string;
}

// Transaction Types
export interface TransactionData {
  programId: string;
  functionName: string;
  inputs: string[];
  fee: number;
}

export interface TransactionResult {
  transactionId: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
}

// Wallet Types
export interface WalletState {
  connected: boolean;
  address: string | null;
  publicKey: string | null;
  loading: boolean;
  error: string | null;
}
