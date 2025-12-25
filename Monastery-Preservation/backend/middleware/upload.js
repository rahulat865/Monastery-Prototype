import multer from 'multer';

/**
 * Multer configuration for handling image uploads
 * Uses memory storage to keep files in buffer for direct GridFS upload
 * No temporary files on disk
 */

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  // Allowed image types
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// Export different upload configurations

/**
 * Single image upload
 */
export const uploadSingle = upload.single('image');

/**
 * Multiple images upload (for batch processing)
 */
export const uploadMultiple = upload.array('images', 10); // Max 10 images

/**
 * Specific fields for comparison (baseline + current)
 */
export const uploadComparison = upload.fields([
  { name: 'baseline', maxCount: 1 },
  { name: 'current', maxCount: 1 },
]);

/**
 * Error handler for multer errors
 */
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 10MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  } else if (err) {
    return res.status(400).json({
      error: 'Invalid file',
      message: err.message,
    });
  }
  next();
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadComparison,
  handleMulterError,
};
