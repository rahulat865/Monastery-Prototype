import mongoose from 'mongoose';

/**
 * Schema for storing image metadata
 * Actual image files are stored in GridFS (uploads.files and uploads.chunks collections)
 * This schema stores references and metadata
 */
const imageMetadataSchema = new mongoose.Schema({
  // GridFS file ID reference
  gridfsId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  
  // Image classification
  imageType: {
    type: String,
    enum: ['baseline', 'current', 'difference'],
    required: true,
  },
  
  // Location/structure identification
  location: {
    type: String,
    required: true,
    trim: true,
    index: true, // For quick location-based queries
  },
  
  // Structure component (wall, ceiling, pillar, etc.)
  structureComponent: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Original filename
  filename: {
    type: String,
    required: true,
  },
  
  // MIME type
  contentType: {
    type: String,
    required: true,
  },
  
  // File size in bytes
  size: {
    type: Number,
    required: true,
  },
  
  // Upload timestamp
  uploadDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Optional: Associated comparison report
  comparisonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comparison',
  },
  
  // Additional metadata
  metadata: {
    captureDate: Date,
    camera: String,
    resolution: String,
    notes: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
imageMetadataSchema.index({ location: 1, imageType: 1 });
imageMetadataSchema.index({ structureComponent: 1, imageType: 1 });

const ImageMetadata = mongoose.model('ImageMetadata', imageMetadataSchema);

export default ImageMetadata;
