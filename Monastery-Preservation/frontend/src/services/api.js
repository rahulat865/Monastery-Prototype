/**
 * API Service Layer
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * IMAGE API
 */

// Upload image
export const uploadImage = async (formData) => {
  try {
    const response = await api.post('/api/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all images
export const getAllImages = async (filters = {}) => {
  try {
    const response = await api.get('/api/images', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get image by ID (returns blob for display)
export const getImageById = async (id) => {
  try {
    const response = await api.get(`/api/images/${id}`, {
      responseType: 'arraybuffer',
    });
    return response;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get images by type (baseline, current, difference)
export const getImagesByType = async (imageType) => {
  try {
    const response = await api.get(`/api/images/type/${imageType}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get image metadata
export const getImageMetadata = async (id) => {
  try {
    const response = await api.get(`/api/images/${id}/metadata`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get images by location
export const getImagesByLocation = async (location, structureComponent = '') => {
  try {
    const response = await api.get(`/api/images/location/${location}`, {
      params: { structureComponent },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete image
export const deleteImage = async (id) => {
  try {
    const response = await api.delete(`/api/images/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * COMPARISON API
 */

// Perform comparison
export const performComparison = async (baselineId, currentId, metadata = {}) => {
  try {
    const response = await api.post('/api/comparisons/compare', {
      baselineId,
      currentId,
      ...metadata,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get all comparisons
export const getAllComparisons = async (filters = {}) => {
  try {
    const response = await api.get('/api/comparisons', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get comparison by ID
export const getComparisonById = async (id) => {
  try {
    const response = await api.get(`/api/comparisons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get comparisons by location
export const getComparisonsByLocation = async (location) => {
  try {
    const response = await api.get(`/api/comparisons/location/${location}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete comparison
export const deleteComparison = async (id) => {
  try {
    const response = await api.delete(`/api/comparisons/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * HEALTH CHECK
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  uploadImage,
  getAllImages,
  getImageById,
  getImageMetadata,
  getImagesByLocation,
  deleteImage,
  performComparison,
  getAllComparisons,
  getComparisonById,
  getComparisonsByLocation,
  deleteComparison,
  checkHealth,
};
