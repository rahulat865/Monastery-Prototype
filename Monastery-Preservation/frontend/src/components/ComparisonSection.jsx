import React, { useState, useEffect } from 'react';
import { getImagesByType, uploadImage, performComparison, getImageById } from '../services/api';

/**
 * ComparisonSection Component
 * Purpose: Display baseline details + allow multiple current image uploads
 * Features:
 * - Read-only baseline display
 * - Upload multiple current images over time
 * - Auto-trigger comparison on current upload
 * - Timeline view of comparisons
 * - Baseline selection dropdown
 */
const ComparisonSection = ({ onComparisonComplete }) => {
  const [baselines, setBaselines] = useState([]);
  const [selectedBaseline, setSelectedBaseline] = useState(null);
  const [baselineImage, setBaselineImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Current image upload states
  const [currentFile, setCurrentFile] = useState(null);
  const [currentPreview, setCurrentPreview] = useState(null);
  const [currentMetadata, setCurrentMetadata] = useState({
    captureDate: '',
    camera: '',
    notes: ''
  });
  const [uploading, setUploading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonHistory, setComparisonHistory] = useState([]);

  // Load all baseline images on mount
  useEffect(() => {
    loadBaselines();
  }, []);

  // Load baseline image when selection changes
  useEffect(() => {
    if (selectedBaseline) {
      loadBaselineImage();
    }
  }, [selectedBaseline]);

  const loadBaselines = async () => {
    try {
      setLoading(true);
      const response = await getImagesByType('baseline');
      const baselineData = response.data || [];
      setBaselines(baselineData);
      
      // Auto-select first baseline if available
      if (baselineData.length > 0 && !selectedBaseline) {
        setSelectedBaseline(baselineData[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Failed to load baselines:', err);
      setError('Failed to load baseline images. Please ensure at least one baseline is uploaded.');
    } finally {
      setLoading(false);
    }
  };

  const loadBaselineImage = async () => {
    try {
      const response = await getImageById(selectedBaseline._id);
      const blob = new Blob([response.data], { type: selectedBaseline.contentType });
      const imageUrl = URL.createObjectURL(blob);
      setBaselineImage(imageUrl);
    } catch (err) {
      console.error('Failed to load baseline image:', err);
    }
  };

  // Handle baseline selection change
  const handleBaselineChange = (e) => {
    const baselineId = e.target.value;
    const baseline = baselines.find(b => b._id === baselineId);
    setSelectedBaseline(baseline);
    setComparisonHistory([]); // Clear history when changing baseline
  };

  // Handle current image file selection
  const handleCurrentImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should not exceed 10MB');
        return;
      }

      setCurrentFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Handle current metadata changes
  const handleMetadataChange = (e) => {
    const { name, value } = e.target;
    setCurrentMetadata(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Upload current image and trigger comparison
  const handleUploadAndCompare = async () => {
    if (!currentFile) {
      setError('Please select a current image');
      return;
    }

    if (!selectedBaseline) {
      setError('No baseline selected');
      return;
    }

    setUploading(true);
    setComparing(true);
    setError(null);

    try {
      // Step 1: Upload current image
      const uploadFormData = new FormData();
      uploadFormData.append('image', currentFile);
      uploadFormData.append('imageType', 'current');
      uploadFormData.append('location', selectedBaseline.location);
      uploadFormData.append('structureComponent', selectedBaseline.structureComponent);
      
      if (currentMetadata.captureDate) {
        uploadFormData.append('captureDate', currentMetadata.captureDate);
      }
      if (currentMetadata.camera) {
        uploadFormData.append('camera', currentMetadata.camera);
      }
      if (currentMetadata.notes) {
        uploadFormData.append('notes', currentMetadata.notes);
      }

      const uploadResponse = await uploadImage(uploadFormData);
      const currentImageData = uploadResponse.data;

      setUploading(false);

      // Step 2: Perform comparison automatically
      const comparisonPayload = {
        location: selectedBaseline.location,
        structureComponent: selectedBaseline.structureComponent
      };

      const comparisonResponse = await performComparison(
        selectedBaseline._id,
        currentImageData.id,
        comparisonPayload
      );

      const comparisonData = comparisonResponse.data;

      // Add to history
      setComparisonHistory(prev => [
        {
          ...comparisonData,
          currentImage: currentImageData,
          timestamp: new Date()
        },
        ...prev
      ]);

      // Notify parent component
      if (onComparisonComplete) {
        onComparisonComplete(comparisonData);
      }

      // Reset current upload form
      resetCurrentForm();

    } catch (err) {
      console.error('Upload/Comparison error:', err);
      setError(err.error || err.message || 'Failed to upload and compare images');
    } finally {
      setUploading(false);
      setComparing(false);
    }
  };

  // Reset current image form
  const resetCurrentForm = () => {
    setCurrentFile(null);
    setCurrentPreview(null);
    setCurrentMetadata({
      captureDate: '',
      camera: '',
      notes: ''
    });
  };

  // Get severity badge class
  const getSeverityClass = (severity) => {
    const severityMap = {
      'NO_CHANGE': 'severity-none',
      'EXCELLENT': 'severity-excellent',
      'MINOR': 'severity-minor',
      'MODERATE': 'severity-moderate',
      'MAJOR': 'severity-major',
      'CRITICAL': 'severity-critical'
    };
    return severityMap[severity] || 'severity-unknown';
  };

  if (loading) {
    return (
      <div className="comparison-section-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading baseline images...</p>
        </div>
      </div>
    );
  }

  if (baselines.length === 0) {
    return (
      <div className="comparison-section-container">
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>No Baseline Images Found</h3>
          <p>Please upload a baseline image first before performing comparisons.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="comparison-section-container">
      <div className="section-header">
        <h2>🔍 Comparison & Analysis</h2>
        <p className="section-description">
          Select a baseline image and upload current images to detect structural changes over time.
        </p>
      </div>

      {/* Baseline Selection */}
      <div className="baseline-selector">
        <label htmlFor="baseline-select">
          <strong>Select Baseline:</strong>
        </label>
        <select
          id="baseline-select"
          value={selectedBaseline?._id || ''}
          onChange={handleBaselineChange}
          className="baseline-dropdown"
        >
          {baselines.map(baseline => (
            <option key={baseline._id} value={baseline._id}>
              {baseline.location} - {baseline.structureComponent}
              {baseline.captureDate && ` (${new Date(baseline.captureDate).toLocaleDateString()})`}
            </option>
          ))}
        </select>
      </div>

      {/* Baseline Details (Read-Only) */}
      {selectedBaseline && (
        <div className="baseline-details-card">
          <h3>📋 Baseline Details</h3>
          <div className="baseline-content">
            {/* Baseline Image */}
            <div className="baseline-image-wrapper">
              {baselineImage ? (
                <img src={baselineImage} alt="Baseline" className="baseline-image" />
              ) : (
                <div className="image-loading">
                  <div className="spinner-small"></div>
                </div>
              )}
            </div>

            {/* Baseline Metadata */}
            <div className="baseline-metadata">
              <div className="metadata-row">
                <span className="metadata-label">Location:</span>
                <span className="metadata-value">{selectedBaseline.location}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">Structure:</span>
                <span className="metadata-value">{selectedBaseline.structureComponent}</span>
              </div>
              {selectedBaseline.captureDate && (
                <div className="metadata-row">
                  <span className="metadata-label">Capture Date:</span>
                  <span className="metadata-value">
                    {new Date(selectedBaseline.captureDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedBaseline.camera && (
                <div className="metadata-row">
                  <span className="metadata-label">Camera:</span>
                  <span className="metadata-value">{selectedBaseline.camera}</span>
                </div>
              )}
              <div className="metadata-row">
                <span className="metadata-label">Filename:</span>
                <span className="metadata-value">{selectedBaseline.filename}</span>
              </div>
              <div className="metadata-row">
                <span className="metadata-label">File Size:</span>
                <span className="metadata-value">
                  {(selectedBaseline.size / 1024).toFixed(2)} KB
                </span>
              </div>
              {selectedBaseline.notes && (
                <div className="metadata-row full-width">
                  <span className="metadata-label">Notes:</span>
                  <span className="metadata-value">{selectedBaseline.notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload Current Image */}
      <div className="current-upload-card">
        <h3>📤 Upload Current Image for Comparison</h3>
        <p className="upload-instruction">
          Upload a recent image of the same location/structure to detect changes.
        </p>

        {/* Current Image Upload */}
        <div className="current-upload-area">
          <input
            type="file"
            id="current-image"
            accept="image/*"
            onChange={handleCurrentImageChange}
            disabled={uploading || comparing}
            className="file-input"
          />
          <label htmlFor="current-image" className="file-label-small">
            {currentPreview ? (
              <div className="current-preview-container">
                <img src={currentPreview} alt="Current" className="current-preview" />
                <span className="change-text">Click to change</span>
              </div>
            ) : (
              <div className="upload-placeholder-small">
                <span className="upload-icon">🖼️</span>
                <span>Select current image</span>
              </div>
            )}
          </label>
        </div>

        {/* Current Image Metadata */}
        <div className="current-metadata-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current-date">Capture Date</label>
              <input
                type="date"
                id="current-date"
                name="captureDate"
                value={currentMetadata.captureDate}
                onChange={handleMetadataChange}
                disabled={uploading || comparing}
              />
            </div>
            <div className="form-group">
              <label htmlFor="current-camera">Camera</label>
              <input
                type="text"
                id="current-camera"
                name="camera"
                value={currentMetadata.camera}
                onChange={handleMetadataChange}
                placeholder="e.g., iPhone 13"
                disabled={uploading || comparing}
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="current-notes">Notes</label>
            <textarea
              id="current-notes"
              name="notes"
              value={currentMetadata.notes}
              onChange={handleMetadataChange}
              placeholder="Any observations about current conditions..."
              rows="3"
              disabled={uploading || comparing}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Upload & Compare Button */}
        <button
          onClick={handleUploadAndCompare}
          disabled={!currentFile || uploading || comparing}
          className="btn btn-primary btn-large"
        >
          {comparing ? (
            <>
              <span className="spinner-small"></span>
              {uploading ? 'Uploading...' : 'Comparing Images...'}
            </>
          ) : (
            <>
              <span>🔬</span>
              Upload & Compare
            </>
          )}
        </button>
      </div>

      {/* Comparison History Timeline */}
      {comparisonHistory.length > 0 && (
        <div className="comparison-history">
          <h3>📊 Comparison History</h3>
          <div className="timeline">
            {comparisonHistory.map((comparison, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-date">
                      {comparison.timestamp.toLocaleString()}
                    </span>
                    <span className={`severity-badge ${getSeverityClass(comparison.severityLevel)}`}>
                      {comparison.severityLevel}
                    </span>
                  </div>
                  <div className="timeline-details">
                    <div className="detail-item">
                      <strong>SSIM Score:</strong> {(comparison.ssimScore * 100).toFixed(2)}%
                    </div>
                    {comparison.analysis?.differencePercentage && (
                      <div className="detail-item">
                        <strong>Difference:</strong> {comparison.analysis.differencePercentage.toFixed(2)}%
                      </div>
                    )}
                    <button
                      onClick={() => onComparisonComplete && onComparisonComplete(comparison)}
                      className="btn btn-link"
                    >
                      View Full Results →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonSection;
