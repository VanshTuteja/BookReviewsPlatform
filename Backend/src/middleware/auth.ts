import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthenticatedRequest } from '../types';
import logger from '../utils/logger';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const auth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      logger.warn('Access denied - No token provided', { ip: req.ip, path: req.path });
      res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      logger.warn('Invalid token or user not found', { userId: decoded.id, ip: req.ip });
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found.' 
      });
      return;
    }

    req.user = user;
    logger.info('User authenticated successfully', { userId: user._id, email: user.email });
    next();
  } catch (error: any) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
      return;
    }
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
      return;
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

