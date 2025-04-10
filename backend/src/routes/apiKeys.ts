import express, { Request, Response } from 'express';
import { prisma } from '../app';
import { authenticate, isOwnerOrAdmin } from '../middleware/auth';
import { z } from 'zod';
import crypto from 'crypto';

const router = express.Router();

const createApiKeySchema = z.object({
  name: z.string().min(1),
  rateLimit: z.number().int().min(1).default(60),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).optional(),
  rateLimit: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (req.user?.role === 'ADMIN') {
      const apiKeys = await prisma.apiKey.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
      
      return res.status(200).json(apiKeys);
    }
    
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: req.user?.id,
      },
    });
    
    return res.status(200).json(apiKeys);
  } catch (error) {
    console.error('Get API keys error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, isOwnerOrAdmin('id'), async (req: Request, res: Response) => {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    return res.status(200).json(apiKey);
  } catch (error) {
    console.error('Get API key error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const validatedData = createApiKeySchema.parse(req.body);
    
    const key = `sk_${crypto.randomBytes(24).toString('hex')}`;
    
    const apiKey = await prisma.apiKey.create({
      data: {
        key,
        name: validatedData.name,
        rateLimit: validatedData.rateLimit,
        userId: req.user?.id as string,
      },
    });
    
    return res.status(201).json(apiKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create API key error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, isOwnerOrAdmin('id'), async (req: Request, res: Response) => {
  try {
    const validatedData = updateApiKeySchema.parse(req.body);
    
    const apiKey = await prisma.apiKey.update({
      where: {
        id: req.params.id,
      },
      data: validatedData,
    });
    
    return res.status(200).json(apiKey);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update API key error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, isOwnerOrAdmin('id'), async (req: Request, res: Response) => {
  try {
    await prisma.apiKey.delete({
      where: {
        id: req.params.id,
      },
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Delete API key error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
