import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import env from './config/env';
import logger from './utils/logger';

// Routes
import launchesRoutes from './routes/launches.routes';
import commitsRoutes from './routes/commits.routes';
import revealsRoutes from './routes/reveals.routes';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS configuration - allow all dev frontends
    const corsOrigins = ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3004', 'http://localhost:3006'];
    this.app.use(
      cors({
        origin: corsOrigins,
        credentials: true,
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX_REQUESTS,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api', limiter);

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: env.NODE_ENV,
        version: env.API_VERSION,
      });
    });

    // API routes
    const apiPrefix = `/api/${env.API_VERSION}`;
    this.app.use(`${apiPrefix}/launches`, launchesRoutes);
    this.app.use(`${apiPrefix}/commits`, commitsRoutes);
    this.app.use(`${apiPrefix}/reveals`, revealsRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'ShadowLaunch API',
        version: env.API_VERSION,
        description: 'Private token launchpad backend for Aleo',
        endpoints: {
          health: '/health',
          launches: `${apiPrefix}/launches`,
          commits: `${apiPrefix}/commits`,
          reveals: `${apiPrefix}/reveals`,
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
