import express, { Request, Response } from 'express';
import { prisma } from '../app';
import { authenticate, isAdmin } from '../middleware/auth';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = express.Router();

const updateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
});

router.get('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            apiKeys: true,
          },
        },
      },
    });
    
    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        apiKeys: {
          select: {
            id: true,
            name: true,
            isActive: true,
            rateLimit: true,
            createdAt: true,
            lastUsed: true,
          },
        },
      },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN' && req.user?.id !== req.params.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const validatedData = updateUserSchema.parse(req.body);
    
    if (req.user?.role !== 'ADMIN' && validatedData.role) {
      delete validatedData.role;
    }
    
    if (validatedData.password) {
      const salt = await bcrypt.genSalt(10);
      validatedData.password = await bcrypt.hash(validatedData.password, salt);
    }
    
    const user = await prisma.user.update({
      where: {
        id: req.params.id,
      },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    return res.status(200).json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.params.id,
      },
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
