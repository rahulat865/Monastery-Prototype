import React, { useState, useEffect } from 'react';
import { performComparison, getImagesByLocation, getImageById } from '../services/api';

/**
 * ImageComparison Component
 * Select and compare baseline vs current images
 */
const ImageComparison = ({ onComparisonComplete }) => {
  const [location, setLocation] = useState('');
  const [structureComponent, setStructureComponent] = useState('');
  const [baselineImage, setBaselineImage] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [baselinePreview, setBaselinePreview] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState(null);

  // Load images when location/component changes
  const handleLoadImages = async () => {
    if (!location) {
      setError('Please enter a location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getImagesByLocation(location, structureComponent);
      
      if (result.data.baseline) {
        setBaselineImage(result.data.baseline);
        // Load preview
        const preview = await getImageById(result.data.baseline._id);
        setBaselinePreview(preview);
      } else {
        setBaselineImage(null);
        setBaselinePreview(null);
        setError('No baseline image found for this location');
      }

      if (result.data.current) {
        setCurrentImage(result.data.current);
        // Load preview
        const preview = await getImageById(result.data.current._id);
        setCurrentPreview(preview);
      } else {
        setCurrentImage(null);
        setCurrentPreview(null);
        setError('No current image found for this location');
      }

    } catch (err) {
      setError(err.error || err.message || 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  // Perform comparison
  const handleCompare = async () => {
    if (!baselineImage || !currentImage) {
      setError('Both baseline and current images are required');
      return;
    }

    setComparing(true);
    setError(null);

    try {
      const result = await performComparison(
        baselineImage._id,
        currentImage._id,
        {
          location,
          structureComponent,
        }
      );

      // Notify parent component
      if (onComparisonComplete) {
        onComparisonComplete(result.data);
      }

    } catch (err) {
      setError(err.error || err.message || 'Comparison failed');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="image-comparison">
      <h3>Compare Images</h3>

      {/* Location Input */}
      <div className="comparison-form">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Main Hall"
          />
        </div>

        <div className="form-group">
          <label htmlFor="structureComponent">Structure Component</label>
          <input
            type="text"
            id="structureComponent"
            value={structureComponent}
            onChange={(e) => setStructureComponent(e.target.value)}
            placeholder="e.g., North Wall"
          />
        </div>

        <button 
          onClick={handleLoadImages} 
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Loading...' : 'Load Images'}
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="error-message">{error}</div>}

      {/* Image Previews */}
      {(baselineImage || currentImage) && (
        <div className="image-previews">
          {/* Baseline Image */}
          <div className="image-card">
            <h4>Baseline Image</h4>
            {baselinePreview ? (
              <>
                <img src={baselinePreview} alt="Baseline" />
                <div className="image-info">
                  <p><strong>Uploaded:</strong> {new Date(baselineImage.uploadDate).toLocaleDateString()}</p>
                  <p><strong>File:</strong> {baselineImage.filename}</p>
                </div>
              </>
            ) : (
              <div className="no-image">No baseline image</div>
            )}
          </div>

          {/* Current Image */}
          <div className="image-card">
            <h4>Current Image</h4>
            {currentPreview ? (
              <>
                <img src={currentPreview} alt="Current" />
                <div className="image-info">
                  <p><strong>Uploaded:</strong> {new Date(currentImage.uploadDate).toLocaleDateString()}</p>
                  <p><strong>File:</strong> {currentImage.filename}</p>
                </div>
              </>
            ) : (
              <div className="no-image">No current image</div>
            )}
          </div>
        </div>
      )}

      {/* Compare Button */}
      {baselineImage && currentImage && (
        <div className="comparison-action">
          <button 
            onClick={handleCompare} 
            disabled={comparing}
            className="btn-primary btn-large"
          >
            {comparing ? 'Comparing Images...' : 'Compare Images'}
          </button>
          {comparing && (
            <p className="processing-message">
              Processing images with AI... This may take 10-30 seconds.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageComparison;
