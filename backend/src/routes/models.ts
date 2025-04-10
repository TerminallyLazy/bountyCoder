import express, { Request, Response } from 'express';
import { prisma } from '../app';
import { authenticate, isAdmin } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const createModelSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const updateModelSchema = z.object({
  name: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const models = await prisma.lLMModel.findMany();
    
    return res.status(200).json(models);
  } catch (error) {
    console.error('Get models error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const model = await prisma.lLMModel.findUnique({
      where: {
        id: req.params.id,
      },
    });
    
    if (!model) {
      return res.status(404).json({ message: 'Model not found' });
    }
    
    return res.status(200).json(model);
  } catch (error) {
    console.error('Get model error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = createModelSchema.parse(req.body);
    
    const model = await prisma.lLMModel.create({
      data: validatedData,
    });
    
    return res.status(201).json(model);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Create model error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const validatedData = updateModelSchema.parse(req.body);
    
    const model = await prisma.lLMModel.update({
      where: {
        id: req.params.id,
      },
      data: validatedData,
    });
    
    return res.status(200).json(model);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('Update model error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    await prisma.lLMModel.delete({
      where: {
        id: req.params.id,
      },
    });
    
    return res.status(204).send();
  } catch (error) {
    console.error('Delete model error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
