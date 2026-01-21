import { PrismaClient } from '@prisma/client';
import env from './env';
import logger from '../utils/logger';

const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
});

// Test database connection
export async function connectDatabase() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw error;
  }
}

export default prisma;
