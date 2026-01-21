import { Router } from 'express';
import launchesController from '../controllers/launches.controller';
import { validate } from '../middleware/validate.middleware';
import { authenticateToken } from '../middleware/auth.middleware';
import { createLaunchSchema, launchFilterSchema } from '../utils/validators';

const router = Router();

/**
 * @route   POST /api/v1/launches
 * @desc    Create a new token launch
 * @access  Public
 */
router.post(
  '/',
  validate(createLaunchSchema),
  launchesController.create.bind(launchesController)
);

/**
 * @route   GET /api/v1/launches
 * @desc    List all launches with filtering
 * @access  Public
 */
router.get(
  '/',
  validate(launchFilterSchema),
  launchesController.list.bind(launchesController)
);

/**
 * @route   GET /api/v1/launches/:id
 * @desc    Get a specific launch by ID
 * @access  Public
 */
router.get(
  '/:id',
  launchesController.getById.bind(launchesController)
);

/**
 * @route   POST /api/v1/launches/:id/start-commit
 * @desc    Start commit phase for a launch
 * @access  Creator only (authenticated)
 */
router.post(
  '/:id/start-commit',
  authenticateToken,
  launchesController.startCommitPhase.bind(launchesController)
);

/**
 * @route   POST /api/v1/launches/:id/start-reveal
 * @desc    Start reveal phase for a launch
 * @access  Creator only (authenticated)
 */
router.post(
  '/:id/start-reveal',
  authenticateToken,
  launchesController.startRevealPhase.bind(launchesController)
);

/**
 * @route   POST /api/v1/launches/:id/complete
 * @desc    Complete a launch
 * @access  Creator only (authenticated)
 */
router.post(
  '/:id/complete',
  authenticateToken,
  launchesController.completeLaunch.bind(launchesController)
);

export default router;
