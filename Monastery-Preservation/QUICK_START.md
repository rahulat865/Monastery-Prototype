# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have:

```powershell
# Check Node.js (should be 18+)
node --version

# Check npm
npm --version

# Check Python (should be 3.8+)
python --version

# Check MongoDB (should be 5.0+)
mongod --version
```

## 🚀 Quick Start (5 Minutes)

### 1. Start MongoDB

```powershell
# If MongoDB is not running, start it:
# Option A: As a service (if installed as service)
net start MongoDB

# Option B: Manually
mongod --dbpath C:\data\db
```

### 2. Start Backend (Terminal 1)

```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\backend
npm install
npm run dev
```

**Expected output:**
```
✅ MongoDB Connected: localhost
✅ GridFS Initialized
🚀 Server running on port 5000
```

### 3. Start Python Service (Terminal 2)

```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\python-service

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Start service
python app.py
```

**Expected output:**
```
🐍 Starting Python Image Comparison Service
📊 Port: 5001
 * Running on http://0.0.0.0:5001
```

### 4. Start Frontend (Terminal 3)

```powershell
cd C:\Users\91900\OneDrive\Desktop\preservation\frontend
npm install
npm run dev
```

**Expected output:**
```
VITE ready in XXX ms
➜  Local:   http://localhost:5173/
```

### 5. Open Browser

Navigate to: **http://localhost:5173**

## 📝 Step-by-Step Usage

### Upload Baseline Image

1. Click **"Upload Images"** tab
2. In the **left panel** (Baseline):
   - Click "Choose File" and select an image
   - Select "Baseline" as Image Type
   - Enter Location: `Main Hall`
   - Enter Structure Component: `North Wall`
   - (Optional) Fill in capture date, camera, notes
   - Click **"Upload Image"**
3. Wait for success message

### Upload Current Image

1. Still in "Upload Images" tab
2. In the **right panel** (Current):
   - Click "Choose File" and select a comparison image
   - Select "Current" as Image Type
   - Enter **same** Location: `Main Hall`
   - Enter **same** Structure Component: `North Wall`
   - Click **"Upload Image"**

### Compare Images

1. Click **"Compare Images"** tab
2. Enter Location: `Main Hall`
3. Enter Structure Component: `North Wall` (optional)
4. Click **"Load Images"**
   - Both baseline and current images should appear
5. Click **"Compare Images"**
   - Wait 10-30 seconds for AI processing
6. Results automatically display in Results tab

### View Results

1. **Results** tab shows:
   - SSIM Score (similarity percentage)
   - Severity Level (color-coded badge)
   - Baseline image
   - Current image
   - **Difference image** (with red highlights)
   - Detailed metrics
   - AI recommendations
2. Download reports:
   - Click "Download Text Report" for human-readable format
   - Click "Download JSON Data" for programmatic access

## 🔧 Common Issues & Solutions

### Issue: MongoDB connection error

**Solution:**
```powershell
# Check if MongoDB is running
Get-Process mongod

# If not running, start it
mongod --dbpath C:\data\db
```

### Issue: Python service not starting

**Solution:**
```powershell
# Make sure virtual environment is activated
.\venv\Scripts\Activate

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Backend shows "Python service unavailable"

**Check:**
1. Python service is running on port 5001
2. No firewall blocking localhost:5001
3. Check Python service terminal for errors

### Issue: Images won't upload

**Check:**
1. Image file size < 10MB
2. Image format is JPEG, PNG, or WebP
3. All required fields filled (imageType, location, structureComponent)
4. Backend terminal for detailed error messages

### Issue: Frontend can't connect to backend

**Solution:**
```powershell
# Check backend is running
# Verify .env file in frontend:
VITE_API_URL=http://localhost:5000

# Restart frontend after .env changes
```

## 📊 Testing the System

### Test 1: Health Check

```powershell
# Test backend
curl http://localhost:5000/health

# Test Python service
curl http://localhost:5001/health
```

### Test 2: Upload Test Image

Use Postman or cURL:
```powershell
curl -X POST http://localhost:5000/api/images/upload `
  -F "image=@C:\path\to\test.jpg" `
  -F "imageType=baseline" `
  -F "location=TestLocation" `
  -F "structureComponent=TestWall"
```

### Test 3: Get All Images

```powershell
curl http://localhost:5000/api/images
```

## 🎯 Quick Demo Workflow

1. **Prepare two similar images** (before/after of same scene)
   - Name them: `baseline.jpg` and `current.jpg`
   - Ensure they show slight differences

2. **Upload baseline.jpg**
   - Type: Baseline
   - Location: Demo Hall
   - Component: Test Wall

3. **Upload current.jpg**
   - Type: Current
   - Location: Demo Hall (same as baseline)
   - Component: Test Wall (same as baseline)

4. **Compare**
   - Load images for "Demo Hall"
   - Click Compare
   - View difference image with highlighted changes

5. **Download report**
   - Click "Download Text Report"
   - Review SSIM score and recommendations

## 🎨 Understanding Results

### SSIM Score Interpretation

- **95-100%** (EXCELLENT): Nearly identical, no action needed
- **85-94%** (GOOD): Minor variations, monitor regularly
- **70-84%** (MODERATE): Noticeable changes, inspect in 3 months
- **50-69%** (POOR): Significant changes, assess within 1 month
- **0-49%** (CRITICAL): Major deterioration, immediate action required

### Difference Image Colors

- **Red highlights**: Areas with detected changes
- **Red rectangles**: Bounding boxes around difference regions
- **Intensity**: Brighter red = more significant difference

### Metrics Explained

- **SSIM Score**: Overall structural similarity (0-100%)
- **Difference %**: Percentage of dissimilarity
- **Affected Area**: Percentage of image area with changes
- **Regions Detected**: Number of separate change areas found

## 🛠️ Development Mode

### Hot Reload

All services support hot reload:
- **Backend**: Uses `nodemon` (auto-restarts on file changes)
- **Python**: Manual restart required
- **Frontend**: Vite hot module replacement (instant updates)

### Debug Mode

Enable detailed logging:

**Backend:**
```javascript
// server.js - Already includes console.log statements
```

**Python:**
```python
# app.py - Set debug=True (already enabled in development)
```

## 📦 Production Deployment

For production deployment:

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Configure proper CORS origins

2. **Build Frontend**
   ```powershell
   cd frontend
   npm run build
   ```

3. **Security**
   - Add authentication (JWT)
   - Enable HTTPS
   - Implement rate limiting
   - Add input sanitization

4. **Optimization**
   - Enable MongoDB indexes
   - Use connection pooling
   - Implement caching (Redis)
   - Set up logging (Winston/Morgan)

## 🆘 Getting Help

1. **Check Logs**
   - Backend terminal: API requests and errors
   - Python terminal: Image processing details
   - Browser console: Frontend errors

2. **Common Log Locations**
   - Backend errors: Terminal where `npm run dev` is running
   - Python errors: Terminal where `python app.py` is running
   - Frontend errors: Browser DevTools → Console

3. **Verify Services**
   ```powershell
   # Check all services are running
   netstat -ano | findstr "5000"  # Backend
   netstat -ano | findstr "5001"  # Python
   netstat -ano | findstr "5173"  # Frontend
   netstat -ano | findstr "27017" # MongoDB
   ```

---

**Ready to start?** Open 3 terminals and follow steps 2-5 above! 🚀
