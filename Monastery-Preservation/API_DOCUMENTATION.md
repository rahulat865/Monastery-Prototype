# API Documentation

## Backend API (Port 5000)

### Image Management

#### Upload Image
```http
POST /api/images/upload
Content-Type: multipart/form-data

Body (FormData):
{
  "image": File,
  "imageType": "baseline" | "current" | "difference",
  "location": string,
  "structureComponent": string,
  "captureDate": date (optional),
  "camera": string (optional),
  "notes": string (optional)
}

Response: 201
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "id": "ObjectId",
    "gridfsId": "ObjectId",
    "filename": string,
    "imageType": string,
    "location": string,
    "structureComponent": string,
    "size": number,
    "uploadDate": date
  }
}
```

#### Get All Images
```http
GET /api/images?imageType=baseline&location=MainHall&limit=50&page=1

Response: 200
{
  "success": true,
  "data": [...images],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

#### Get Image by ID (Stream)
```http
GET /api/images/:id

Response: 200
Content-Type: image/jpeg
Binary image data
```

#### Get Image Metadata
```http
GET /api/images/:id/metadata

Response: 200
{
  "success": true,
  "data": {
    "_id": "ObjectId",
    "gridfsId": "ObjectId",
    "imageType": string,
    "location": string,
    "structureComponent": string,
    "filename": string,
    "contentType": string,
    "size": number,
    "uploadDate": date,
    "metadata": {...}
  }
}
```

#### Get Images by Location
```http
GET /api/images/location/:location?structureComponent=NorthWall

Response: 200
{
  "success": true,
  "data": {
    "location": string,
    "structureComponent": string,
    "baseline": {...imageMetadata},
    "current": {...imageMetadata}
  }
}
```

#### Delete Image
```http
DELETE /api/images/:id

Response: 200
{
  "success": true,
  "message": "Image deleted successfully"
}
```

### Comparison Management

#### Perform Comparison
```http
POST /api/comparisons/compare
Content-Type: application/json

Body:
{
  "baselineId": "ObjectId",
  "currentId": "ObjectId",
  "location": string (optional),
  "structureComponent": string (optional)
}

Response: 200
{
  "success": true,
  "message": "Comparison completed successfully",
  "data": {
    "_id": "ObjectId",
    "location": string,
    "structureComponent": string,
    "baselineImage": {...},
    "currentImage": {...},
    "differenceImage": {...},
    "ssimScore": number (0-1),
    "severityLevel": "EXCELLENT" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL",
    "analysis": {
      "differencePercentage": number,
      "contourCount": number,
      "affectedArea": number,
      "recommendations": string
    },
    "processingTime": number,
    "status": "completed",
    "alertFlag": boolean,
    "comparisonDate": date
  }
}
```

#### Get All Comparisons
```http
GET /api/comparisons?location=MainHall&severityLevel=CRITICAL&limit=50&page=1

Response: 200
{
  "success": true,
  "data": [...comparisons],
  "pagination": {...}
}
```

#### Get Comparison by ID
```http
GET /api/comparisons/:id

Response: 200
{
  "success": true,
  "data": {...comparison}
}
```

#### Get Comparisons by Location
```http
GET /api/comparisons/location/:location

Response: 200
{
  "success": true,
  "data": [...comparisons]
}
```

#### Delete Comparison
```http
DELETE /api/comparisons/:id

Response: 200
{
  "success": true,
  "message": "Comparison deleted successfully"
}
```

### Health Check
```http
GET /health

Response: 200
{
  "status": "OK",
  "timestamp": date,
  "services": {
    "api": "healthy",
    "database": "connected",
    "pythonService": "healthy" | "unavailable"
  }
}
```

---

## Python Service API (Port 5001)

### Image Comparison

#### Compare Images
```http
POST /api/compare
Content-Type: multipart/form-data

Body (FormData):
{
  "baseline_image": File,
  "current_image": File,
  "location": string (optional),
  "structure_component": string (optional)
}

Response: 200
{
  "ssim_score": number (0-1),
  "severity": "EXCELLENT" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL",
  "difference_percentage": number,
  "contour_count": number,
  "affected_area": number,
  "difference_image": string (base64),
  "image_dimensions": {
    "width": number,
    "height": number
  },
  "metadata": {
    "location": string,
    "structure_component": string
  }
}

Error Response: 400/500
{
  "error": string,
  "message": string
}
```

#### Health Check
```http
GET /health

Response: 200
{
  "status": "healthy",
  "service": "Python Image Comparison Service",
  "version": "1.0.0"
}
```

#### Test Endpoint
```http
GET /api/test

Response: 200
{
  "message": "Python Image Comparison Service is running",
  "opencv_version": string,
  "numpy_version": string
}
```

---

## Error Codes

### Backend Errors

| Code | Type | Description |
|------|------|-------------|
| 400 | Bad Request | Invalid input or missing required fields |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry |
| 413 | Payload Too Large | File size exceeds limit |
| 500 | Internal Server Error | Server-side error |

### Python Service Errors

| Code | Type | Description |
|------|------|-------------|
| 400 | Validation Error | Invalid image or missing files |
| 413 | File Too Large | Image exceeds size limit |
| 500 | Processing Error | Image comparison failed |

---

## Data Models

### ImageMetadata
```javascript
{
  _id: ObjectId,
  gridfsId: ObjectId,
  imageType: "baseline" | "current" | "difference",
  location: string,
  structureComponent: string,
  filename: string,
  contentType: string,
  size: number,
  uploadDate: Date,
  comparisonId: ObjectId (optional),
  metadata: {
    captureDate: Date,
    camera: string,
    resolution: string,
    notes: string
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Comparison
```javascript
{
  _id: ObjectId,
  location: string,
  structureComponent: string,
  baselineImage: {
    gridfsId: ObjectId,
    metadataId: ObjectId,
    filename: string,
    uploadDate: Date
  },
  currentImage: {
    gridfsId: ObjectId,
    metadataId: ObjectId,
    filename: string,
    uploadDate: Date
  },
  differenceImage: {
    gridfsId: ObjectId,
    metadataId: ObjectId,
    filename: string,
    uploadDate: Date
  },
  ssimScore: number (0-1),
  severityLevel: "EXCELLENT" | "GOOD" | "MODERATE" | "POOR" | "CRITICAL",
  analysis: {
    differencePercentage: number,
    contourCount: number,
    affectedArea: number,
    recommendations: string
  },
  comparisonDate: Date,
  processingTime: number,
  status: "pending" | "processing" | "completed" | "failed",
  error: {
    message: string,
    stack: string
  },
  notes: string,
  alertFlag: boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Consider implementing rate limiting middleware
- Use Redis for distributed rate limiting
- Set appropriate limits per endpoint

## Authentication

Currently no authentication is required. For production:
- Implement JWT authentication
- Add role-based access control (RBAC)
- Secure sensitive endpoints
- Use HTTPS

## CORS Configuration

Backend allows requests from:
- `http://localhost:5173` (Frontend dev server)
- Configure additional origins in production

---

## Example Usage with cURL

### Upload Image
```bash
curl -X POST http://localhost:5000/api/images/upload \
  -F "image=@path/to/image.jpg" \
  -F "imageType=baseline" \
  -F "location=Main Hall" \
  -F "structureComponent=North Wall"
```

### Perform Comparison
```bash
curl -X POST http://localhost:5000/api/comparisons/compare \
  -H "Content-Type: application/json" \
  -d '{
    "baselineId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "currentId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "location": "Main Hall",
    "structureComponent": "North Wall"
  }'
```
