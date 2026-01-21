import { Router } from 'express';
import commitsController from '../controllers/commits.controller';
import { validate } from '../middleware/validate.middleware';
import { prepareCommitSchema, confirmCommitSchema } from '../utils/validators';

const router = Router();

/**
 * @route   POST /api/v1/commits/prepare
 * @desc    Prepare a commitment for a launch
 * @access  Public
 */
router.post(
  '/prepare',
  validate(prepareCommitSchema),
  commitsController.prepare.bind(commitsController)
);

/**
 * @route   POST /api/v1/commits/confirm
 * @desc    Confirm a commitment after transaction broadcast
 * @access  Public
 */
router.post(
  '/confirm',
  validate(confirmCommitSchema),
  commitsController.confirm.bind(commitsController)
);

/**
 * @route   GET /api/v1/commits/:launchId/:userAddress
 * @desc    Get user's commit for a launch
 * @access  Public
 */
router.get(
  '/:launchId/:userAddress',
  commitsController.getUserCommit.bind(commitsController)
);

/**
 * @route   GET /api/v1/commits/launch/:launchId
 * @desc    Get all commits for a launch
 * @access  Public
 */
router.get(
  '/launch/:launchId',
  commitsController.getLaunchCommits.bind(commitsController)
);

export default router;
