const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

// CORS configuration for your dating app
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://www.buscandoamoreterno.com',
      'https://buscandoamoreterno.com',
      'https://*.vercel.app'
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.static('public'));

// Health check endpoint for Vercel monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

// PeerServer configuration with bulletproof settings
const peerServer = ExpressPeerServer(server, {
  debug: process.env.NODE_ENV === 'development' ? 3 : 1,
  path: '/peerjs',
  allow_discovery: true,
  
  // Heartbeat & timeout settings for reliability
  pingInterval: 2000,      // Send ping every 2s (detect dead connections)
  pongTimeout: 10000,      // Wait 10s for pong before considering dead
  
  // WebSocket fallback for environments that don't support WebSockets
  proxied: true,           // Trust X-Forwarded-* headers from Vercel
  
  // Peer cleanup & limits
  concurrent_limit: 5000,  // Max concurrent connections (free tier safe)
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ]
});

// Mount PeerServer at /peerjs
app.use('/peerjs', peerServer);

// Error handling for PeerServer events
peerServer.on('connection', (client) => {
  console.log(`[PeerServer] Peer connected: ${client.getId()}`);
});

peerServer.on('disconnect', (client) => {
  console.log(`[PeerServer] Peer disconnected: ${client.getId()}`);
});

// Graceful error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('[PeerServer] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[PeerServer] Uncaught Exception:', err);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[PeerServer] Running on port ${PORT}`);
  console.log(`[PeerServer] Endpoint: ${process.env.NODE_ENV === 'development' ? `http://localhost:${PORT}` : 'https://peer-server-buscando.vercel.app'}/peerjs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[PeerServer] SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('[PeerServer] Server closed');
    process.exit(0);
  });
});
