import { Request, Response, NextFunction } from 'express';
import revealService from '../services/reveal.service';
import allocationService from '../services/allocation.service';
import { PrepareRevealInput, ApiResponse } from '../types';
import { CryptoUtils } from '../utils/crypto';
import env from '../config/env';

export class RevealsController {
  /**
   * Prepare a reveal transaction
   * POST /api/v1/reveals/prepare
   */
  async prepare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: PrepareRevealInput = req.body;

      const result = await revealService.prepareReveal(input);

      const response: ApiResponse = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm a reveal transaction
   * POST /api/v1/reveals/confirm
   */
  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId, userAddress, transactionId } = req.body;

      await revealService.confirmReveal(launchId, userAddress, transactionId);

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Reveal confirmed successfully',
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reveal statistics for a launch
   * GET /api/v1/reveals/stats/:launchId
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId } = req.params;

      const stats = await revealService.getRevealStats(launchId);

      const response: ApiResponse = {
        success: true,
        data: stats,
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get allocations for a launch
   * GET /api/v1/reveals/allocations/:launchId
   */
  async getAllocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId } = req.params;

      const allocations = await allocationService.calculateAllocations(launchId);
      const stats = await allocationService.getAllocationStats(launchId);

      const response: ApiResponse = {
        success: true,
        data: {
          allocations,
          stats,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's allocation
   * GET /api/v1/reveals/allocation/:launchId/:userAddress
   */
  async getUserAllocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId, userAddress } = req.params;
      const userAddressHash = CryptoUtils.hash(userAddress);

      const allocation = await allocationService.getUserAllocation(launchId, userAddressHash);

      if (!allocation) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ALLOCATION_NOT_FOUND',
            message: 'Allocation not found',
          },
          metadata: {
            timestamp: new Date().toISOString(),
            version: env.API_VERSION,
          },
        });
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: allocation,
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}

export default new RevealsController();
