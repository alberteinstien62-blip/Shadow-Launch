import { Router, Request, Response, NextFunction } from 'express';
import commitService from '../services/commit.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/commits/prepare
 * Prepare a commitment for a launch
 */
router.post('/prepare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId, amount, userAddress, secret } = req.body;

    // Validate required fields
    if (!launchId || !amount || !userAddress) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: launchId, amount, userAddress',
        },
      });
    }

    const result = await commitService.prepareCommit({
      launchId,
      amount: parseFloat(amount),
      userAddress,
      secret,
    });

    res.json({
      success: true,
      data: {
        commitId: result.commitId,
        secret: result.secret,
        commitmentHash: result.commitmentHash,
        transaction: result.transaction,
      },
      message: 'Commitment prepared. Save your secret securely!',
      warning: 'You MUST save the secret to reveal your commitment later. Lost secrets = lost funds.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/commits/confirm
 * Confirm a commitment after transaction broadcast
 */
router.post('/confirm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { commitId, transactionId } = req.body;

    // Validate required fields
    if (!commitId || !transactionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: commitId, transactionId',
        },
      });
    }

    const commit = await commitService.confirmCommit({
      commitId,
      transactionId,
    });

    res.json({
      success: true,
      data: {
        commitId: commit.id,
        launchId: commit.launchId,
        confirmed: commit.confirmed,
        transactionId: commit.transactionId,
      },
      message: 'Commitment confirmed successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/commits/user/:launchId/:userAddress
 * Get user's commit for a launch
 */
router.get('/user/:launchId/:userAddress', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId, userAddress } = req.params;

    const commit = await commitService.getUserCommit(launchId, userAddress);

    if (!commit) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No commitment found for this user',
        },
      });
    }

    res.json({
      success: true,
      data: {
        commitId: commit.id,
        launchId: commit.launchId,
        amount: commit.amount,
        confirmed: commit.confirmed,
        revealed: commit.revealed,
        createdAt: commit.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/commits/launch/:launchId
 * Get all commits for a launch (admin only, returns limited info)
 */
router.get('/launch/:launchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId } = req.params;

    const commits = await commitService.getLaunchCommits(launchId);
    const count = await commitService.getCommitCount(launchId);

    // Return limited info for privacy
    res.json({
      success: true,
      data: {
        launchId,
        commitCount: count,
        commits: commits.map(c => ({
          id: c.id,
          confirmed: c.confirmed,
          revealed: c.revealed,
          createdAt: c.createdAt,
          // Amount is hidden during commit phase
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as commitRouter };
