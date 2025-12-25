import express from 'express';
import {
  uploadImage,
  getImage,
  getImageMetadata,
  getAllImages,
  deleteImage,
  getImagesByLocation,
  getImagesByType,
} from '../controllers/imageController.js';
import { uploadSingle, handleMulterError } from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/images/upload
 * @desc    Upload a new image (baseline, current, or difference)
 * @access  Public
 * @body    { imageType, location, structureComponent, captureDate?, camera?, notes? }
 * @file    image (multipart/form-data)
 */
router.post('/upload', uploadSingle, handleMulterError, uploadImage);

/**
 * @route   GET /api/images/type/:imageType
 * @desc    Get all images of a specific type (baseline, current, difference)
 * @access  Public
 */
router.get('/type/:imageType', getImagesByType);

/**
 * @route   GET /api/images
 * @desc    Get all images with optional filtering
 * @access  Public
 * @query   imageType, location, structureComponent, limit, page
 */
router.get('/', getAllImages);

/**
 * @route   GET /api/images/location/:location
 * @desc    Get baseline and current images for a specific location
 * @access  Public
 * @query   structureComponent (optional)
 */
router.get('/location/:location', getImagesByLocation);

/**
 * @route   GET /api/images/:id
 * @desc    Stream image file by ID
 * @access  Public
 */
router.get('/:id', getImage);

/**
 * @route   GET /api/images/:id/metadata
 * @desc    Get image metadata by ID
 * @access  Public
 */
router.get('/:id/metadata', getImageMetadata);

/**
 * @route   DELETE /api/images/:id
 * @desc    Delete image and its metadata
 * @access  Public
 */
router.delete('/:id', deleteImage);

export default router;
