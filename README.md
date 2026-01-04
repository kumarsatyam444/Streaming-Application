# StreamApp - Video Upload, Processing & Streaming Platform

A production-ready full-stack application for uploading videos, processing them for content sensitivity analysis, and streaming with real-time progress updates.

## 🌟 Features

- ✅ **Secure Video Upload** with file validation
- ✅ **Real-time Processing** with Socket.io progress updates
- ✅ **Sensitivity Analysis** (safe/flagged classification)
- ✅ **Multi-tenant Architecture** with tenant isolation
- ✅ **Role-Based Access Control** (Viewer, Editor, Admin)
- ✅ **HTTP Range Request Streaming** for efficient video delivery
- ✅ **JWT Authentication** with secure password hashing
- ✅ **Video Metadata Extraction** using FFmpeg
- ✅ **Responsive UI** with modern CSS
- ✅ **Production-ready** error handling and logging

## 🏗️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Handling**: Multer
- **Video Processing**: FFmpeg
- **Validation**: Custom validators
- **Error Handling**: Centralized error middleware

### Frontend
- **UI Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client
- **Styling**: CSS Modules
- **State Management**: React Context API

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- MongoDB Atlas account
- FFmpeg installed on system

## 🚀 Installation & Setup

### 1. Clone/Extract Project
```bash
cd "Streaming Application"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with MongoDB URI (already configured)
# MONGODB_URI

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Application runs on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass",
  "organizationName": "Acme Corp"
}

Response: {
  "success": true,
  "data": {
    "user": { id, name, email, role, tenantId },
    "token": "jwt_token",
    "organization": { id, name }
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass"
}

Response: {
  "success": true,
  "data": {
    "user": { id, name, email, role, tenantId },
    "token": "jwt_token",
    "organization": { id, name }
  }
}
```

#### Get Profile
```
GET /api/auth/me
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": {
    "user": { ... },
    "organization": { ... }
  }
}
```

### Video Endpoints

#### Upload Video
```
POST /api/videos/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
- video: File (mp4, mkv, webm, max 500MB)
- description: String (optional)
- tags: String (comma-separated, optional)

Response: {
  "success": true,
  "message": "Video uploaded successfully",
  "data": {
    "videoId": "...",
    "filename": "...",
    "originalName": "...",
    "status": "uploaded"
  }
}
```

#### Get Videos (with Pagination & Filters)
```
GET /api/videos?page=1&limit=10&status=completed&sensitivity=safe&search=keyword
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

#### Get Video Details
```
GET /api/videos/{videoId}
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": {
    "_id": "...",
    "filename": "...",
    "originalName": "...",
    "size": 123456,
    "duration": 3600,
    "status": "completed",
    "sensitivity": "safe",
    "metadata": { width, height, frameRate, bitrate },
    "uploadedBy": { name, email },
    "createdAt": "...",
    ...
  }
}
```

#### Stream Video (with Range Requests)
```
GET /api/videos/{videoId}/stream
Authorization: Bearer {token}
Range: bytes=0-1023 (optional)

Response: Video stream (206 Partial Content if range requested)
Headers:
- Content-Type: video/mp4
- Accept-Ranges: bytes
- Content-Range: bytes 0-1023/123456 (if range requested)
```

#### Delete Video
```
DELETE /api/videos/{videoId}
Authorization: Bearer {token}

Response: {
  "success": true,
  "message": "Video deleted successfully",
  "data": { "videoId": "..." }
}
```

#### Get Video Statistics
```
GET /api/videos/stats
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": {
    "totalVideos": 42,
    "byStatus": { uploaded: 5, processing: 2, completed: 35, failed: 0 },
    "bySensitivity": { safe: 30, flagged: 5, unknown: 7 },
    "totalSize": 1234567890
  }
}
```

### User Management Endpoints (Admin Only)

#### Get All Users
```
GET /api/users?page=1&limit=10
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

#### Update User Role
```
PATCH /api/users/{userId}/role
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "editor"  // viewer, editor, or admin
}

Response: {
  "success": true,
  "data": { ... }
}
```

#### Deactivate/Activate User
```
PATCH /api/users/{userId}/deactivate
PATCH /api/users/{userId}/activate
Authorization: Bearer {token}

Response: {
  "success": true,
  "data": { ... }
}
```

## 🔌 Socket.io Events

### Client → Server
```javascript
socket.emit('video:process', {
  videoId: 'video_id',
  filePath: '/path/to/video.mp4',
  token: 'jwt_token'
})
```

### Server → Client
```javascript
// Progress update
socket.on('video:progress', {
  videoId: 'video_id',
  progress: 50,        // 0-100
  message: 'Extracting metadata...'
})

// Processing complete
socket.on('video:completed', {
  videoId: 'video_id',
  video: { ... },
  message: 'Video processing completed'
})

// Processing failed
socket.on('video:failed', {
  videoId: 'video_id',
  error: 'Error message'
})
```

## 👥 Roles & Permissions

### Viewer
- ✅ View videos
- ✅ Stream videos
- ❌ Upload videos
- ❌ Manage videos
- ❌ Manage users

