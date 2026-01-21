import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { launchRouter } from './routes/launch.routes';
import { commitRouter } from './routes/commit.routes';
import { revealRouter } from './routes/reveal.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3014;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3004',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    service: 'shadowlaunch-api',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API info endpoint
app.get('/api', (_req, res) => {
  res.json({
    success: true,
    service: 'ShadowLaunch API',
    description: 'Private Token Launchpad on Aleo',
    tagline: 'Fair launches. No snipers. No bots.',
    version: '1.0.0',
    endpoints: {
      launches: {
        list: 'GET /api/launches',
        create: 'POST /api/launches',
        get: 'GET /api/launches/:id',
      },
      commits: {
        prepare: 'POST /api/commits/prepare',
        confirm: 'POST /api/commits/confirm',
      },
      reveals: {
        prepare: 'POST /api/reveals/prepare',
      },
    },
  });
});

// API Routes
app.use('/api/launches', launchRouter);
app.use('/api/commits', commitRouter);
app.use('/api/reveals', revealRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗██╗  ██╗ █████╗ ██████╗  ██████╗ ██╗    ██╗    ║
║   ██╔════╝██║  ██║██╔══██╗██╔══██╗██╔═══██╗██║    ██║    ║
║   ███████╗███████║███████║██║  ██║██║   ██║██║ █╗ ██║    ║
║   ╚════██║██╔══██║██╔══██║██║  ██║██║   ██║██║███╗██║    ║
║   ███████║██║  ██║██║  ██║██████╔╝╚██████╔╝╚███╔███╔╝    ║
║   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝  ╚═════╝  ╚══╝╚══╝     ║
║                     LAUNCH                                 ║
║                                                           ║
║   Private Token Launchpad on Aleo                         ║
║   Fair launches. No snipers. No bots.                     ║
║                                                           ║
║   Server running on port ${PORT}                            ║
║   Health: http://localhost:${PORT}/health                   ║
║   API: http://localhost:${PORT}/api                         ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
