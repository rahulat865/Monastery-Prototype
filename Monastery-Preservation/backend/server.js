import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { checkPythonServiceHealth } from './utils/pythonService.js';

// Import routes
import imageRoutes from './routes/imageRoutes.js';
import comparisonRoutes from './routes/comparisonRoutes.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', async (req, res) => {
  const pythonServiceHealthy = await checkPythonServiceHealth();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      database: 'connected',
      pythonService: pythonServiceHealthy ? 'healthy' : 'unavailable',
    },
  });
});

// API Routes
app.use('/api/images', imageRoutes);
app.use('/api/comparisons', comparisonRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Monastery Preservation API',
    version: '1.0.0',
    endpoints: {
      images: '/api/images',
      comparisons: '/api/comparisons',
      health: '/health',
    },
  });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB and initialize GridFS
    await connectDB();
    
    // Check Python service availability
    const pythonHealthy = await checkPythonServiceHealth();
    if (!pythonHealthy) {
      console.warn('⚠️  Python service is not available. Image comparison will not work.');
      console.warn('   Please ensure Python service is running on:', process.env.PYTHON_SERVICE_URL);
    } else {
      console.log('✅ Python service is healthy');
    }
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API available at: http://localhost:${PORT}`);
      console.log(`💾 MongoDB: ${process.env.MONGODB_URI}`);
      console.log(`🐍 Python Service: ${process.env.PYTHON_SERVICE_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

export default app;
