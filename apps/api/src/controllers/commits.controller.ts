import { Request, Response, NextFunction } from 'express';
import commitService from '../services/commit.service';
import { PrepareCommitInput, ConfirmCommitInput, ApiResponse } from '../types';
import env from '../config/env';

export class CommitsController {
  /**
   * Prepare a commitment
   * POST /api/v1/commits/prepare
   */
  async prepare(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: PrepareCommitInput = req.body;

      const result = await commitService.prepareCommit(input);

      const response: ApiResponse = {
        success: true,
        data: result,
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
   * Confirm a commitment
   * POST /api/v1/commits/confirm
   */
  async confirm(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input: ConfirmCommitInput = req.body;

      const commit = await commitService.confirmCommit(input);

      const response: ApiResponse = {
        success: true,
        data: commit,
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
   * Get user's commit for a launch
   * GET /api/v1/commits/:launchId/:userAddress
   */
  async getUserCommit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId, userAddress } = req.params;

      const commit = await commitService.getUserCommit(launchId, userAddress);

      if (!commit) {
        res.status(404).json({
          success: false,
          error: {
            code: 'COMMIT_NOT_FOUND',
            message: 'Commit not found',
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
        data: commit,
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
   * Get all commits for a launch
   * GET /api/v1/commits/launch/:launchId
   */
  async getLaunchCommits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { launchId } = req.params;
      const { confirmed } = req.query;

      const commits = await commitService.getLaunchCommits(
        launchId,
        confirmed !== 'false'
      );

      const response: ApiResponse = {
        success: true,
        data: {
          commits,
          count: commits.length,
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
}

export default new CommitsController();
