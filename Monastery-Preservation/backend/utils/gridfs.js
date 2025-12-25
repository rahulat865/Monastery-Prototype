import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/database.js';
import { Readable } from 'stream';

/**
 * Upload image buffer to GridFS
 * @param {Buffer} buffer - Image buffer
 * @param {Object} metadata - File metadata
 * @returns {Promise<Object>} Upload result with file ID
 */
export const uploadToGridFS = (buffer, metadata) => {
  return new Promise((resolve, reject) => {
    const gridfsBucket = getGridFSBucket();
    
    // Create a readable stream from buffer
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null); // Signal end of stream
    
    // Create upload stream with metadata
    const uploadStream = gridfsBucket.openUploadStream(metadata.filename, {
      contentType: metadata.contentType,
      metadata: {
        imageType: metadata.imageType,
        location: metadata.location,
        structureComponent: metadata.structureComponent,
        uploadDate: new Date(),
        ...metadata.additionalInfo,
      },
    });
    
    // Handle upload completion
    uploadStream.on('finish', () => {
      resolve({
        fileId: uploadStream.id,
        filename: metadata.filename,
        size: uploadStream.bytesWritten || buffer.length,
      });
    });
    
    // Handle errors
    uploadStream.on('error', (error) => {
      reject(new Error(`GridFS upload failed: ${error.message}`));
    });
    
    // Pipe buffer to GridFS
    readableStream.pipe(uploadStream);
  });
};

/**
 * Download image from GridFS as buffer
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<Buffer>} Image buffer
 */
export const downloadFromGridFS = (fileId) => {
  return new Promise((resolve, reject) => {
    const gridfsBucket = getGridFSBucket();
    
    // Ensure fileId is ObjectId
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId) 
      : fileId;
    
    const chunks = [];
    
    // Create download stream
    const downloadStream = gridfsBucket.openDownloadStream(objectId);
    
    // Collect chunks
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    // Combine chunks into buffer
    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
    
    // Handle errors
    downloadStream.on('error', (error) => {
      reject(new Error(`GridFS download failed: ${error.message}`));
    });
  });
};

/**
 * Stream image from GridFS to response
 * @param {ObjectId} fileId - GridFS file ID
 * @param {Response} res - Express response object
 */
export const streamFromGridFS = async (fileId, res) => {
  try {
    const gridfsBucket = getGridFSBucket();
    
    // Ensure fileId is ObjectId
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId) 
      : fileId;
    
    // Get file metadata first
    const files = await gridfsBucket.find({ _id: objectId }).toArray();
    
    if (!files || files.length === 0) {
      throw new Error('File not found in GridFS');
    }
    
    const file = files[0];
    
    // Set appropriate headers
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Length', file.length);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);
    
    // Create and pipe download stream to response
    const downloadStream = gridfsBucket.openDownloadStream(objectId);
    downloadStream.pipe(res);
    
    // Handle stream errors
    downloadStream.on('error', (error) => {
      console.error('Stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 */
export const deleteFromGridFS = async (fileId) => {
  try {
    const gridfsBucket = getGridFSBucket();
    
    // Ensure fileId is ObjectId
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId) 
      : fileId;
    
    await gridfsBucket.delete(objectId);
    return { success: true, message: 'File deleted from GridFS' };
  } catch (error) {
    throw new Error(`GridFS deletion failed: ${error.message}`);
  }
};

/**
 * Get file metadata from GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<Object>} File metadata
 */
export const getFileMetadata = async (fileId) => {
  try {
    const gridfsBucket = getGridFSBucket();
    
    // Ensure fileId is ObjectId
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId) 
      : fileId;
    
    const files = await gridfsBucket.find({ _id: objectId }).toArray();
    
    if (!files || files.length === 0) {
      throw new Error('File not found in GridFS');
    }
    
    return files[0];
  } catch (error) {
    throw new Error(`Failed to get file metadata: ${error.message}`);
  }
};

/**
 * Check if file exists in GridFS
 * @param {ObjectId} fileId - GridFS file ID
 * @returns {Promise<Boolean>}
 */
export const fileExists = async (fileId) => {
  try {
    const gridfsBucket = getGridFSBucket();
    
    // Ensure fileId is ObjectId
    const objectId = typeof fileId === 'string' 
      ? new mongoose.Types.ObjectId(fileId) 
      : fileId;
    
    const files = await gridfsBucket.find({ _id: objectId }).toArray();
    return files && files.length > 0;
  } catch (error) {
    return false;
  }
};

export default {
  uploadToGridFS,
  downloadFromGridFS,
  streamFromGridFS,
  deleteFromGridFS,
  getFileMetadata,
  fileExists,
};
