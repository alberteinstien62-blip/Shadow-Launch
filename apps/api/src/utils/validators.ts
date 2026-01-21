import { z } from 'zod';

// Aleo address validation (aleo1... format, 63 characters)
export const aleoAddressSchema = z.string()
  .regex(/^aleo1[a-z0-9]{58}$/, 'Invalid Aleo address format');

// BigInt as string validation
export const bigIntStringSchema = z.string()
  .regex(/^\d+$/, 'Must be a valid positive integer string');

// Transaction ID validation
export const transactionIdSchema = z.string()
  .regex(/^at1[a-z0-9]+$/, 'Invalid Aleo transaction ID format');

// Create Launch Schema
export const createLaunchSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  tokenSymbol: z.string().min(1).max(10).regex(/^[A-Z0-9]+$/),
  totalSupply: bigIntStringSchema,
  pricePerToken: bigIntStringSchema,
  commitDurationBlocks: z.number().int().positive().max(100000),
  revealDurationBlocks: z.number().int().positive().max(100000),
  creatorAddress: aleoAddressSchema,
});

// Prepare Commit Schema
export const prepareCommitSchema = z.object({
  launchId: z.string().uuid(),
  userAddress: aleoAddressSchema,
  amount: bigIntStringSchema,
});

// Confirm Commit Schema
export const confirmCommitSchema = z.object({
  commitId: z.string().uuid(),
  transactionId: transactionIdSchema,
});

// Prepare Reveal Schema
export const prepareRevealSchema = z.object({
  launchId: z.string().uuid(),
  userAddress: aleoAddressSchema,
});

// Confirm Reveal Schema
export const confirmRevealSchema = z.object({
  launchId: z.string().uuid(),
  userAddress: aleoAddressSchema,
  transactionId: transactionIdSchema,
});

// Query Parameters
export const paginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default('1'),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default('10'),
});

export const launchFilterSchema = paginationSchema.extend({
  status: z.enum(['PENDING', 'COMMIT_PHASE', 'REVEAL_PHASE', 'COMPLETED', 'CANCELLED']).optional(),
  creatorAddress: aleoAddressSchema.optional(),
});

export type CreateLaunchInput = z.infer<typeof createLaunchSchema>;
export type PrepareCommitInput = z.infer<typeof prepareCommitSchema>;
export type ConfirmCommitInput = z.infer<typeof confirmCommitSchema>;
export type PrepareRevealInput = z.infer<typeof prepareRevealSchema>;
export type ConfirmRevealInput = z.infer<typeof confirmRevealSchema>;
export type LaunchFilterInput = z.infer<typeof launchFilterSchema>;
