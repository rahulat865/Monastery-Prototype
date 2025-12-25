import axios from 'axios';
import FormData from 'form-data';

/**
 * Send images to Python microservice for comparison
 * @param {Buffer} baselineBuffer - Baseline image buffer
 * @param {Buffer} currentBuffer - Current image buffer
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Comparison results
 */
export const compareImages = async (baselineBuffer, currentBuffer, metadata = {}) => {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    
    // Create form data with image buffers
    const formData = new FormData();
    
    // Append images as buffers with filenames
    formData.append('baseline_image', baselineBuffer, {
      filename: 'baseline.jpg',
      contentType: 'image/jpeg',
    });
    
    formData.append('current_image', currentBuffer, {
      filename: 'current.jpg',
      contentType: 'image/jpeg',
    });
    
    // Append metadata
    if (metadata.location) {
      formData.append('location', metadata.location);
    }
    if (metadata.structureComponent) {
      formData.append('structure_component', metadata.structureComponent);
    }
    
    // Send POST request to Python service
    const response = await axios.post(
      `${pythonServiceUrl}/api/compare`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 60000, // 60 second timeout for processing
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Python service communication error:', error.message);
    
    // Provide more detailed error information
    if (error.response) {
      throw new Error(`Python service error: ${error.response.data?.error || error.response.statusText}`);
    } else if (error.request) {
      throw new Error('Python service is not responding. Please ensure it is running.');
    } else {
      throw new Error(`Failed to communicate with Python service: ${error.message}`);
    }
  }
};

/**
 * Check if Python service is healthy/available
 * @returns {Promise<Boolean>}
 */
export const checkPythonServiceHealth = async () => {
  try {
    const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${pythonServiceUrl}/health`, {
      timeout: 5000,
    });
    return response.status === 200;
  } catch (error) {
    console.error('Python service health check failed:', error.message);
    return false;
  }
};

export default {
  compareImages,
  checkPythonServiceHealth,
};
