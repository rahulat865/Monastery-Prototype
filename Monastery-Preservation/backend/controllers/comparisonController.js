import Comparison from '../models/Comparison.js';
import ImageMetadata from '../models/ImageMetadata.js';
import { downloadFromGridFS, uploadToGridFS } from '../utils/gridfs.js';
import { compareImages } from '../utils/pythonService.js';

/**
 * Compare two images (baseline vs current)
 * POST /api/comparisons/compare
 */
export const performComparison = async (req, res, next) => {
  try {
    const { baselineId, currentId, location, structureComponent } = req.body;

    // Validate input
    if (!baselineId || !currentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'baselineId and currentId are required',
      });
    }

    // Fetch metadata for both images
    const baselineMetadata = await ImageMetadata.findById(baselineId);
    const currentMetadata = await ImageMetadata.findById(currentId);

    if (!baselineMetadata || !currentMetadata) {
      return res.status(404).json({ error: 'One or both images not found' });
    }

    // Validate image types
    if (baselineMetadata.imageType !== 'baseline' || currentMetadata.imageType !== 'current') {
      return res.status(400).json({
        error: 'Invalid image types',
        message: 'First image must be baseline, second must be current',
      });
    }

    // Create pending comparison record
    const comparison = new Comparison({
      location: location || baselineMetadata.location,
      structureComponent: structureComponent || baselineMetadata.structureComponent,
      baselineImage: {
        gridfsId: baselineMetadata.gridfsId,
        metadataId: baselineMetadata._id,
        filename: baselineMetadata.filename,
        uploadDate: baselineMetadata.uploadDate,
      },
      currentImage: {
        gridfsId: currentMetadata.gridfsId,
        metadataId: currentMetadata._id,
        filename: currentMetadata.filename,
        uploadDate: currentMetadata.uploadDate,
      },
      status: 'processing',
      ssimScore: 0,
      severityLevel: 'MODERATE',
    });

    await comparison.save();

    // Download images from GridFS as buffers
    const startTime = Date.now();
    
    const baselineBuffer = await downloadFromGridFS(baselineMetadata.gridfsId);
    const currentBuffer = await downloadFromGridFS(currentMetadata.gridfsId);

    // Debug logging
    console.log('Baseline buffer size:', baselineBuffer ? baselineBuffer.length : 'null');
    console.log('Current buffer size:', currentBuffer ? currentBuffer.length : 'null');
    console.log('Baseline buffer type:', typeof baselineBuffer);
    console.log('Current buffer type:', typeof currentBuffer);

    // Send to Python service for comparison
    const pythonResult = await compareImages(baselineBuffer, currentBuffer, {
      location: comparison.location,
      structureComponent: comparison.structureComponent,
    });

    // Convert base64 difference image to buffer
    let differenceImageId = null;
    let differenceMetadataId = null;

    if (pythonResult.difference_image) {
      const diffImageBuffer = Buffer.from(pythonResult.difference_image, 'base64');
      
      // Upload difference image to GridFS
      const diffUploadResult = await uploadToGridFS(diffImageBuffer, {
        filename: `diff_${Date.now()}.jpg`,
        contentType: 'image/jpeg',
        imageType: 'difference',
        location: comparison.location,
        structureComponent: comparison.structureComponent,
      });

      // Create metadata for difference image
      const diffMetadata = new ImageMetadata({
        gridfsId: diffUploadResult.fileId,
        imageType: 'difference',
        location: comparison.location,
        structureComponent: comparison.structureComponent,
        filename: `diff_${Date.now()}.jpg`,
        contentType: 'image/jpeg',
        size: diffUploadResult.size,
        comparisonId: comparison._id,
      });

      await diffMetadata.save();
      
      differenceImageId = diffUploadResult.fileId;
      differenceMetadataId = diffMetadata._id;
    }

    const processingTime = Date.now() - startTime;

    // Determine if images are identical (no change detected)
    const isIdentical = pythonResult.change_detected === false || 
                        pythonResult.severity === 'NO_CHANGE' || 
                        pythonResult.ssim_score >= 0.9999;

    // Update comparison with results
    comparison.ssimScore = pythonResult.ssim_score;
    comparison.severityLevel = pythonResult.severity;
    comparison.differenceImage = {
      gridfsId: differenceImageId,
      metadataId: differenceMetadataId,
      filename: `diff_${Date.now()}.jpg`,
      uploadDate: new Date(),
    };
    comparison.analysis = {
      differencePercentage: pythonResult.difference_percentage || 0,
      contourCount: pythonResult.contour_count || 0,
      affectedArea: pythonResult.affected_area || 0,
      changeDetected: !isIdentical,
      message: pythonResult.message || '',
      recommendations: generateRecommendations(pythonResult.severity, pythonResult.ssim_score, isIdentical),
    };
    comparison.processingTime = processingTime;
    comparison.status = 'completed';
    // Don't flag alert for identical images or excellent condition
    comparison.alertFlag = !isIdentical && ['POOR', 'CRITICAL'].includes(pythonResult.severity);

    await comparison.save();

    // Update image metadata with comparison reference
    await ImageMetadata.findByIdAndUpdate(baselineId, { comparisonId: comparison._id });
    await ImageMetadata.findByIdAndUpdate(currentId, { comparisonId: comparison._id });

    res.status(200).json({
      success: true,
      message: 'Comparison completed successfully',
      data: comparison,
    });
  } catch (error) {
    console.error('Comparison error:', error);
    
    // Update comparison status to failed if it exists
    if (req.body.comparisonId) {
      await Comparison.findByIdAndUpdate(req.body.comparisonId, {
        status: 'failed',
        error: {
          message: error.message,
          stack: error.stack,
        },
      });
    }
    
    next(error);
  }
};

