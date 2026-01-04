# Frontend Application Documentation

## Overview

React + Vite frontend for StreamApp video upload and streaming platform with real-time Socket.io updates.

## Quick Start

```bash
npm install
npm run dev
# Application runs on http://localhost:5173
```

## Project Structure

```
src/
├── api/              # API client configuration
│   ├── client.js     # Axios instance with interceptors
│   ├── auth.js       # Authentication endpoints
│   ├── videos.js     # Video endpoints
│   └── users.js      # User management endpoints
├── components/       # Reusable React components
│   ├── Navigation.jsx    # Top navigation bar
│   ├── ProtectedRoute.jsx # Route protection HOC
│   └── VideoCard.jsx      # Video display card
├── context/          # React Context API
│   └── AuthContext.jsx    # Authentication context
├── pages/            # Page-level components
│   ├── Home.jsx      # Landing page
│   ├── Login.jsx     # Login form
│   ├── Register.jsx  # Registration form
│   ├── Dashboard.jsx # Video list dashboard
│   ├── Upload.jsx    # Video upload page
│   ├── VideoPlayer.jsx # Video player page
│   └── Users.jsx     # User management (admin)
├── socket/           # Socket.io configuration
│   └── socketClient.js
├── styles/           # CSS modules
│   ├── Navigation.module.css
│   ├── AuthPages.module.css
│   ├── Dashboard.module.css
│   ├── Upload.module.css
│   ├── VideoPlayer.module.css
│   ├── VideoCard.module.css
│   ├── Users.module.css
│   └── Home.module.css
├── utils/            # Helper utilities
│   └── helpers.js    # formatFileSize, formatDuration, etc.
└── main.jsx          # React entry point
```

## Pages Overview

### Home Page
- Landing page with feature showcase
- Login/Register links
- Quick navigation

### Login Page
- Email and password form
- Error message display
- Link to register

### Register Page
- User registration form
- Organization name input
- Password confirmation
- Error handling

### Dashboard Page
- List of all videos
- Search functionality
- Filter by status and sensitivity
- Real-time progress updates
- Video statistics
- Pagination support

### Upload Page
- Drag-and-drop file upload
- File type validation
- Video metadata input (description, tags)
- Progress bar
- Upload status messages

### Video Player Page
- HTML5 video player with controls
- Video metadata display
- Sensitivity classification badge
- Processing status
- Streaming with range request support

### Users Page (Admin Only)
- User list with pagination
- Role management
- Activate/deactivate users
- Edit user permissions

## Components

### Navigation
Global navigation bar with:
- Logo and branding
- Links to main pages
- User menu with logout
- Role-based navigation

### ProtectedRoute
HOC that:
- Checks if user is authenticated
- Redirects to login if not
- Optionally checks user role
- Shows loading state during auth check

### VideoCard
Reusable card component showing:
- Video title and metadata
- Status and sensitivity badges
- Progress bar (when processing)
- Delete button (for editors/admins)
- View details link

## Context API

### AuthContext
Provides:
- `user` - Current user object
- `token` - JWT token
- `loading` - Auth loading state
- `error` - Auth error message
- `isAuthenticated` - Boolean check
- `register()` - Register user
- `login()` - Login user
- `logout()` - Logout user

Usage:
```javascript
const { user, login, logout } = useAuth()
```

## API Client

### Configuration
Axios instance with:
- Base URL from env variable
- Automatic token injection in headers
- Response interceptor for 401 handling
- Error handling

### API Methods

**Auth API**
```javascript
authAPI.register(data)
authAPI.login(email, password)
authAPI.getProfile()
authAPI.logout()
```

**Video API**
```javascript
videoAPI.upload(formData, onUploadProgress)
videoAPI.getVideos(page, limit, filters)
videoAPI.getVideo(id)
videoAPI.streamVideo(id) // Returns URL
videoAPI.deleteVideo(id)
videoAPI.getStats()
```

**User API**
```javascript
userAPI.getUsers(page, limit)
userAPI.getUser(id)
userAPI.updateRole(id, role)
userAPI.deactivateUser(id)
userAPI.activateUser(id)
```

## Socket.io Integration

### Connection
```javascript
import { initSocket, getSocket } from './socket/socketClient.js'

// Initialize (auto-connects on app load)
const socket = initSocket()

// Get existing socket
const socket = getSocket()
```

### Events
```javascript
// Listen for progress updates
socket.on('video:progress', (data) => {
  console.log(`Progress: ${data.progress}%`)
})

// Listen for completion
socket.on('video:completed', (data) => {
  console.log('Video processing done')
})

// Listen for errors
socket.on('video:failed', (data) => {
  console.log('Error:', data.error)
})
```

## Styling

### CSS Modules
Each component has its own CSS module:
- No global style conflicts
- Scoped to component
- Easy maintenance
- Responsive design

### Responsive Breakpoints
- Desktop: Full layout
- Tablet (768px): Adjusted spacing
- Mobile (480px): Stacked layout

