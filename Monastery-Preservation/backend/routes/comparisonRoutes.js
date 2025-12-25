import express from 'express';
import {
  performComparison,
  getComparison,
  getAllComparisons,
  getComparisonsByLocation,
  deleteComparison,
} from '../controllers/comparisonController.js';

const router = express.Router();

/**
 * @route   POST /api/comparisons/compare
 * @desc    Compare two images (baseline vs current)
 * @access  Public
 * @body    { baselineId, currentId, location?, structureComponent? }
 */
router.post('/compare', performComparison);

/**
 * @route   GET /api/comparisons
 * @desc    Get all comparisons with filtering
 * @access  Public
 * @query   location, severityLevel, alertFlag, status, limit, page
 */
router.get('/', getAllComparisons);

/**
 * @route   GET /api/comparisons/location/:location
 * @desc    Get all comparisons for a specific location
 * @access  Public
 */
router.get('/location/:location', getComparisonsByLocation);

/**
 * @route   GET /api/comparisons/:id
 * @desc    Get comparison by ID
 * @access  Public
 */
router.get('/:id', getComparison);

/**
 * @route   DELETE /api/comparisons/:id
 * @desc    Delete comparison
 * @access  Public
 */
router.delete('/:id', deleteComparison);

export default router;