/**
 * Get comparison by ID
 * GET /api/comparisons/:id
 */
export const getComparison = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comparison = await Comparison.findById(id)
      .populate('baselineImage.metadataId')
      .populate('currentImage.metadataId')
      .populate('differenceImage.metadataId');

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all comparisons with filtering
 * GET /api/comparisons
 */
export const getAllComparisons = async (req, res, next) => {
  try {
    const { 
      location, 
      severityLevel, 
      alertFlag, 
      status,
      limit = 50, 
      page = 1 
    } = req.query;

    // Build filter
    const filter = {};
    if (location) filter.location = location;
    if (severityLevel) filter.severityLevel = severityLevel;
    if (alertFlag !== undefined) filter.alertFlag = alertFlag === 'true';
    if (status) filter.status = status;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comparisons = await Comparison.find(filter)
      .sort({ comparisonDate: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('baselineImage.metadataId')
      .populate('currentImage.metadataId');

    const total = await Comparison.countDocuments(filter);

    res.json({
      success: true,
      data: comparisons,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get comparisons by location
 * GET /api/comparisons/location/:location
 */
export const getComparisonsByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;

    const comparisons = await Comparison.find({ location })
      .sort({ comparisonDate: -1 })
      .populate('baselineImage.metadataId')
      .populate('currentImage.metadataId')
      .populate('differenceImage.metadataId');

    res.json({
      success: true,
      data: comparisons,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comparison
 * DELETE /api/comparisons/:id
 */
export const deleteComparison = async (req, res, next) => {
  try {
    const { id } = req.params;

    const comparison = await Comparison.findByIdAndDelete(id);

    if (!comparison) {
      return res.status(404).json({ error: 'Comparison not found' });
    }

    res.json({
      success: true,
      message: 'Comparison deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate recommendations based on severity and score
 * Handles identical images (no change) gracefully
 */
const generateRecommendations = (severity, ssimScore, isIdentical = false) => {
  // Special case: identical images (no structural change)
  if (isIdentical || severity === 'NO_CHANGE') {
    return 'No structural change detected. Images are identical. Structure is in excellent condition.';
  }

  const recommendations = {
    EXCELLENT: 'No significant changes detected. Continue regular monitoring.',
    GOOD: 'Minor variations detected. No immediate action required. Schedule next inspection.',
    MODERATE: 'Moderate changes detected. Recommend detailed inspection within 3 months.',
    POOR: 'Significant structural changes detected. Professional assessment recommended within 1 month.',
    CRITICAL: 'URGENT: Critical deterioration detected. Immediate professional intervention required.',
  };

  return recommendations[severity] || 'Review required to determine appropriate action.';
};

export default {
  performComparison,
  getComparison,
  getAllComparisons,
  getComparisonsByLocation,
  deleteComparison,
};
