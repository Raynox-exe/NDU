import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cors from 'cors';

import { authMiddleware } from './server/middleware/auth.js';
import authRouter from './server/routes/auth.js';
import submissionsRouter from './server/routes/submissions.js';
import adminRouter from './server/routes/admin.js';
import publicRouter from './server/routes/public.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Enable CORS for development (allowing Vite dev server)
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Attach user auth context to all requests
app.use(authMiddleware);

// Serve uploaded manuscripts, published papers, and resources statically
const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint for Railway, Vercel & monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'NDU Library API', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);

// Serve static assets from dist (production build)
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(
    express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.includes(path.join('dist', 'assets'))) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      },
    })
  );

  // SPA fallback: route all unmatched requests to index.html
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ success: false, message: 'API route not found' });
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>NDU Library Backend</title></head>
        <body style="font-family:sans-serif; padding:40px; text-align:center;">
          <h1 style="color:#14452F;">Niger Delta University Library Server Active</h1>
          <p>API endpoints are live. For the frontend web application, run <code>npm run build</code> or <code>npm run dev</code>.</p>
        </body>
      </html>
    `);
  });
}

// Start server with automatic port retry if running concurrently with dev server
function startServer(portToTry) {
  const server = app.listen(portToTry, HOST, () => {
    console.log(`[NDU Library] Server running on http://${HOST}:${portToTry}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && portToTry === 3000) {
      console.log(`[NDU Library] Port 3000 in use (e.g. by Vite). Retrying on port 5000...`);
      startServer(5000);
    } else {
      console.error('[NDU Library Server Error]', err);
    }
  });
}

startServer(Number(PORT));
