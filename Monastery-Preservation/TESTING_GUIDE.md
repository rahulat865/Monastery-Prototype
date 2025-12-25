# Testing Guide - Monastery Preservation System

## Quick Functionality Test

### Step 1: Verify All Services Are Running

Open PowerShell and run:

```powershell
# Test Backend
curl http://localhost:5000/health

# Test Python Service
curl http://localhost:5001/health

# Test Frontend - Open browser to:
http://localhost:5173
```

**Expected Results:**
- Backend: JSON response with status "OK"
- Python: JSON with "healthy" status
- Frontend: Web interface loads

---

## Step 2: Test Image Upload via API

### Upload Baseline Image

```powershell
# Using curl (if available) or use Postman
curl -X POST http://localhost:5000/api/images/upload `
  -F "image=@C:\path\to\your\image.jpg" `
  -F "imageType=baseline" `
  -F "location=TestHall" `
  -F "structureComponent=NorthWall"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "...",
    "imageType": "baseline",
    "location": "TestHall"
  }
}
```

### Upload Current Image

```powershell
curl -X POST http://localhost:5000/api/images/upload `
  -F "image=@C:\path\to\another\image.jpg" `
  -F "imageType=current" `
  -F "location=TestHall" `
  -F "structureComponent=NorthWall"
```

---

## Step 3: Test via Frontend (Easiest Method)

### 3.1 Upload Baseline Image

1. Open **http://localhost:5173** in browser
2. Click **"Upload Images"** tab
3. In **left panel** (Baseline):
   - Click "Choose File" → select an image
   - Select "baseline" from dropdown
   - Location: `Main Hall`
   - Structure Component: `North Wall`
   - Click **"Upload Image"**
4. Wait for success message

### 3.2 Upload Current Image

1. In **right panel** (Current):
   - Click "Choose File" → select similar but slightly different image
   - Select "current" from dropdown
   - Location: `Main Hall` (same as baseline)
   - Structure Component: `North Wall` (same as baseline)
   - Click **"Upload Image"**

### 3.3 Compare Images

1. Click **"Compare Images"** tab
2. Enter Location: `Main Hall`
3. Enter Structure Component: `North Wall`
4. Click **"Load Images"** → Both images should appear
5. Click **"Compare Images"**
6. Wait 10-30 seconds for processing

### 3.4 View Results

Results should show:
- **SSIM Score**: 0-100% similarity
- **Severity Level**: Color-coded badge (EXCELLENT to CRITICAL)
- **Three Images**:
  - Baseline (original reference)
  - Current (new image)
  - Difference (with red highlights showing changes)
- **Metrics**:
  - Difference percentage
  - Affected area
  - Number of regions detected
- **Recommendations**: AI-generated suggestions

---

## Step 4: Test Individual APIs

### Check if images were uploaded
```powershell
# Get all images
Invoke-WebRequest http://localhost:5000/api/images | ConvertFrom-Json

# Get images for specific location
Invoke-WebRequest http://localhost:5000/api/images/location/TestHall | ConvertFrom-Json
```

### Get all comparisons
```powershell
Invoke-WebRequest http://localhost:5000/api/comparisons | ConvertFrom-Json
```

---

## Step 5: Test with Sample Data

### Create Test Images (if you don't have any)

You can use any two similar images (same scene, slight differences):
- Before/after photos
- Screenshots with minor changes
- Photos of the same object from slightly different angles

**Quick Test:**
1. Take a screenshot of your desktop
2. Move a window slightly
3. Take another screenshot
4. Use these as baseline and current images

---

## Expected Test Results

### Successful Upload
✅ HTTP 201 response
✅ Image ID returned
✅ Image appears in GridFS (MongoDB)
✅ Metadata saved in database

### Successful Comparison
✅ HTTP 200 response
✅ SSIM score between 0 and 1
✅ Severity level assigned
✅ Difference image generated with highlights
✅ Comparison saved to database
✅ All three images visible in frontend

### Visual Verification
✅ Red highlights on difference image show detected changes
✅ Severity badge color matches score:
   - Green: EXCELLENT/GOOD
   - Yellow: MODERATE
   - Orange: POOR
   - Red: CRITICAL

---

## Common Test Scenarios

### Test 1: Identical Images
- Upload same image twice
- **Expected**: SSIM > 99%, Severity: EXCELLENT

### Test 2: Slightly Different Images
- Upload similar images with minor changes
- **Expected**: SSIM 85-95%, Severity: GOOD/MODERATE

### Test 3: Very Different Images
- Upload completely different images
- **Expected**: SSIM < 50%, Severity: CRITICAL

---

## Verify MongoDB Storage

```powershell
# Connect to MongoDB
mongo

# Switch to database
use monastery_preservation

# Check collections
show collections

# Count images
db.imagemetadata.count()

# View uploaded images
db.imagemetadata.find().pretty()

# View comparisons
db.comparisons.find().pretty()

# Check GridFS files
db.uploads.files.find().pretty()
```

---

## Troubleshooting Tests

### Backend not responding
```powershell
# Check if running
Get-Process -Name node

# Restart backend
cd C:\Users\91900\OneDrive\Desktop\preservation\backend
node server.js
```

### Python service not responding
```powershell
# Check if running
Get-Process -Name python

# Restart Python service
cd C:\Users\91900\OneDrive\Desktop\preservation\python-service
& 'C:\Program Files\Python313\python.exe' app.py
```

### Frontend not loading
```powershell
# Check if running
netstat -ano | findstr 5173

# Restart frontend
cd C:\Users\91900\OneDrive\Desktop\preservation\frontend
npm run dev
```

---

## Performance Test

Upload images and time the comparison:
- Small images (< 1MB): ~5-10 seconds
- Medium images (1-5MB): ~10-20 seconds
- Large images (5-10MB): ~20-30 seconds

---

## Download Test Reports

After comparison completes:
1. Click **"Download Text Report"** → Verify .txt file downloads
2. Click **"Download JSON Data"** → Verify .json file downloads
3. Open files → Verify all data is present

---

**Test Complete!** ✅

If all steps work, your system is fully functional.
