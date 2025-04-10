import express, { Request, Response } from 'express';
import { prisma } from '../app';
import { authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();

const llmRequestSchema = z.object({
  prompt: z.string().min(1),
  maxTokens: z.number().int().min(1).max(4096).default(1024),
  temperature: z.number().min(0).max(1).default(0.7),
  topP: z.number().min(0).max(1).default(1),
  stop: z.array(z.string()).optional(),
});

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const validatedData = llmRequestSchema.parse(req.body);
    
    const apiKeyId = req.headers['x-api-key-id'] as string;
    
    if (!apiKeyId) {
      return res.status(400).json({ message: 'API key ID is required' });
    }
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
      include: { user: true },
    });
    
    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }
    
    if (!apiKey.isActive) {
      return res.status(403).json({ message: 'API key is inactive' });
    }
    
    const response = {
      id: `gen_${Date.now()}`,
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: 'qwen-32b-coder',
      choices: [
        {
          text: `// Here's a function to ${validatedData.prompt}\n\nfunction example() {\n  console.log("This is a mock response");\n  return true;\n}`,
          index: 0,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: validatedData.prompt.length,
        completion_tokens: 100,
        total_tokens: validatedData.prompt.length + 100,
      },
    };
    
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        lastUsed: new Date(),
      },
    });
    
    await prisma.usage.create({
      data: {
        apiKeyId,
        userId: apiKey.userId,
        tokens: response.usage.total_tokens,
        endpoint: 'generate',
      },
    });
    
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    console.error('LLM generate error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/models', authenticate, async (req: Request, res: Response) => {
  try {
    const models = await prisma.lLMModel.findMany({
      where: { isActive: true },
    });
    
    return res.status(200).json(models);
  } catch (error) {
    console.error('Get LLM models error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
