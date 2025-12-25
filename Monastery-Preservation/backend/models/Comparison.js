import mongoose from 'mongoose';

/**
 * Schema for storing comparison reports
 * Links baseline, current, and difference images
 * Stores SSIM scores and severity analysis
 */
const comparisonSchema = new mongoose.Schema({
  // Location and component being analyzed
  location: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  
  structureComponent: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Image references (GridFS IDs)
  baselineImage: {
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImageMetadata',
      required: true,
    },
    filename: String,
    uploadDate: Date,
  },
  
  currentImage: {
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    metadataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImageMetadata',
      required: true,
    },
    filename: String,
    uploadDate: Date,
  },
  
  differenceImage: {
    gridfsId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    metadataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ImageMetadata',
    },
    filename: String,
    uploadDate: Date,
  },
  
  // SSIM Analysis Results
  ssimScore: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  
  // Severity classification based on SSIM
  // NO_CHANGE: Images are identical (SSIM >= 0.9999)
  severityLevel: {
    type: String,
    enum: ['NO_CHANGE', 'EXCELLENT', 'GOOD', 'MODERATE', 'POOR', 'CRITICAL'],
    required: true,
  },
  
  // Detailed analysis
  analysis: {
    differencePercentage: Number,
    contourCount: Number, // Number of difference regions detected
    affectedArea: Number, // Percentage of image area affected
    recommendations: String,
  },
  
  // Comparison metadata
  comparisonDate: {
    type: Date,
    default: Date.now,
    index: true,
  },
  
  // Processing information
  processingTime: {
    type: Number, // milliseconds
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  
  // Error handling
  error: {
    message: String,
    stack: String,
  },
  
  // Notes from conservator/analyst
  notes: String,
  
  // Alert flag for critical issues
  alertFlag: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
comparisonSchema.index({ location: 1, comparisonDate: -1 });
comparisonSchema.index({ severityLevel: 1, comparisonDate: -1 });
comparisonSchema.index({ alertFlag: 1, comparisonDate: -1 });

// Virtual for getting severity color code
comparisonSchema.virtual('severityColor').get(function() {
  const colors = {
    EXCELLENT: '#10b981', // green
    GOOD: '#22c55e',      // light green
    MODERATE: '#eab308',  // yellow
    POOR: '#f97316',      // orange
    CRITICAL: '#ef4444',  // red
  };
  return colors[this.severityLevel] || '#6b7280';
});

// Ensure virtuals are included in JSON
comparisonSchema.set('toJSON', { virtuals: true });

const Comparison = mongoose.model('Comparison', comparisonSchema);

export default Comparison;
