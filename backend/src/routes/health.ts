import { Router } from 'express';
import mongoose from 'mongoose';

const router = Router();

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    database: {
      status: 'ok' | 'error';
      responseTime: number;
    };
    api: {
      status: 'ok';
      uptime: number;
    };
  };
  environment: string;
  version: string;
}

/**
 * @route GET /api/health
 * @desc Health check endpoint for monitoring
 * @access Public
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  let dbStatus: 'ok' | 'error' = 'error';
  let dbResponseTime = 0;

  try {
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.admin().ping();
      dbStatus = 'ok';
    }
  } catch (error) {
    console.error('Database health check failed:', error);
  } finally {
    dbResponseTime = Date.now() - startTime;
  }

  const healthStatus: HealthStatus = {
    status: dbStatus === 'ok' ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    services: {
      database: {
        status: dbStatus,
        responseTime: dbResponseTime
      },
      api: {
        status: 'ok',
        uptime: process.uptime()
      }
    },
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  };

  // Set appropriate status code
  const statusCode = healthStatus.status === 'ok' ? 200 : 503;
  
  // Add cache control headers
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  return res.status(statusCode).json(healthStatus);
});

export default router; 