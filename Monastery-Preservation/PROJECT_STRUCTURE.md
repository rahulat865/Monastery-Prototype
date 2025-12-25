# Monastery Preservation - Image Comparison System

## 📁 Project Structure

```
preservation/
│
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   └── database.js               # MongoDB connection with GridFS
│   ├── controllers/
│   │   ├── imageController.js        # Image upload/retrieval logic
│   │   └── comparisonController.js   # Image comparison orchestration
│   ├── models/
│   │   ├── Comparison.js             # Comparison report schema
│   │   └── ImageMetadata.js          # Image metadata schema
│   ├── routes/
│   │   ├── imageRoutes.js            # Image upload/download routes
│   │   └── comparisonRoutes.js       # Comparison routes
│   ├── middleware/
│   │   ├── upload.js                 # Multer configuration
│   │   └── errorHandler.js           # Error handling middleware
│   ├── utils/
│   │   ├── gridfs.js                 # GridFS helper functions
│   │   └── pythonService.js          # Python service communication
│   ├── server.js                     # Express server entry point
│   ├── package.json
│   └── .env
│
├── python-service/                   # Python microservice
│   ├── app.py                        # Flask API
│   ├── image_processor.py            # OpenCV + SSIM logic
│   ├── requirements.txt              # Python dependencies
│   └── .env
│
├── frontend/                         # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImageUpload.jsx       # Image upload component
│   │   │   ├── ImageComparison.jsx   # Comparison display component
│   │   │   ├── ComparisonResults.jsx # Results with severity
│   │   │   └── ReportDownload.jsx    # Download functionality
│   │   ├── services/
│   │   │   └── api.js                # API service layer
│   │   ├── App.jsx                   # Main app component
│   │   ├── App.css                   # Styling
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
└── README.md                         # Project documentation
```

## 🔄 Data Flow

1. **Upload Baseline Image** → Frontend → Backend → MongoDB GridFS
2. **Upload Current Image** → Frontend → Backend → MongoDB GridFS
3. **Trigger Comparison** → Backend retrieves both images → Sends to Python Service
4. **Python Processing** → Receives images → SSIM comparison → Returns score + diff image
5. **Store Results** → Backend saves diff image to GridFS → Saves report to MongoDB
6. **Display Results** → Frontend shows all images + severity + score

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Axios
- **Backend**: Node.js, Express, Multer, Mongoose, GridFS-Stream
- **Database**: MongoDB (GridFS for image storage)
- **Python Service**: Flask, OpenCV, scikit-image (SSIM), NumPy
- **Image Processing**: OpenCV for preprocessing, SSIM for comparison

## 🚀 Key Features

- ✅ MongoDB GridFS for all image storage (no cloud services)
- ✅ Binary image transfer between services
- ✅ SSIM-based structural similarity detection
- ✅ Contour detection for minute differences
- ✅ Severity level classification
- ✅ Difference image highlighting
- ✅ Downloadable comparison reports
