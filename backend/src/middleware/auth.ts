import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../app';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as {
      id: string;
      email: string;
      role: string;
    };
    
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  
  next();
};

export const isOwnerOrAdmin = (resourceIdField: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resourceId = req.params[resourceIdField];
      
      if (!resourceId) {
        return res.status(400).json({ message: 'Resource ID not provided' });
      }
      
      if (req.user?.role === 'ADMIN') {
        return next();
      }
      
      const resource = await prisma.apiKey.findUnique({
        where: { id: resourceId },
        select: { userId: true },
      });
      
      if (!resource) {
        return res.status(404).json({ message: 'Resource not found' });
      }
      
      if (resource.userId !== req.user?.id) {
        return res.status(403).json({ message: 'Access denied. You do not own this resource.' });
      }
      
      next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