### Design System
- Primary: #667eea (purple)
- Secondary: #764ba2 (darker purple)
- Success: #10b981 (green)
- Error: #ef4444 (red)
- Neutral: #718096 (gray)

## Hooks & State Management

### useAuth Hook
```javascript
const { user, token, isAuthenticated, login, logout } = useAuth()
```

### useState Examples
```javascript
const [videos, setVideos] = useState([])
const [loading, setLoading] = useState(true)
const [filters, setFilters] = useState({})
```

### useEffect Examples
```javascript
// Fetch videos on component mount
useEffect(() => {
  fetchVideos()
}, [])

// Refetch when filters change
useEffect(() => {
  fetchVideos()
}, [filters, page])

// Socket listener setup
useEffect(() => {
  const socket = initSocket()
  socket.on('video:progress', handleProgress)
  return () => socket.off('video:progress')
}, [])
```

## Environment Variables

### .env Configuration
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### For Production
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

## Features

### Authentication
- Register new users
- Login with email/password
- JWT token storage in localStorage
- Auto token injection in requests
- Auto-logout on 401

### Video Management
- Upload videos with drag-drop
- List videos with pagination
- Search videos
- Filter by status and sensitivity
- Delete videos
- View detailed metadata

### Real-Time Updates
- Socket.io connection on app load
- Progress updates during processing
- Status change notifications
- Error handling

### Video Streaming
- HTML5 player with controls
- Pause, play, seek support
- Range request streaming
- Full video metadata display
- Sensitivity classification

### Admin Features
- User management page
- Role assignment
- User activation/deactivation
- User statistics

## Development

### NPM Scripts
```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
```

### Adding New Page
1. Create component in `src/pages/`
2. Add route in `main.jsx`
3. Wrap with `ProtectedRoute` if needed
4. Add to navigation if needed

### Adding New API Endpoint
1. Create method in `src/api/{resource}.js`
2. Use `client` for HTTP calls
3. Import and use in components

### Adding Socket Event
1. Set up listener in component useEffect
2. Clean up in return function
3. Handle event data in callback

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Performance Tips
1. Use lazy loading for routes (future)
2. Memoize expensive components
3. Pagination for large lists
4. Debounce search input
5. Cancel in-flight requests on unmount

## Testing

### Manual Testing Checklist
- [ ] Register new user
- [ ] Login with credentials
- [ ] Upload video and watch progress
- [ ] Search and filter videos
- [ ] Stream video with seeking
- [ ] Delete video
- [ ] Logout
- [ ] Test admin features
- [ ] Test mobile responsiveness
- [ ] Test socket connection

## Troubleshooting

### Blank Page
- Check browser console for errors
- Verify backend is running
- Check .env variables
- Try hard refresh (Ctrl+Shift+R)

### API 404 Errors
- Verify backend URL in .env
- Check backend is running on correct port
- Verify route path spelling

### Socket Connection Failed
- Check browser Network tab for WebSocket
- Verify backend Socket.io is initialized
- Check SOCKET_URL in .env

### CORS Errors
- Verify CORS_ORIGIN in backend .env
- Check browser console for specific error
- Try incognito mode to rule out cache

### Login Loop
- Clear localStorage
- Check token in console
- Verify backend auth endpoint

## Build & Deployment

### Build for Production
```bash
npm run build
# Output: dist/ folder
```

### Deploy to Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
```

### Deploy to Netlify
```bash
npm run build
# Drag dist/ folder to Netlify
```

### Environment for Production
Set in hosting platform:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_SOCKET_URL=https://api.yourdomain.com
```

## Future Enhancements

- [ ] Video comments
- [ ] User following
- [ ] Playlists
- [ ] Video editing
- [ ] Analytics dashboard
- [ ] Social sharing
- [ ] Dark mode
- [ ] Offline support (PWA)
- [ ] Multi-language support
- [ ] Accessibility improvements

## Browser DevTools

### Redux DevTools (when added)
- Inspect state changes
- Time travel debugging
- Action replay

### Network Tab
- Monitor API calls
- Check response times
- Verify WebSocket connection

### Console Tab
- Check for errors
- Debug with console.log
- Test API calls with curl

## Code Style

### Component Structure
```javascript
import { useState, useEffect } from 'react'
import { Component } from './path'
import styles from './Component.module.css'

export const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initial)

  useEffect(() => {
    // Side effects
  }, [dependencies])

  return <div>JSX</div>
}
```

### Naming Conventions
- Components: PascalCase (HomePage)
- Variables: camelCase (userName)
- Constants: UPPER_SNAKE_CASE (API_BASE_URL)
- CSS Classes: camelCase (containerWrapper)

## Support

For issues:
1. Check browser console for errors
2. Verify backend is running
3. Check network requests (DevTools)
4. Review error messages
5. Check .env configuration
6. Inspect browser Application > localStorage

---

For complete setup instructions, see [SETUP_GUIDE.md](../SETUP_GUIDE.md)
For API details, see [backend/README.md](../backend/README.md)