### Editor
- ✅ View videos
- ✅ Stream videos
- ✅ Upload videos
- ✅ Manage own videos
- ❌ Manage users

### Admin
- ✅ Full access to all resources
- ✅ Manage all videos
- ✅ Manage users and roles
- ✅ View organization statistics

## 🗄️ Database Schema

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (viewer/editor/admin),
  tenantId: ObjectId (ref: Organization),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Video
```javascript
{
  filename: String (unique),
  originalName: String,
  size: Number,
  duration: Number (seconds),
  filePath: String,
  mimeType: String,
  status: String (uploaded/processing/completed/failed),
  sensitivity: String (safe/flagged),
  progress: Number (0-100),
  tenantId: ObjectId (ref: Organization),
  uploadedBy: ObjectId (ref: User),
  processingStartedAt: Date,
  processingCompletedAt: Date,
  errorMessage: String,
  metadata: {
    width: Number,
    height: Number,
    frameRate: Number,
    bitrate: String
  },
  description: String,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

### Organization
```javascript
{
  name: String,
  slug: String (unique),
  owner: ObjectId (ref: User),
  description: String,
  isActive: Boolean,
  storageQuota: Number (bytes),
  storageUsed: Number (bytes),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ CORS protection
- ✅ Input validation and sanitization
- ✅ Tenant isolation (multi-tenant)
- ✅ Role-based access control
- ✅ File type and size validation
- ✅ Secure file storage with UUID naming
- ✅ HTTP-only cookies ready
- ✅ Error handling without stack traces in production

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration (DB, constants)
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Express middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.io handlers
│   ├── utils/           # Helper utilities
│   └── app.js           # Main app entry
├── uploads/             # Video storage
├── package.json
├── .env.example
└── README.md

frontend/
├── src/
│   ├── api/            # API client & endpoints
│   ├── components/     # React components
│   ├── context/        # Context providers
│   ├── pages/          # Page components
│   ├── socket/         # Socket.io setup
│   ├── styles/         # CSS modules
│   ├── utils/          # Helpers
│   └── main.jsx        # App entry
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🎯 Video Processing Flow

1. **Upload**: User selects and uploads video file
2. **Validation**: File type and size validation
3. **Storage**: File saved with UUID in tenant-specific directory
4. **Database**: Video record created with status "uploaded"
5. **Processing Triggered**: Backend starts async processing
6. **Metadata Extraction**: FFmpeg extracts video metadata (10-40% progress)
7. **Sensitivity Analysis**: Simulated content analysis (40-90% progress)
8. **Completion**: Status updated to "completed" with sensitivity classification
9. **Real-time Updates**: Client receives progress updates via Socket.io
10. **Streaming**: User can stream completed video with range request support

## 🧪 Testing the Application

### 1. Register a User
Visit `http://localhost:5173/register` and create account

### 2. Upload a Video
- Navigate to Upload page
- Drag-drop or select video file
- Watch real-time progress updates
- Processing happens automatically

### 3. View Videos
- Dashboard shows all uploaded videos
- Filter by status and sensitivity
- Search videos by name

### 4. Stream Video
- Click "View Details" on any video
- Stream completed videos with HTML5 player
- Supports pause, play, seeking with range requests

### 5. Admin Features (if admin role)
- Navigate to Users page
- Change user roles
- Activate/deactivate users

## 🐛 Troubleshooting

### MongoDB Connection Error
- Verify MongoDB URI in `.env`
- Check network access in MongoDB Atlas

### FFmpeg Not Found
- Install FFmpeg: `brew install ffmpeg` (Mac) or `choco install ffmpeg` (Windows)
- Or install via: `apt-get install ffmpeg` (Linux)

### Port Already in Use
- Backend: Change PORT in `.env`
- Frontend: Change port in `vite.config.js`

### CORS Errors
- Verify `CORS_ORIGIN` and `SOCKET_CORS_ORIGIN` in `.env`

### Socket.io Connection Failed
- Check `SOCKET_URL` in frontend `.env`
- Verify backend socket.io is initialized

## 📈 Performance Considerations

- Multer stores files on disk, not memory
- Video streaming uses HTTP range requests for efficient delivery
- Socket.io namespaces can be added for better real-time scalability
- Database queries use indexes for tenant and status lookups
- Pagination implemented for large result sets

## 🔄 Deployment

### Backend (e.g., Heroku)
```bash
heroku create your-app-name
heroku config:set MONGODB_URI="your_mongodb_uri"
git push heroku main
```

### Frontend (e.g., Vercel)
```bash
npm install -g vercel
vercel
```

## 📝 Additional Documentation

- [API Documentation](./backend/README.md)
- [Frontend Guide](./frontend/README.md)
- [Architecture Design](./ARCHITECTURE.md)

## 📄 License

MIT License

## 👨‍💻 Support

For issues or questions, please check:
1. Error messages and logs
2. API response messages
3. Browser console for frontend errors
4. Backend logs for processing issues

---

**Built with ❤️ for video streaming excellence**
