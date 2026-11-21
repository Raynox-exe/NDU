import express from 'express';
import cors from 'cors';
import { authMiddleware } from '../server/middleware/auth.js';
import authRouter from '../server/routes/auth.js';
import submissionsRouter from '../server/routes/submissions.js';
import adminRouter from '../server/routes/admin.js';
import publicRouter from '../server/routes/public.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(authMiddleware);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'NDU Library Vercel API', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/public', publicRouter);

export default app;
