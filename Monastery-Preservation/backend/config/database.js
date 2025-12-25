import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

let gfs, gridfsBucket;

/**
 * Connect to MongoDB and initialize GridFS
 * GridFS stores files larger than 16MB in chunks
 * We'll use it for all images regardless of size for consistency
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Initialize GridFS Stream
    const mongooseConnection = conn.connection;
    gfs = Grid(mongooseConnection.db, mongoose.mongo);
    gfs.collection('uploads'); // Collection name for GridFS

    // Initialize GridFSBucket (newer API, more efficient)
    gridfsBucket = new mongoose.mongo.GridFSBucket(mongooseConnection.db, {
      bucketName: 'uploads', // Must match gfs collection name
    });

    console.log('✅ GridFS Initialized');

    return { gfs, gridfsBucket };
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

/**
 * Get GridFS instance
 */
const getGFS = () => {
  if (!gfs) {
    throw new Error('GridFS not initialized. Call connectDB first.');
  }
  return gfs;
};

/**
 * Get GridFSBucket instance
 */
const getGridFSBucket = () => {
  if (!gridfsBucket) {
    throw new Error('GridFSBucket not initialized. Call connectDB first.');
  }
  return gridfsBucket;
};

export { connectDB, getGFS, getGridFSBucket };
