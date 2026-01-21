import { Router } from 'express';
import revealsController from '../controllers/reveals.controller';
import { validate } from '../middleware/validate.middleware';
import { prepareRevealSchema, confirmRevealSchema } from '../utils/validators';

const router = Router();

/**
 * @route   POST /api/v1/reveals/prepare
 * @desc    Prepare a reveal transaction
 * @access  Public
 */
router.post(
  '/prepare',
  validate(prepareRevealSchema),
  revealsController.prepare.bind(revealsController)
);

/**
 * @route   POST /api/v1/reveals/confirm
 * @desc    Confirm a reveal transaction
 * @access  Public
 */
router.post(
  '/confirm',
  validate(confirmRevealSchema),
  revealsController.confirm.bind(revealsController)
);

/**
 * @route   GET /api/v1/reveals/stats/:launchId
 * @desc    Get reveal statistics for a launch
 * @access  Public
 */
router.get(
  '/stats/:launchId',
  revealsController.getStats.bind(revealsController)
);

/**
 * @route   GET /api/v1/reveals/allocations/:launchId
 * @desc    Get all allocations for a launch
 * @access  Public
 */
router.get(
  '/allocations/:launchId',
  revealsController.getAllocations.bind(revealsController)
);

/**
 * @route   GET /api/v1/reveals/allocation/:launchId/:userAddress
 * @desc    Get user's allocation for a launch
 * @access  Public
 */
router.get(
  '/allocation/:launchId/:userAddress',
  revealsController.getUserAllocation.bind(revealsController)
);

export default router;
