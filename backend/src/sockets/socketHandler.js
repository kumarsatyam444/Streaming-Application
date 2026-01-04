/**
 * Socket.io Handler
 * Handles real-time communication for video processing
 */

import { SOCKET_EVENTS } from '../config/constants.js';
import { processVideo } from '../services/videoService.js';
import { verifyToken } from '../utils/jwt.js';

export const setupSocketHandlers = (io) => {
  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log('Client connected:', socket.id);

    // Handle video processing start
    socket.on('video:process', async (data) => {
      try {
        const { videoId, filePath, token } = data;

        // Verify token
        const decoded = verifyToken(token);

        console.log(`Processing video: ${videoId} for tenant: ${decoded.tenantId}`);

        // Start processing asynchronously
        processVideo(videoId, filePath, decoded.tenantId, io, socket.id)
          .catch(error => {
            console.error('Error processing video:', error);
          });
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: 'Failed to start video processing',
          error: error.message,
        });
      }
    });

    // Handle disconnection
    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log('Client disconnected:', socket.id);
    });

    // Handle errors
    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error('Socket error:', error);
    });
  });
};
