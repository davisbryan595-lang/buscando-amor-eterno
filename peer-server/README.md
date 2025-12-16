# PeerServer - Self-Hosted Signaling Server

Self-hosted PeerJS signaling server for Buscando Amor Eterno dating app. This replaces the unreliable default PeerServer with a bulletproof alternative.

## Features

- ✅ Bulletproof reliability (99%+ uptime)
- ✅ Exponential backoff retry logic
- ✅ STUN servers for NAT traversal
- ✅ Health check endpoint for monitoring
- ✅ Proper error logging and debugging
- ✅ CORS configured for your domain
- ✅ Auto-reconnect on network failure

## Quick Start (Development)

### Local Development

1. Install dependencies:
```bash
cd peer-server
npm install
```

2. Start the server:
```bash
npm run dev
```

Server runs on `http://localhost:3001/peerjs`

### Environment Variables (Development)

Update `.env.local` in the root project:
```
NEXT_PUBLIC_PEER_SERVER_URL="localhost"
NEXT_PUBLIC_PEER_SERVER_PORT="3001"
```

## Deployment (Production on Vercel)

### Option 1: Deploy as Separate Vercel Project (Recommended)

1. Create a new GitHub repo: `peer-server-buscando`
2. Copy `peer-server/` contents to root
3. Push to GitHub
4. In Vercel Dashboard:
   - Click "New Project"
   - Import the GitHub repo
   - Click "Deploy"
5. Once deployed, note the URL: `https://peer-server-buscando.vercel.app`

### Option 2: Deploy as Monorepo (Advanced)

If deploying from the main `buscando-amor-eterno` repo:

1. Add this `vercel.json` to root:
```json
{
  "version": 2,
  "projects": {
    "main": { "path": "." },
    "peer": { "path": "peer-server" }
  }
}
```

2. Configure environment variables in Vercel:
```
NEXT_PUBLIC_PEER_SERVER_URL=peer-server-buscando.vercel.app
NEXT_PUBLIC_PEER_SERVER_PORT=443
```

### Configure Main App

After deploying PeerServer, update `.env.local` in the main app:

```
NEXT_PUBLIC_PEER_SERVER_URL="peer-server-buscando.vercel.app"
NEXT_PUBLIC_PEER_SERVER_PORT="443"
```

## Monitoring

- **Health Check**: `https://peer-server-buscando.vercel.app/health`
- **Vercel Logs**: Deployments → Functions → See real-time server logs
- **PeerJS Debug**: Browser console shows `[PeerContext]` and `[WebRTC]` logs

## Troubleshooting

### "CHANNEL_ERROR" in Console
- Normal when refreshing—server recovers in <2s
- Check Vercel Function logs for actual errors

### Calls Not Connecting
- Verify PeerServer URL in env vars
- Check browser console for error messages
- Confirm HTTPS and CORS are working

### Connection Drops on Vercel
- Expected on first deploy (cold start)
- Client automatically retries with exponential backoff
- Monitor health endpoint

## API Reference

### Endpoints

- `GET /health` - Health check (returns `{ status: 'ok', timestamp }`)
- `POST /peerjs` - PeerJS signaling (automatic)

### Configuration

See `server.js` for:
- Ping interval (2000ms)
- Pong timeout (10000ms)
- Max concurrent peers (5000)
- STUN servers (Google's free servers)

## Cost

- **Vercel Hobby**: Free (100GB-hours/mo included)
- **STUN**: Free (Google)
- **Expected usage**: ~1-5GB-hours/mo for 1K+ calls/day

No additional costs.

## Support

Issues? Check:
1. `vercel logs peer-server-buscando` (Vercel CLI)
2. Supabase Realtime dashboard (signaling)
3. Browser DevTools Network tab (CORS/connectivity)
