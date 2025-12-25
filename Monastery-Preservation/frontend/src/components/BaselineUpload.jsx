import React, { useState } from 'react';
import { uploadImage } from '../services/api';

/**
 * BaselineUpload Component
 * Purpose: Upload BASELINE images ONLY with complete metadata
 * Features:
 * - Single baseline image upload per location/component
 * - Complete metadata capture
 * - Preview before upload
 * - Success confirmation
 * - Error handling
 */
const BaselineUpload = ({ onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    location: '',
    structureComponent: '',
    captureDate: '',
    camera: '',
    notes: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should not exceed 10MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!imageFile) {
      setError('Please select a baseline image');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.structureComponent.trim()) {
      setError('Structure component is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);
      uploadFormData.append('imageType', 'baseline');
      uploadFormData.append('location', formData.location.trim());
      uploadFormData.append('structureComponent', formData.structureComponent.trim());
      
      if (formData.captureDate) {
        uploadFormData.append('captureDate', formData.captureDate);
      }
      if (formData.camera) {
        uploadFormData.append('camera', formData.camera.trim());
      }
      if (formData.notes) {
        uploadFormData.append('notes', formData.notes.trim());
      }

      // Upload to backend
      const response = await uploadImage(uploadFormData);
      
      // Success!
      setSuccess('✅ Baseline image saved successfully!');
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Reset form after 2 seconds
      setTimeout(() => {
        resetForm();
      }, 2000);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.error || err.message || 'Failed to upload baseline image');
    } finally {
      setUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      location: '',
      structureComponent: '',
      captureDate: '',
      camera: '',
      notes: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="baseline-upload-container">
      <div className="section-header">
        <h2>📷 Upload Baseline Image</h2>
        <p className="section-description">
          Upload a reference image that will serve as the baseline for future comparisons.
          This should be a high-quality image of the structure in its current state.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="baseline-form">
        {/* Image Upload */}
        <div className="form-section">
          <h3>Baseline Image</h3>
          <div className="image-upload-area">
            <input
              type="file"
              id="baseline-image"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploading}
              className="file-input"
            />
            <label htmlFor="baseline-image" className="file-label">
              {imagePreview ? (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <span className="change-image-text">Click to change image</span>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📁</span>
                  <span className="upload-text">Click to select baseline image</span>
                  <span className="upload-hint">JPG, PNG, or HEIC (Max 10MB)</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="form-section">
          <h3>Location & Structure Details</h3>
          <div className="form-grid">
            {/* Location */}
            <div className="form-group">
              <label htmlFor="location">
                Location <span className="required">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Main Hall, East Wing"
                disabled={uploading}
                required
              />
              <span className="field-hint">The building or area name</span>
            </div>

            {/* Structure Component */}
            <div className="form-group">
              <label htmlFor="structureComponent">
                Structure Component <span className="required">*</span>
              </label>
              <input
                type="text"
                id="structureComponent"
                name="structureComponent"
                value={formData.structureComponent}
                onChange={handleInputChange}
                placeholder="e.g., North Wall, Ceiling"
                disabled={uploading}
                required
              />
              <span className="field-hint">Specific structural element</span>
            </div>

            {/* Capture Date */}
            <div className="form-group">
              <label htmlFor="captureDate">Capture Date</label>
              <input
                type="date"
                id="captureDate"
                name="captureDate"
                value={formData.captureDate}
                onChange={handleInputChange}
                disabled={uploading}
              />
              <span className="field-hint">When was this photo taken?</span>
            </div>

            {/* Camera */}
            <div className="form-group">
              <label htmlFor="camera">Camera Details</label>
              <input
                type="text"
                id="camera"
                name="camera"
                value={formData.camera}
                onChange={handleInputChange}
                placeholder="e.g., Canon EOS 5D, iPhone 13"
                disabled={uploading}
              />
              <span className="field-hint">Camera model used</span>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group full-width">
            <label htmlFor="notes">Additional Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any additional observations or context about this baseline image..."
              rows="4"
              disabled={uploading}
            />
            <span className="field-hint">Optional: weather conditions, lighting, restoration work, etc.</span>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            onClick={resetForm}
            disabled={uploading}
            className="btn btn-secondary"
          >
            Clear Form
          </button>
          <button
            type="submit"
            disabled={uploading || !imageFile}
            className="btn btn-primary"
          >
            {uploading ? (
              <>
                <span className="spinner-small"></span>
                Uploading Baseline...
              </>
            ) : (
              <>
                <span>💾</span>
                Save Baseline Image
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="info-box">
        <h4>💡 Best Practices</h4>
        <ul>
          <li>Use high-resolution images (minimum 2MP recommended)</li>
          <li>Ensure good lighting and minimal shadows</li>
          <li>Capture from a consistent angle for accurate comparisons</li>
          <li>Include reference objects for scale if possible</li>
          <li>Avoid extreme close-ups or wide shots</li>
        </ul>
      </div>
    </div>
  );
};

export default BaselineUpload;
