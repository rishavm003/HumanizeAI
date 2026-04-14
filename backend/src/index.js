import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import rewriteRoutes from './routes/rewrite.js';
import creditRoutes from './routes/credits.js';
import webhookRoutes from './routes/webhooks.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startCreditResetJob } from './jobs/creditReset.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || ''; 

// Middleware
app.use(helmet());
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true,
}));
// Specific raw body handling for Stripe webhooks
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());
app.use(cookieParser());

// Routes
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/profile', profileRoutes);
apiRouter.use('/rewrite', rewriteRoutes);
apiRouter.use('/credits', creditRoutes);
apiRouter.use('/admin', adminRoutes);

// Mount at both root and /api to be robust in Vercel
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Export for Vercel
export default app;

// Start server only if not running on Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Frontend URL: ${FRONTEND_URL}`);

    // Start background jobs
    startCreditResetJob();
  });
}
