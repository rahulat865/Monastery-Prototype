import React, { useState } from 'react';
import { uploadImage } from '../services/api';

/**
 * ImageUpload Component
 * Handles image upload with metadata
 */
const ImageUpload = ({ onUploadSuccess, imageType = 'baseline' }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [formData, setFormData] = useState({
    imageType: imageType,
    location: '',
    structureComponent: '',
    captureDate: '',
    camera: '',
    notes: '',
  });

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form field changes
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle upload
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }
    
    if (!formData.location || !formData.structureComponent) {
      setError('Location and Structure Component are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create FormData
      const uploadFormData = new FormData();
      uploadFormData.append('image', selectedFile);
      uploadFormData.append('imageType', formData.imageType);
      uploadFormData.append('location', formData.location);
      uploadFormData.append('structureComponent', formData.structureComponent);
      
      if (formData.captureDate) {
        uploadFormData.append('captureDate', formData.captureDate);
      }
      if (formData.camera) {
        uploadFormData.append('camera', formData.camera);
      }
      if (formData.notes) {
        uploadFormData.append('notes', formData.notes);
      }
      
      // Upload
      const result = await uploadImage(uploadFormData);
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setFormData({
        imageType: imageType,
        location: '',
        structureComponent: '',
        captureDate: '',
        camera: '',
        notes: '',
      });
      
      // Notify parent
      if (onUploadSuccess) {
        onUploadSuccess(result.data);
      }
      
      alert('Image uploaded successfully!');
    } catch (err) {
      setError(err.error || err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload">
      <h3>Upload {imageType.charAt(0).toUpperCase() + imageType.slice(1)} Image</h3>
      
      <form onSubmit={handleUpload}>
        {/* File Input */}
        <div className="form-group">
          <label htmlFor="file">Select Image *</label>
          <input
            type="file"
            id="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="image-preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        {/* Image Type */}
        <div className="form-group">
          <label htmlFor="imageType">Image Type *</label>
          <select
            id="imageType"
            name="imageType"
            value={formData.imageType}
            onChange={handleInputChange}
            required
          >
            <option value="baseline">Baseline</option>
            <option value="current">Current</option>
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Main Hall, East Wing"
            required
          />
        </div>

        {/* Structure Component */}
        <div className="form-group">
          <label htmlFor="structureComponent">Structure Component *</label>
          <input
            type="text"
            id="structureComponent"
            name="structureComponent"
            value={formData.structureComponent}
            onChange={handleInputChange}
            placeholder="e.g., North Wall, Ceiling"
            required
          />
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
          />
        </div>

        {/* Camera */}
        <div className="form-group">
          <label htmlFor="camera">Camera</label>
          <input
            type="text"
            id="camera"
            name="camera"
            value={formData.camera}
            onChange={handleInputChange}
            placeholder="e.g., Canon EOS R5"
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Additional notes..."
            rows="3"
          />
        </div>

        {/* Error Display */}
        {error && <div className="error-message">{error}</div>}

        {/* Submit Button */}
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  );
};

export default ImageUpload;
