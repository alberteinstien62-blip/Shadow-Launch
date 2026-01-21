import { Router, Request, Response, NextFunction } from 'express';
import revealService from '../services/reveal.service';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/reveals/prepare
 * Prepare a reveal transaction
 */
router.post('/prepare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId, userAddress, secret } = req.body;

    // Validate required fields
    if (!launchId || !userAddress || !secret) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: launchId, userAddress, secret',
        },
      });
    }

    const result = await revealService.prepareReveal({
      launchId,
      userAddress,
      secret,
    });

    res.json({
      success: true,
      data: {
        commitId: result.commitId,
        amount: result.amount,
        isValid: result.isValid,
        tokensAllocated: result.tokensAllocated,
        transaction: result.transaction,
      },
      message: 'Reveal prepared successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/reveals/confirm
 * Confirm a reveal after transaction broadcast
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

    const commit = await revealService.confirmReveal(commitId, transactionId);

    res.json({
      success: true,
      data: {
        commitId: commit.id,
        launchId: commit.launchId,
        revealed: commit.revealed,
        amount: commit.amount,
        transactionId: commit.revealTransactionId,
      },
      message: 'Reveal confirmed successfully. Your tokens will be distributed soon.',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reveals/stats/:launchId
 * Get reveal statistics for a launch
 */
router.get('/stats/:launchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId } = req.params;

    const stats = await revealService.getRevealStats(launchId);

    res.json({
      success: true,
      data: {
        launchId,
        ...stats,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reveals/launch/:launchId
 * Get all revealed commits for a launch
 */
router.get('/launch/:launchId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { launchId } = req.params;

    const reveals = await revealService.getRevealedCommits(launchId);

    // Return revealed amounts (these are now public)
    res.json({
      success: true,
      data: {
        launchId,
        revealCount: reveals.length,
        reveals: reveals.map(r => ({
          id: r.id,
          amount: r.amount,
          revealedAt: r.revealedAt,
          transactionId: r.revealTransactionId,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export { router as revealRouter };
