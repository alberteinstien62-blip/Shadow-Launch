import { Router, Request, Response, NextFunction } from 'express';
import launchService from '../services/launch.service';
import CryptoJS from 'crypto-js';

// Launch status type (matches schema)
type LaunchStatus = 'PENDING' | 'COMMIT' | 'REVEAL' | 'DISTRIBUTION' | 'ENDED' | 'CANCELLED' | 'FAILED';

// Valid launch statuses
const validStatuses: string[] = ['PENDING', 'COMMIT', 'REVEAL', 'DISTRIBUTION', 'ENDED', 'CANCELLED', 'FAILED'];

// Hash helper
function hashData(data: string): string {
  return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
}

const router = Router();

/**
 * POST /api/launches
 * Create a new token launch
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    } = req.body;

    // Validate required fields
    if (!name || !tokenSymbol || !totalSupply || !pricePerToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: name, tokenSymbol, totalSupply, pricePerToken',
        },
      });
    }

    const launch = await launchService.createLaunch({
      name,
      tokenSymbol,
      totalSupply: parseFloat(totalSupply),
      pricePerToken: parseFloat(pricePerToken),
      commitDurationHours: parseInt(commitDurationHours) || 24,
      revealDurationHours: parseInt(revealDurationHours) || 12,
      creatorAddress,
      description,
      // New fields
      softCap: softCap ? parseFloat(softCap) : undefined,
      hardCap: hardCap ? parseFloat(hardCap) : undefined,
      maxPerWallet: maxPerWallet ? parseFloat(maxPerWallet) : undefined,
      minPerWallet: minPerWallet ? parseFloat(minPerWallet) : undefined,
      longDescription,
      websiteUrl,
      twitterUrl,
      discordUrl,
      telegramUrl,
      logoUrl,
      isAudited: isAudited === true || isAudited === 'true',
      auditUrl,
      auditFirm,
      isKycVerified: isKycVerified === true || isKycVerified === 'true',
      kycProvider,
      isSafu: isSafu === true || isSafu === 'true',
      teamAllocation: teamAllocation ? parseFloat(teamAllocation) : undefined,
      communityAllocation: communityAllocation ? parseFloat(communityAllocation) : undefined,
      liquidityAllocation: liquidityAllocation ? parseFloat(liquidityAllocation) : undefined,
      marketingAllocation: marketingAllocation ? parseFloat(marketingAllocation) : undefined,
      reserveAllocation: reserveAllocation ? parseFloat(reserveAllocation) : undefined,
      vestingEnabled: vestingEnabled === true || vestingEnabled === 'true',
      vestingCliff: vestingCliff ? parseInt(vestingCliff) : undefined,
      vestingDuration: vestingDuration ? parseInt(vestingDuration) : undefined,
      vestingInitialRelease: vestingInitialRelease ? parseFloat(vestingInitialRelease) : undefined,
    });

    res.status(201).json({
      success: true,
      launch,
      message: 'Launch created successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/launches
 * Get list of all launches
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit, offset } = req.query;

    // Validate status if provided
    const statusStr = status as string | undefined;
    const validatedStatus = statusStr && validStatuses.includes(statusStr)
      ? statusStr as LaunchStatus
      : undefined;

    const result = await launchService.getAllLaunches(
      validatedStatus,
      parseInt(limit as string) || 20,
      parseInt(offset as string) || 0
    );

    res.json({
      success: true,
      launches: result.launches,
      total: result.total,
      stats: {
        totalLaunches: result.total,
        activeLaunches: result.launches.filter(l => l.status !== 'ENDED' && l.status !== 'FAILED').length,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/launches/active
 * Get active launches only
 */
router.get('/active', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const launches = await launchService.getActiveLaunches();

    res.json({
      success: true,
      launches,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/launches/:id
 * Get launch by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const launch = await launchService.getLaunchById(id);

    if (!launch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Launch not found',
        },
      });
    }

    res.json({
      success: true,
      launch,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/launches/:id/allocation/:userAddress
 * Get user's allocation for a launch
 */
router.get('/:id/allocation/:userAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, userAddress } = req.params;
    const userAddressHash = hashData(userAddress);

    const allocation = await launchService.getUserAllocation(id, userAddressHash);

    if (!allocation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No allocation found for this user',
        },
      });
    }

    res.json({
      success: true,
      allocation: {
        tokensAllocated: allocation.tokensAllocated,
        committedAmount: allocation.committedAmount,
        refundAmount: allocation.refundAmount,
        claimed: allocation.claimed,
        claimedAt: allocation.claimedAt?.toISOString(),
        refunded: allocation.refunded,
        refundedAt: allocation.refundedAt?.toISOString(),
        totalVested: allocation.totalVested,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/launches/:id/claim
 * Claim tokens for a launch
 */
router.post('/:id/claim', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userAddress, transactionId } = req.body;

    if (!userAddress || !transactionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: userAddress, transactionId',
        },
      });
    }

    const userAddressHash = hashData(userAddress);
    const result = await launchService.processClaim(id, userAddressHash, transactionId);

    res.json({
      success: true,
      message: 'Tokens claimed successfully',
      claim: {
        tokensAllocated: result.tokensAllocated,
        totalVested: result.totalVested,
        claimedAt: result.claimedAt?.toISOString(),
        transactionId: result.claimTxId,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/launches/:id/refund
 * Request refund for a failed launch
 */
router.post('/:id/refund', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userAddress, transactionId } = req.body;

    if (!userAddress || !transactionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: userAddress, transactionId',
        },
      });
    }

    const userAddressHash = hashData(userAddress);
    const result = await launchService.processRefund(id, userAddressHash, transactionId);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        committedAmount: result.committedAmount,
        refundAmount: result.refundAmount,
        refundedAt: result.refundedAt?.toISOString(),
        transactionId: result.refundTxId,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/launches/:id
 * Update launch with on-chain status
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { transactionId, onChainStatus, onChainBlockHeight, launchIdHash } = req.body;

    const launch = await launchService.updateLaunch(id, {
      transactionId,
      onChainStatus,
      onChainBlockHeight: onChainBlockHeight ? parseInt(onChainBlockHeight) : undefined,
      launchIdHash,
    });

    res.json({
      success: true,
      launch,
      message: 'Launch updated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/launches/:id/soft-cap-status
 * Check if soft cap is met for a launch
 */
router.get('/:id/soft-cap-status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const launch = await launchService.getLaunchById(id);

    if (!launch) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Launch not found',
        },
      });
    }

    const isMet = await launchService.isSoftCapMet(id);

    res.json({
      success: true,
      softCap: launch.softCap,
      totalRevealed: launch.totalRevealed,
      isSoftCapMet: isMet,
      percentageReached: launch.softCap ? Math.min(100, (launch.totalRevealed / launch.softCap) * 100) : 100,
    });
  } catch (error) {
    next(error);
  }
});

export { router as launchRouter };
