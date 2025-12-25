# Monastery Preservation - Image Comparison System

A complete MERN stack application for cultural heritage preservation that uses AI-powered image comparison to detect structural changes in monastery buildings.

---

## 📋 Table of Contents

1. [Features](#-features)
2. [Architecture](#-architecture)
3. [Prerequisites](#-prerequisites)
4. [Complete Installation Guide](#-complete-installation-guide)
5. [Dependencies Reference](#-dependencies-reference)
6. [Running the Application](#-running-the-application)
7. [Usage Guide](#-usage-guide)
8. [API Endpoints](#-api-endpoints)
9. [Configuration](#-configuration)
10. [Database Structure](#-database-structure)
11. [Image Processing Pipeline](#-image-processing-pipeline)
12. [Troubleshooting](#-troubleshooting)

---

## 🎯 Features

- **MongoDB GridFS Storage**: All images stored securely in MongoDB (no external cloud services)
- **AI-Powered Comparison**: Uses OpenCV and SSIM for structural similarity analysis
- **Real-time Processing**: Python microservice processes images and detects minute differences
- **Visual Difference Highlighting**: Generates annotated images showing detected changes
- **Severity Classification**: Automatic classification (NO_CHANGE, EXCELLENT, GOOD, MODERATE, POOR, CRITICAL)
- **Comprehensive Reports**: Downloadable reports in text and JSON formats
- **Responsive UI**: Modern React interface with image preview and comparison tools

---

## 🏗️ Architecture

```
┌─────────────┐         ┌─────────────┐         ┌──────────────┐
│   React     │ ◄─────► │   Node.js   │ ◄─────► │   MongoDB    │
│  Frontend   │  :5173  │   Backend   │  :27017 │   GridFS     │
│   (Vite)    │         │  (Express)  │         │              │
└─────────────┘         └─────┬───────┘         └──────────────┘
     :5173                    │ :5000
                              ▼
                        ┌──────────────┐
                        │   Python     │
                        │   Service    │ :5001
                        │ (Flask+OpenCV)│
                        └──────────────┘
```

---

## 📋 Prerequisites

Before installation, ensure you have the following installed on your system:

### Required Software

| Software | Minimum Version | Download Link |
|----------|-----------------|---------------|
| **Node.js** | 18.0+ | https://nodejs.org/ |
| **npm** | 9.0+ | (Comes with Node.js) |
| **Python** | 3.8+ | https://www.python.org/downloads/ |
| **MongoDB** | 5.0+ | https://www.mongodb.com/try/download/community |
| **Git** | 2.0+ | https://git-scm.com/downloads |

### Verify Installation

Open a terminal/PowerShell and run:

```powershell
# Check Node.js version
node --version
# Expected: v18.x.x or higher

# Check npm version
npm --version
# Expected: 9.x.x or higher

# Check Python version
python --version
# Expected: Python 3.8.x or higher

# Check MongoDB version
mongod --version
# Expected: db version v5.x or higher

# Check Git version
git --version
# Expected: git version 2.x.x
```

---

## 🚀 Complete Installation Guide

### Step 1: Clone or Navigate to Project

```powershell
# If cloning from repository
git clone <repository-url>
cd preservation

# Or navigate to existing project
cd C:\Users\91900\OneDrive\Desktop\preservation
```

---

### Step 2: MongoDB Setup

#### Option A: MongoDB as Windows Service (Recommended)

```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# Start MongoDB service if not running
net start MongoDB
```

#### Option B: Run MongoDB Manually

```powershell
# Create data directory if it doesn't exist
mkdir C:\data\db -ErrorAction SilentlyContinue

# Start MongoDB server
mongod --dbpath C:\data\db
```

**Verify MongoDB is running:**
```powershell
# Connect to MongoDB shell
mongosh

# You should see: "Connecting to: mongodb://127.0.0.1:27017"
# Type 'exit' to close
```

---

### Step 3: Backend Setup (Node.js + Express)

```powershell
# Navigate to backend directory
cd backend

# Install all dependencies
npm install
```

#### Backend Dependencies Installed:

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.18.2 | Web framework for Node.js |
| `mongoose` | ^8.0.3 | MongoDB ODM for data modeling |
| `multer` | ^1.4.5-lts.1 | File upload middleware |
| `multer-gridfs-storage` | ^5.0.2 | GridFS storage engine for Multer |
| `gridfs-stream` | ^1.1.1 | Stream interface for GridFS |
| `dotenv` | ^16.3.1 | Environment variable management |
| `cors` | ^2.8.5 | Cross-Origin Resource Sharing |
| `axios` | ^1.6.2 | HTTP client for API calls |
| `form-data` | ^4.0.0 | Form data handling for file uploads |
| `nodemon` | ^3.0.2 | (Dev) Auto-restart on file changes |

#### Create Environment File:

```powershell
# Create .env file in backend folder
@"
PORT=5000
MONGODB_URI=mongodb://localhost:27017/monastery_preservation
PYTHON_SERVICE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

---

### Step 4: Python Service Setup (Flask + OpenCV)

```powershell
# Navigate to python-service directory
cd ..\python-service

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate

# Upgrade pip (recommended)
python -m pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt
```

#### Python Dependencies Installed:

| Package | Purpose |
|---------|---------|
| `flask` | Lightweight web framework |
| `opencv-python` | Computer vision library for image processing |
| `scikit-image` | Image processing algorithms (SSIM) |
| `numpy` | Numerical computing for array operations |
| `Pillow` | Python Imaging Library for image handling |
| `python-dotenv` | Environment variable management |

#### Manual Installation (if requirements.txt fails):

```powershell
# Install each package individually
pip install flask
pip install opencv-python
pip install scikit-image
pip install numpy
pip install Pillow
pip install python-dotenv
```

#### Verify OpenCV Installation:

```powershell
python -c "import cv2; print('OpenCV Version:', cv2.__version__)"
# Expected: OpenCV Version: 4.x.x
```

#### Create Environment File:

```powershell
# Create .env file in python-service folder
@"
PORT=5001
MAX_IMAGE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
FLASK_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

---

### Step 5: Frontend Setup (React + Vite)

```powershell
# Navigate to frontend directory
cd ..\frontend

# Install all dependencies
npm install
```

#### Frontend Dependencies Installed:

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | ^18.2.0 | UI component library |
| `react-dom` | ^18.2.0 | React DOM rendering |
| `axios` | ^1.6.2 | HTTP client for API calls |
| `vite` | ^5.0.8 | (Dev) Fast build tool and dev server |
| `@vitejs/plugin-react` | ^4.2.1 | (Dev) React plugin for Vite |

#### Create Environment File:

```powershell
# Create .env file in frontend folder
@"
VITE_API_URL=http://localhost:5000
"@ | Out-File -FilePath .env -Encoding utf8
```

---

## 📦 Dependencies Reference

### Complete Dependency Summary

#### Backend (Node.js)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.3",
    "multer": "^1.4.5-lts.1",
    "multer-gridfs-storage": "^5.0.2",
    "gridfs-stream": "^1.1.1",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "axios": "^1.6.2",
    "form-data": "^4.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### Frontend (React)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
```

#### Python Service
```txt
flask
opencv-python
scikit-image
numpy
Pillow
python-dotenv
```

---

## ▶️ Running the Application

### Quick Start (3 Terminals Required)

Open **3 separate PowerShell/Terminal windows**:

#### Terminal 1: Start Backend
```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\backend
npm run dev
```
**Expected Output:**
```
✅ MongoDB Connected: localhost
✅ GridFS Initialized
✅ Python service is healthy
🚀 Server running on port 5000
```

#### Terminal 2: Start Python Service
```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\python-service
.\venv\Scripts\Activate
python app.py
```
**Expected Output:**
```
🐍 Starting Python Image Comparison Service
📊 Port: 5001
 * Running on http://127.0.0.1:5001
```

#### Terminal 3: Start Frontend
```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\frontend
npm run dev
```
**Expected Output:**
```
VITE v5.x.x ready in xxx ms
➜  Local:   http://localhost:5173/
```

### Access the Application

Open your browser and navigate to: **http://localhost:5173**

---

## 🎮 Usage Guide

### Step 1: Upload Baseline Image

1. Navigate to **Upload Images** tab
2. Select **"Baseline"** as Image Type
3. Fill in required fields:
   - **Location**: e.g., "Main Hall", "East Wing"
   - **Structure Component**: e.g., "Entrance Door", "Ceiling"
4. (Optional) Add: Capture Date, Camera, Notes
5. Click **Upload**

### Step 2: Upload Current Image

1. Select **"Current"** as Image Type
2. Use the **same Location and Structure Component** as baseline
3. Click **Upload**

### Step 3: Compare Images

1. Navigate to **Compare Images** tab
2. Select a baseline from the dropdown
3. Upload or select a current image
4. Click **Compare Images**
5. Wait 10-30 seconds for processing

### Step 4: View Results

Results display automatically showing:
- **SSIM Score**: Similarity percentage (0-100%)
- **Severity Level**: Color-coded assessment
- **Visual Comparison**: Side-by-side images with differences highlighted
- **Recommendations**: AI-generated preservation advice

---

## 📡 API Endpoints

### Image Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images/upload` | Upload image to GridFS |
| GET | `/api/images` | Get all images (with filters) |
| GET | `/api/images/:id` | Stream image by ID |
| GET | `/api/images/:id/metadata` | Get image metadata |
| GET | `/api/images/location/:location` | Get images by location |
| DELETE | `/api/images/:id` | Delete image |

### Comparison Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/comparisons/compare` | Perform comparison |
| GET | `/api/comparisons` | Get all comparisons |
| GET | `/api/comparisons/:id` | Get comparison by ID |
| GET | `/api/comparisons/location/:location` | Get comparisons by location |
| DELETE | `/api/comparisons/:id` | Delete comparison |

### Python Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/compare` | Compare two images |
| GET | `/api/test` | Test endpoint |

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/monastery_preservation
PYTHON_SERVICE_URL=http://localhost:5001
CLIENT_URL=http://localhost:5173
```

### Python Service (.env)
```env
PORT=5001
MAX_IMAGE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,webp
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

## 📊 Database Structure

### Collections

1. **uploads.files** - GridFS file metadata
2. **uploads.chunks** - GridFS file chunks (binary data)
3. **imagemetadata** - Image metadata and references
4. **comparisons** - Comparison reports and results

## 🎨 Image Processing Pipeline

1. **Preprocessing**
   - Resize images to 800x600
   - Convert to grayscale
   - Apply Gaussian blur (noise reduction)

2. **SSIM Comparison**
   - Compute structural similarity index
   - Generate difference matrix

3. **Difference Detection**
   - Threshold difference image
   - Find contours of changes
   - Calculate affected area

4. **Visualization**
   - Highlight differences in red
   - Draw bounding boxes
   - Apply semi-transparent overlay

5. **Classification**
   - SSIM ≥ 0.95: EXCELLENT
   - SSIM ≥ 0.9999: NO_CHANGE (Identical images)
   - SSIM ≥ 0.95: EXCELLENT
   - SSIM ≥ 0.85: GOOD
   - SSIM ≥ 0.70: MODERATE
   - SSIM ≥ 0.50: POOR
   - SSIM < 0.50: CRITICAL

## 🛡️ Error Handling

- **Backend**: Comprehensive error middleware with detailed messages
- **Python Service**: Input validation and graceful error responses
- **Frontend**: User-friendly error displays and loading states
- **GridFS**: Automatic retry and validation for storage operations
- **Identical Images**: Gracefully handles comparison of identical images (returns NO_CHANGE)

## 🔒 Best Practices Implemented

✅ **No External Storage**: All images in MongoDB GridFS  
✅ **Memory-Safe Uploads**: Multer memory storage with buffer handling  
✅ **Binary Data Transfer**: Efficient image streaming between services  
✅ **Scalable Architecture**: Microservice design for easy scaling  
✅ **Comprehensive Logging**: Detailed console logs for debugging  
✅ **Type Safety**: Proper validation and error handling  
✅ **Responsive Design**: Mobile-friendly UI with gradient theme  
✅ **API Documentation**: Clear endpoint descriptions and usage  

## 📈 Performance Considerations

- Image resizing to standard size (800x600) for consistent processing
- GridFS streaming for memory-efficient file transfers
- Background processing support for long-running comparisons
- Indexed database queries for fast retrieval
- Connection pooling for MongoDB

## 🐛 Troubleshooting

### MongoDB Issues

```powershell
# Check if MongoDB is running
Get-Service MongoDB

# Start MongoDB service
net start MongoDB

# Or run manually
mongod --dbpath C:\data\db
```

### Backend won't start

```powershell
# Check if port 5000 is in use
netstat -ano | Select-String ":5000"

# Kill process using port 5000 (replace PID)
Stop-Process -Id <PID> -Force

# Verify .env exists
Get-Content backend\.env

# Reinstall dependencies
cd backend
Remove-Item node_modules -Recurse -Force
npm install
```

### Python service errors

```powershell
# Activate virtual environment
cd python-service
.\venv\Scripts\Activate

# Verify Python version
python --version

# Reinstall all dependencies
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall

# Test OpenCV installation
python -c "import cv2; print('OpenCV:', cv2.__version__)"

# Test scikit-image installation
python -c "from skimage.metrics import structural_similarity; print('SSIM OK')"
```

### Frontend can't connect

```powershell
# Check if backend is running
Invoke-RestMethod -Uri "http://localhost:5000/health"

# Verify frontend .env
Get-Content frontend\.env

# Restart frontend
cd frontend
npm run dev
```

### Comparison fails with 500 error

```powershell
# Check Python service is running
Invoke-RestMethod -Uri "http://localhost:5001/health"

# Restart Python service
cd python-service
.\venv\Scripts\Activate
python app.py
```

### Images won't upload
- Check file size < 10MB
- Verify file type (JPEG, PNG, WebP)
- Ensure MongoDB GridFS is initialized (check backend logs)

---

## 🎓 Learning Resources

- **MongoDB GridFS**: https://docs.mongodb.com/manual/core/gridfs/
- **OpenCV Python**: https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html
- **SSIM Algorithm**: https://scikit-image.org/docs/stable/auto_examples/transform/plot_ssim.html
- **React Hooks**: https://react.dev/reference/react
- **Vite**: https://vitejs.dev/guide/
- **Flask**: https://flask.palletsprojects.com/

---

## 📝 License

MIT License - Feel free to use for cultural heritage preservation projects

---

## 👥 Support

For issues or questions:
1. Check troubleshooting section above
2. Review API documentation
3. Examine console logs (browser and terminal)
4. Check all three services are running (Backend, Python, Frontend)

---

## 🔄 Quick Reference Commands

```powershell
# === Start All Services ===

# Terminal 1: Backend
cd C:\Users\91900\OneDrive\Desktop\preservation\backend
npm run dev

# Terminal 2: Python Service  
cd C:\Users\91900\OneDrive\Desktop\preservation\python-service
.\venv\Scripts\Activate
python app.py

# Terminal 3: Frontend
cd C:\Users\91900\OneDrive\Desktop\preservation\frontend
npm run dev

# === Health Checks ===
Invoke-RestMethod -Uri "http://localhost:5000/health"  # Backend
Invoke-RestMethod -Uri "http://localhost:5001/health"  # Python

# === Open Application ===
Start-Process "http://localhost:5173"
```

---

**Built with ❤️ for Cultural Heritage Preservation**
