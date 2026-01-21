import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, ApiError, ErrorCode } from '../types';
import env from '../config/env';

export interface JWTPayload {
  addressHash: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new ApiError(401, ErrorCode.UNAUTHORIZED, 'No token provided');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    req.user = { addressHash: decoded.addressHash };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ApiError(401, ErrorCode.UNAUTHORIZED, 'Invalid token'));
    } else {
      next(error);
    }
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      req.user = { addressHash: decoded.addressHash };
    }

    next();
  } catch (error) {
    // For optional auth, we just skip if token is invalid
    next();
  }
};

export const generateToken = (addressHash: string): string => {
  return jwt.sign(
    { addressHash } as JWTPayload,
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRATION }
  );
};
