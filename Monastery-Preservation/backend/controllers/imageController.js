import ImageMetadata from '../models/ImageMetadata.js';
import { uploadToGridFS, streamFromGridFS, deleteFromGridFS } from '../utils/gridfs.js';

/**
 * Upload a new image to GridFS
 * POST /api/images/upload
 */
export const uploadImage = async (req, res, next) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate required metadata
    const { imageType, location, structureComponent } = req.body;
    
    if (!imageType || !location || !structureComponent) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'imageType, location, and structureComponent are required',
      });
    }

    // Validate imageType
    if (!['baseline', 'current', 'difference'].includes(imageType)) {
      return res.status(400).json({
        error: 'Invalid imageType',
        message: 'imageType must be: baseline, current, or difference',
      });
    }

    // Prepare GridFS metadata
    const gridfsMetadata = {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      imageType,
      location,
      structureComponent,
      additionalInfo: {
        captureDate: req.body.captureDate,
        camera: req.body.camera,
        notes: req.body.notes,
      },
    };

    // Upload to GridFS
    const uploadResult = await uploadToGridFS(req.file.buffer, gridfsMetadata);

    // Create metadata document
    const imageMetadata = new ImageMetadata({
      gridfsId: uploadResult.fileId,
      imageType,
      location,
      structureComponent,
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: uploadResult.size || req.file.size || req.file.buffer.length,
      metadata: {
        captureDate: req.body.captureDate,
        camera: req.body.camera,
        notes: req.body.notes,
      },
    });

    await imageMetadata.save();

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        id: imageMetadata._id,
        gridfsId: uploadResult.fileId,
        filename: req.file.originalname,
        imageType,
        location,
        structureComponent,
        size: uploadResult.size,
        uploadDate: imageMetadata.uploadDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get image by ID (streams the image)
 * GET /api/images/:id
 */
export const getImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find metadata
    const metadata = await ImageMetadata.findById(id);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Stream image from GridFS
    await streamFromGridFS(metadata.gridfsId, res);
  } catch (error) {
    next(error);
  }
};

/**
 * Get image metadata by ID
 * GET /api/images/:id/metadata
 */
export const getImageMetadata = async (req, res, next) => {
  try {
    const { id } = req.params;

    const metadata = await ImageMetadata.findById(id);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Image not found' });
    }

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all images with optional filtering
 * GET /api/images?imageType=baseline&location=MainHall
 */
export const getAllImages = async (req, res, next) => {
  try {
    const { imageType, location, structureComponent, limit = 50, page = 1 } = req.query;

    // Build filter query
    const filter = {};
    if (imageType) filter.imageType = imageType;
    if (location) filter.location = location;
    if (structureComponent) filter.structureComponent = structureComponent;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const images = await ImageMetadata.find(filter)
      .sort({ uploadDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ImageMetadata.countDocuments(filter);

    res.json({
      success: true,
      data: images,
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
 * Delete image
 * DELETE /api/images/:id
 */
export const deleteImage = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find metadata
    const metadata = await ImageMetadata.findById(id);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from GridFS
    await deleteFromGridFS(metadata.gridfsId);

    // Delete metadata
    await ImageMetadata.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get images by location and type (for comparison)
 * GET /api/images/location/:location
 */
export const getImagesByLocation = async (req, res, next) => {
  try {
    const { location } = req.params;
    const { structureComponent } = req.query;

    const filter = { location };
    if (structureComponent) {
      filter.structureComponent = structureComponent;
    }

    // Get baseline and current images
    const baseline = await ImageMetadata.findOne({ 
      ...filter, 
      imageType: 'baseline' 
    }).sort({ uploadDate: -1 });

    const current = await ImageMetadata.findOne({ 
      ...filter, 
      imageType: 'current' 
    }).sort({ uploadDate: -1 });

    res.json({
      success: true,
      data: {
        location,
        structureComponent,
        baseline,
        current,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all images by type (baseline, current, difference)
 * GET /api/images/type/:imageType
 */
export const getImagesByType = async (req, res, next) => {
  try {
    const { imageType } = req.params;
    
    // Validate image type
    const validTypes = ['baseline', 'current', 'difference'];
    if (!validTypes.includes(imageType)) {
      return res.status(400).json({ 
        error: `Invalid image type. Must be one of: ${validTypes.join(', ')}` 
      });
    }

    // Get all images of this type, sorted by most recent
    const images = await ImageMetadata.find({ imageType })
      .sort({ uploadDate: -1 })
      .limit(100);

    res.json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  uploadImage,
  getImage,
  getImageMetadata,
  getAllImages,
  deleteImage,
  getImagesByLocation,
  getImagesByType,
};
