# Backend API Documentation

## Overview

Express.js backend for video upload, processing, and streaming with real-time Socket.io updates.

## Quick Start

```bash
npm install
npm run dev
# Server runs on http://localhost:5000
```

## API Endpoints Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login user |
| GET | `/api/auth/me` | Yes | Get user profile |
| POST | `/api/auth/logout` | Yes | Logout user |

### Videos

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/videos/upload` | Yes | Editor, Admin | Upload video |
| GET | `/api/videos` | Yes | All | Get all videos |
| GET | `/api/videos/stats` | Yes | All | Get statistics |
| GET | `/api/videos/:id` | Yes | All | Get video details |
| GET | `/api/videos/:id/stream` | Yes | All | Stream video |
| DELETE | `/api/videos/:id` | Yes | Editor, Admin | Delete video |

### Users (Admin Only)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | Yes | Admin | Get all users |
| GET | `/api/users/:id` | Yes | Admin | Get user details |
| PATCH | `/api/users/:id/role` | Yes | Admin | Update user role |
| PATCH | `/api/users/:id/deactivate` | Yes | Admin | Deactivate user |
| PATCH | `/api/users/:id/activate` | Yes | Admin | Activate user |

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "only in development"
}
```

### Common Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate entry)
- `500` - Internal Server Error

## Database Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (viewer|editor|admin),
  tenantId: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Video
```javascript
{
  _id: ObjectId,
  filename: String (unique),
  originalName: String,
  size: Number,
  duration: Number,
  filePath: String,
  mimeType: String,
  status: String (uploaded|processing|completed|failed),
  sensitivity: String (safe|flagged|null),
  progress: Number (0-100),
  tenantId: ObjectId,
  uploadedBy: ObjectId,
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
  _id: ObjectId,
  name: String,
  slug: String (unique),
  owner: ObjectId,
  description: String,
  isActive: Boolean,
  storageQuota: Number,
  storageUsed: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Socket.io Events

### Client → Server
```javascript
// Start video processing
socket.emit('video:process', {
  videoId: String,
  filePath: String,
  token: String
})
```

### Server → Client
```javascript
// Progress update (10-second intervals)
socket.on('video:progress', {
  videoId: String,
  progress: Number (0-100),
  message: String
})

// Processing complete
socket.on('video:completed', {
  videoId: String,
  video: Object,
  message: String
})

// Processing failed
socket.on('video:failed', {
  videoId: String,
  error: String
})
```

## Middleware

### authenticate
```javascript
// Verifies JWT token and attaches user to request
router.get('/protected', authenticate, handler)
```

### authorize
```javascript
// Checks user role
router.post('/admin-only', authenticate, authorize('admin'), handler)
```

### asyncHandler
```javascript
// Wraps route handlers for error catching
export const handler = asyncHandler(async (req, res) => {
  // errors automatically caught
})
```

## File Upload Configuration

- **Max Size**: 500MB
- **Allowed Types**: mp4, mkv, webm
- **Storage**: `/uploads/{tenantId}/{random-uuid}.ext`
- **Validation**: Multer + custom validators

## Processing Pipeline

1. **Upload** (0-5%): File saved to disk
2. **Validation** (5-10%): Verify file integrity
3. **Metadata Extraction** (10-40%): FFmpeg reads metadata
4. **Sensitivity Analysis** (40-90%): Content classification
5. **Completion** (90-100%): Update database

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=500000000
ALLOWED_VIDEO_TYPES=mp4,mkv,webm
UPLOAD_DIR=./uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Socket.io
SOCKET_CORS_ORIGIN=http://localhost:5173
```

## Development

### Available Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start production server
npm test         # Run tests
```

### Code Structure

- **Models**: Define database schemas
- **Controllers**: Handle HTTP requests
- **Services**: Contain business logic
- **Routes**: Define endpoints
- **Middleware**: Process requests
- **Utils**: Helper functions
- **Sockets**: Real-time handlers

## Security Features

1. **Password Hashing**: bcryptjs with 10 salt rounds
2. **JWT Authentication**: Stateless token-based auth
3. **Input Validation**: All inputs validated
4. **CORS Protection**: Cross-origin requests verified
5. **Tenant Isolation**: Data isolation per tenant
6. **Role-Based Access**: Fine-grained permissions
7. **File Validation**: Type and size checks
8. **Error Handling**: No sensitive info exposed

## Performance Tips

1. Use pagination for large result sets
2. Leverage database indexes on tenantId
3. Cache frequently accessed data
4. Compress video files before upload
5. Use CDN for video delivery (future)

## Troubleshooting

### Connection Refused
- Check MongoDB URI
- Ensure internet connection for cloud DB
- Check MongoDB Atlas IP whitelist

### FFmpeg Not Found
```bash
which ffmpeg  # Check if installed
brew install ffmpeg  # Mac
apt install ffmpeg  # Linux
choco install ffmpeg  # Windows
```

### Port Already in Use
```bash
# Change PORT in .env or kill process
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Authentication Errors
- Check token in Authorization header
- Verify JWT_SECRET matches frontend
- Check token expiration

## Testing

### Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "organizationName": "Test Org"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test Protected Route
```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## API Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description",
  "stack": "only in development mode"
}
```

## Rate Limiting (Future)

Currently no rate limiting. Recommended for production:
- 100 requests/minute per IP
- 1000 requests/minute per authenticated user

## Caching Strategy (Future)

Recommended cache:
- User sessions (Redis)
- Video metadata (Redis, 1 hour TTL)
- Organization data (Redis, 24 hour TTL)

## Monitoring (Future)

Recommended monitoring:
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Database monitoring

## Support

For issues:
1. Check error response message
2. Look at server logs
3. Verify .env configuration
4. Check database connectivity
5. Review authentication token

---

For complete setup instructions, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)
