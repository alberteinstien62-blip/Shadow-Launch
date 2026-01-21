import { Request, Response, NextFunction } from 'express';
import { LaunchStatus } from '@prisma/client';
import launchService from '../services/launch.service';
import aleoService from '../services/aleo.service';
import { CreateLaunchInput, ApiResponse } from '../types';
import logger from '../utils/logger';
import env from '../config/env';

// Valid launch statuses for filtering
const validStatuses: string[] = ['PENDING', 'COMMIT', 'REVEAL', 'DISTRIBUTION', 'ENDED'];

export class LaunchesController {
  /**
   * Create a new token launch
   * POST /api/v1/launches
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: CreateLaunchInput = req.body;

      // Create the launch
      const launch = await launchService.createLaunch(input);

      // Generate the Aleo transaction for creating the launch
      const transaction = aleoService.buildCreateLaunchTransaction({
        tokenSymbol: input.tokenSymbol,
        totalSupply: input.totalSupply,
        pricePerToken: input.pricePerToken,
        commitDuration: input.commitDurationBlocks,
        revealDuration: input.revealDurationBlocks,
      });

      const response: ApiResponse = {
        success: true,
        data: {
          launch,
          transaction,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: env.API_VERSION,
        },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific launch by ID
   * GET /api/v1/launches/:id
   */
  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const launch = await launchService.getLaunchById(id);

      if (!launch) {
        res.status(404).json({
          success: false,
          error: {
            code: 'LAUNCH_NOT_FOUND',
            message: 'Launch not found',
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
        data: launch,
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
   * List all launches with filtering
   * GET /api/v1/launches
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status, creatorAddress, page, limit } = req.query;

      // Validate status if provided
      const statusStr = status as string | undefined;
      const validatedStatus = statusStr && validStatuses.includes(statusStr)
        ? statusStr as LaunchStatus
        : undefined;

      const result = await launchService.listLaunches({
        status: validatedStatus,
        creatorAddress: creatorAddress as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

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
   * Start commit phase for a launch
   * POST /api/v1/launches/:id/start-commit
   */
  async startCommitPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const launch = await launchService.startCommitPhase(id);

      const response: ApiResponse = {
        success: true,
        data: launch,
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
   * Start reveal phase for a launch
   * POST /api/v1/launches/:id/start-reveal
   */
  async startRevealPhase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const launch = await launchService.startRevealPhase(id);

      const response: ApiResponse = {
        success: true,
        data: launch,
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
   * Complete a launch
   * POST /api/v1/launches/:id/complete
   */
  async completeLaunch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const launch = await launchService.completeLaunch(id);

      const response: ApiResponse = {
        success: true,
        data: launch,
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

export default new LaunchesController();
