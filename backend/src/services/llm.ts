import axios from 'axios';
import { prisma } from '../app';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const rateLimiterOptions = {
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 100, // Default rate limit (tokens per minute)
  duration: 60, // 1 minute
};

const rateLimiter = new RateLimiterRedis(rateLimiterOptions);

export interface LLMRequestParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  stop?: string[];
}

export interface LLMResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Get custom rate limit for a specific API key
 * @param apiKeyId The API key ID
 * @returns The custom rate limit or default if not set
 */
export async function getCustomRateLimit(apiKeyId: string): Promise<number> {
  try {
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });
    
    return apiKey?.rateLimit || 100;
  } catch (error) {
    console.error('Error getting custom rate limit:', error);
    return 100; // Default rate limit
  }
}

/**
 * Check if a request is within rate limits
 * @param apiKeyId The API key ID
 * @returns True if within limits, false otherwise
 */
export async function checkRateLimit(apiKeyId: string): Promise<boolean> {
  try {
    const customLimit = await getCustomRateLimit(apiKeyId);
    
    const customRateLimiter = new RateLimiterRedis({
      ...rateLimiterOptions,
      points: customLimit,
      keyPrefix: `ratelimit:${apiKeyId}`,
    });
    
    await customRateLimiter.consume(apiKeyId);
    return true;
  } catch (error: any) {
    if (error.name === 'RateLimiterRes') {
      return false;
    }
    
    console.error('Rate limit check error:', error);
    return true;
  }
}

/**
 * Generate text using the Qwen 32B model
 * @param params Request parameters
 * @param apiKeyId The API key ID for tracking usage
 * @returns The LLM response
 */
export async function generateText(params: LLMRequestParams, apiKeyId: string): Promise<LLMResponse> {
  try {
    const withinLimits = await checkRateLimit(apiKeyId);
    if (!withinLimits) {
      throw new Error('Rate limit exceeded');
    }
    
    const model = await prisma.lLMModel.findFirst({
      where: { 
        isActive: true,
        name: 'qwen-32b-coder'
      },
    });
    
    if (!model) {
      throw new Error('No active model found');
    }
    
    
    const promptTokens = params.prompt.length / 4; // Rough estimate
    const completionTokens = (params.maxTokens || 1024) / 2; // Simulate partial usage
    
    const processingTimeMs = (completionTokens / 30) * 1000;
    await new Promise(resolve => setTimeout(resolve, processingTimeMs));
    
    const response: LLMResponse = {
      id: `gen_${Date.now()}`,
      object: 'text_completion',
      created: Math.floor(Date.now() / 1000),
      model: model.name,
      choices: [
        {
          text: `// Here's a function to ${params.prompt}\n\nfunction example() {\n  console.log("This is a mock response");\n  return true;\n}`,
          index: 0,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: Math.ceil(promptTokens),
        completion_tokens: Math.ceil(completionTokens),
        total_tokens: Math.ceil(promptTokens + completionTokens),
      },
    };
    
    await prisma.usage.create({
      data: {
        apiKeyId,
        userId: (await prisma.apiKey.findUnique({ where: { id: apiKeyId } }))?.userId || '',
        tokens: response.usage.total_tokens,
        endpoint: 'generate',
      },
    });
    
    return response;
  } catch (error) {
    console.error('LLM service error:', error);
    throw error;
  }
}

/**
 * In production, this would be replaced with actual calls to the LLM service
 * This is a placeholder for the actual implementation
 */
export async function callLLMService(params: LLMRequestParams): Promise<any> {
  /*
  const response = await axios.post(process.env.LLM_SERVICE_URL, {
    prompt: params.prompt,
    max_tokens: params.maxTokens,
    temperature: params.temperature,
    top_p: params.topP,
    stop: params.stop,
  });
  
  return response.data;
  */
  
  return {
    id: `gen_${Date.now()}`,
    object: 'text_completion',
    created: Math.floor(Date.now() / 1000),
    model: 'qwen-32b-coder',
    choices: [
      {
        text: `// Mock response for: ${params.prompt}`,
        index: 0,
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: params.prompt.length / 4,
      completion_tokens: 100,
      total_tokens: (params.prompt.length / 4) + 100,
    },
  };
}
