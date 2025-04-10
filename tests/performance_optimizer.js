/**
 * Performance Optimizer for Qwen 32B API
 * 
 * This script analyzes and optimizes the performance of the Qwen 32B API service
 * to ensure it meets the minimum requirement of 30 tokens/second and can handle
 * the expected load of up to 10,000 users.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const config = {
  llmServiceDir: path.resolve(__dirname, '../llm-service'),
  backendDir: path.resolve(__dirname, '../backend'),
  nginxDir: path.resolve(__dirname, '../nginx'),
  dockerComposeFile: path.resolve(__dirname, '../docker-compose.yml'),
  optimizationTargets: {
    tokensPerSecond: 30,
    maxConcurrentUsers: 10000,
    maxLatencyMs: 5000
  }
};

const optimizationStrategies = {
  llmService: [
    {
      name: 'Increase batch size',
      description: 'Increase the maximum batch size to process more requests simultaneously',
      apply: () => {
        const appPyPath = path.join(config.llmServiceDir, 'app.py');
        let content = fs.readFileSync(appPyPath, 'utf8');
        
        content = content.replace(
          /MAX_BATCH_SIZE\s*=\s*(\d+)/,
          (match, size) => {
            const currentSize = parseInt(size);
            const newSize = Math.max(currentSize, 32);
            return `MAX_BATCH_SIZE = ${newSize}`;
          }
        );
        
        fs.writeFileSync(appPyPath, content);
        console.log(`✅ Increased MAX_BATCH_SIZE in app.py`);
        
        return true;
      }
    },
    {
      name: 'Enable KV cache',
      description: 'Enable KV cache to improve inference speed',
      apply: () => {
        const appPyPath = path.join(config.llmServiceDir, 'app.py');
        let content = fs.readFileSync(appPyPath, 'utf8');
        
        if (!content.includes('use_kv_cache=True')) {
          content = content.replace(
            /LLMEngine\([^)]+\)/,
            (match) => {
              if (match.includes('use_kv_cache')) {
                return match.replace(/use_kv_cache=False/, 'use_kv_cache=True');
              } else {
                return match.replace(/\)$/, ', use_kv_cache=True)');
              }
            }
          );
          
          fs.writeFileSync(appPyPath, content);
          console.log(`✅ Enabled KV cache in app.py`);
          return true;
        }
        
        console.log(`ℹ️ KV cache already enabled`);
        return false;
      }
    },
    {
      name: 'Optimize tensor parallelism',
      description: 'Set optimal tensor parallelism based on available GPUs',
      apply: () => {
        const appPyPath = path.join(config.llmServiceDir, 'app.py');
        let content = fs.readFileSync(appPyPath, 'utf8');
        
        let numGpus = 1;
        try {
          const gpuInfo = execSync('nvidia-smi --list-gpus').toString();
          numGpus = gpuInfo.split('\n').filter(line => line.trim()).length;
        } catch (error) {
          console.log(`ℹ️ Could not detect GPUs, assuming 1 GPU`);
        }
        
        content = content.replace(
          /tensor_parallel_size\s*=\s*(\d+)/,
          `tensor_parallel_size=${numGpus}`
        );
        
        fs.writeFileSync(appPyPath, content);
        console.log(`✅ Set tensor_parallel_size to ${numGpus}`);
        
        return true;
      }
    },
    {
      name: 'Enable quantization',
      description: 'Enable AWQ quantization to reduce memory usage and improve performance',
      apply: () => {
        const appPyPath = path.join(config.llmServiceDir, 'app.py');
        let content = fs.readFileSync(appPyPath, 'utf8');
        
        if (!content.includes('quantization=')) {
          content = content.replace(
            /LLMEngine\([^)]+\)/,
            (match) => {
              if (match.includes('quantization')) {
                return match.replace(/quantization=None/, 'quantization="awq"');
              } else {
                return match.replace(/\)$/, ', quantization="awq")');
              }
            }
          );
          
          fs.writeFileSync(appPyPath, content);
          console.log(`✅ Enabled AWQ quantization in app.py`);
          return true;
        }
        
        console.log(`ℹ️ Quantization already enabled`);
        return false;
      }
    }
  ],
  
  backend: [
    {
      name: 'Optimize rate limiting',
      description: 'Optimize rate limiting configuration for better performance',
      apply: () => {
        const llmRoutePath = path.join(config.backendDir, 'src/routes/llm.ts');
        let content = fs.readFileSync(llmRoutePath, 'utf8');
        
        content = content.replace(
          /windowMs:\s*(\d+)/,
          'windowMs: 1000' // 1 second window for more granular control
        );
        
        if (!content.includes('RedisStore')) {
          const redisImport = `import RedisStore from 'rate-limit-redis';\n`;
          content = content.replace(
            /import\s+{[^}]+}\s+from\s+['"]express-rate-limit['"];/,
            (match) => `${match}\n${redisImport}`
          );
          
          content = content.replace(
            /const\s+limiter\s*=\s*rateLimit\(\{[^}]+\}\);/,
            (match) => {
              return match.replace(
                /\}\);$/,
                `,
  store: process.env.NODE_ENV === 'production' 
    ? new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
      })
    : undefined
});`
              );
            }
          );
        }
        
        fs.writeFileSync(llmRoutePath, content);
        console.log(`✅ Optimized rate limiting in llm.ts`);
        
        return true;
      }
    },
    {
      name: 'Implement request batching',
      description: 'Implement request batching to reduce overhead',
      apply: () => {
        const llmServicePath = path.join(config.backendDir, 'src/services/llm.ts');
        let content = fs.readFileSync(llmServicePath, 'utf8');
        
        if (!content.includes('batchRequests')) {
          const batchingCode = `
const requestQueue: Array<{
  prompt: string;
  maxTokens: number;
  temperature: number;
  resolve: (value: any) => void;
  reject: (reason: any) => void;
}> = [];

let batchProcessorRunning = false;

const processBatch = async () => {
  if (batchProcessorRunning || requestQueue.length === 0) return;
  
  batchProcessorRunning = true;
  
  try {
    const batch = requestQueue.splice(0, 10);
    
    const batchPrompts = batch.map(req => req.prompt);
    
    const response = await axios.post(
      \`\${process.env.LLM_SERVICE_URL}/generate_batch\`,
      {
        prompts: batchPrompts,
        max_tokens: Math.max(...batch.map(req => req.maxTokens)),
        temperature: batch[0].temperature, // Use first request's temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.data && Array.isArray(response.data.generations)) {
      response.data.generations.forEach((gen: any, index: number) => {
        if (index < batch.length) {
          batch[index].resolve({
            text: gen.text,
            usage: gen.usage,
          });
        }
      });
    } else {
      batch.forEach(req => {
        req.reject(new Error('Invalid batch response format'));
      });
    }
  } catch (error) {
    requestQueue.forEach(req => {
      req.reject(error);
    });
  } finally {
    batchProcessorRunning = false;
    
    if (requestQueue.length > 0) {
      setTimeout(processBatch, 10);
    }
  }
};

export const batchRequests = (
  prompt: string,
  maxTokens: number = 1024,
  temperature: number = 0.7
): Promise<any> => {
  return new Promise((resolve, reject) => {
    requestQueue.push({
      prompt,
      maxTokens,
      temperature,
      resolve,
      reject
    });
    
    if (!batchProcessorRunning) {
      processBatch();
    }
  });
};`;
          
          content = content.replace(
            /(export\s+const\s+[^}]+}\s*;?\s*)$/,
            `${batchingCode}\n\n$1`
          );
          
          fs.writeFileSync(llmServicePath, content);
          console.log(`✅ Implemented request batching in llm.ts`);
          return true;
        }
        
        console.log(`ℹ️ Request batching already implemented`);
        return false;
      }
    },
    {
      name: 'Implement response caching',
      description: 'Implement response caching to reduce duplicate processing',
      apply: () => {
        const llmServicePath = path.join(config.backendDir, 'src/services/llm.ts');
        let content = fs.readFileSync(llmServicePath, 'utf8');
        
        if (!content.includes('cacheResponse')) {
          const cachingCode = `
const responseCache = new Map<string, {
  response: any;
  timestamp: number;
}>();

const CACHE_TTL = 3600000; // 1 hour in milliseconds

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of responseCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      responseCache.delete(key);
    }
  }
}, 300000); // Clean every 5 minutes

const generateCacheKey = (prompt: string, maxTokens: number, temperature: number): string => {
  return \`\${prompt}|\${maxTokens}|\${temperature}\`;
};

export const cacheResponse = (
  prompt: string,
  maxTokens: number,
  temperature: number,
  response: any
): void => {
  const cacheKey = generateCacheKey(prompt, maxTokens, temperature);
  responseCache.set(cacheKey, {
    response,
    timestamp: Date.now()
  });
};

export const getCachedResponse = (
  prompt: string,
  maxTokens: number,
  temperature: number
): any | null => {
  const cacheKey = generateCacheKey(prompt, maxTokens, temperature);
  const cached = responseCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp <= CACHE_TTL) {
    return cached.response;
  }
  
  return null;
};`;
          
          content = content.replace(
            /(export\s+const\s+[^}]+}\s*;?\s*)$/,
            `${cachingCode}\n\n$1`
          );
          
          content = content.replace(
            /(export\s+const\s+generateText\s*=\s*async\s*\([^)]*\)\s*=>\s*{)/,
            `$1\n  // Check cache first\n  const cachedResponse = getCachedResponse(prompt, maxTokens, temperature);\n  if (cachedResponse) {\n    return cachedResponse;\n  }\n`
          );
          
          content = content.replace(
            /(return\s*{[^}]+}\s*;)/,
            `const response = $1\n  // Cache the successful response\n  cacheResponse(prompt, maxTokens, temperature, response);\n  return response;`
          );
          
          fs.writeFileSync(llmServicePath, content);
          console.log(`✅ Implemented response caching in llm.ts`);
          return true;
        }
        
        console.log(`ℹ️ Response caching already implemented`);
        return false;
      }
    }
  ],
  
  nginx: [
    {
      name: 'Optimize NGINX configuration',
      description: 'Optimize NGINX configuration for better performance',
      apply: () => {
        const nginxConfPath = path.join(config.nginxDir, 'nginx.conf');
        let content = fs.readFileSync(nginxConfPath, 'utf8');
        
        content = content.replace(
          /worker_connections\s+\d+;/,
          'worker_connections 4096;'
        );
        
        if (!content.includes('keepalive_timeout')) {
          content = content.replace(
            /http\s*{/,
            'http {\n    keepalive_timeout 65;\n    keepalive_requests 1000;'
          );
        }
        
        if (!content.includes('gzip')) {
          content = content.replace(
            /http\s*{/,
            'http {\n    gzip on;\n    gzip_comp_level 5;\n    gzip_min_length 256;\n    gzip_proxied any;\n    gzip_types application/json text/plain;'
          );
        }
        
        if (!content.includes('client_body_buffer_size')) {
          content = content.replace(
            /http\s*{/,
            'http {\n    client_body_buffer_size 128k;\n    client_max_body_size 10m;\n    client_header_buffer_size 1k;'
          );
        }
        
        content = content.replace(
          /upstream\s+llm_servers\s*{[^}]+}/,
          `upstream llm_servers {
        # Use least_conn for better load distribution
        least_conn;
        
        # Enable keepalive connections
        keepalive 32;
        
        # LLM service instances
        server llm-service:8000;
        
        # Add more instances here for scaling
        # server llm-service-2:8000;
        # server llm-service-3:8000;
    }`
        );
        
        fs.writeFileSync(nginxConfPath, content);
        console.log(`✅ Optimized NGINX configuration`);
        
        return true;
      }
    }
  ],
  
  dockerCompose: [
    {
      name: 'Optimize Docker Compose configuration',
      description: 'Optimize Docker Compose configuration for better performance',
      apply: () => {
        const dockerComposePath = config.dockerComposeFile;
        let content = fs.readFileSync(dockerComposePath, 'utf8');
        
        if (!content.includes('deploy:') || !content.includes('resources:')) {
          content = content.replace(
            /(services:\s+llm-service:\s+[^\n]+\n(?:\s+[^\n]+\n)*)/,
            `$1    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
        limits:
          cpus: '4'
          memory: 32G
`
          );
        }
        
        if (!content.includes('healthcheck:')) {
          content = content.replace(
            /(services:\s+llm-service:\s+[^\n]+\n(?:\s+[^\n]+\n)*)/,
            `$1    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
`
          );
        }
        
        if (!content.includes('restart:')) {
          content = content.replace(
            /(services:\s+llm-service:\s+[^\n]+\n(?:\s+[^\n]+\n)*)/,
            `$1    restart: always
`
          );
        }
        
        fs.writeFileSync(dockerComposePath, content);
        console.log(`✅ Optimized Docker Compose configuration`);
        
        return true;
      }
    }
  ]
};

function applyAllOptimizations() {
  console.log('===========================================');
  console.log('QWEN 32B API PERFORMANCE OPTIMIZATION');
  console.log('===========================================\n');
  
  let totalOptimizations = 0;
  let appliedOptimizations = 0;
  
  console.log('\n📊 Applying LLM Service optimizations...');
  optimizationStrategies.llmService.forEach(strategy => {
    totalOptimizations++;
    console.log(`\n🔍 ${strategy.name}: ${strategy.description}`);
    try {
      const applied = strategy.apply();
      if (applied) appliedOptimizations++;
    } catch (error) {
      console.error(`❌ Error applying optimization: ${error.message}`);
    }
  });
  
  console.log('\n📊 Applying Backend optimizations...');
  optimizationStrategies.backend.forEach(strategy => {
    totalOptimizations++;
    console.log(`\n🔍 ${strategy.name}: ${strategy.description}`);
    try {
      const applied = strategy.apply();
      if (applied) appliedOptimizations++;
    } catch (error) {
      console.error(`❌ Error applying optimization: ${error.message}`);
    }
  });
  
  console.log('\n📊 Applying NGINX optimizations...');
  optimizationStrategies.nginx.forEach(strategy => {
    totalOptimizations++;
    console.log(`\n🔍 ${strategy.name}: ${strategy.description}`);
    try {
      const applied = strategy.apply();
      if (applied) appliedOptimizations++;
    } catch (error) {
      console.error(`❌ Error applying optimization: ${error.message}`);
    }
  });
  
  console.log('\n📊 Applying Docker Compose optimizations...');
  optimizationStrategies.dockerCompose.forEach(strategy => {
    totalOptimizations++;
    console.log(`\n🔍 ${strategy.name}: ${strategy.description}`);
    try {
      const applied = strategy.apply();
      if (applied) appliedOptimizations++;
    } catch (error) {
      console.error(`❌ Error applying optimization: ${error.message}`);
    }
  });
  
  console.log('\n===========================================');
  console.log('OPTIMIZATION SUMMARY');
  console.log('===========================================');
  console.log(`Total optimizations: ${totalOptimizations}`);
  console.log(`Applied optimizations: ${appliedOptimizations}`);
  console.log(`Success rate: ${Math.round((appliedOptimizations / totalOptimizations) * 100)}%`);
  
  console.log('\n✅ Performance optimization completed!');
  console.log('Run load tests to verify the performance improvements.');
}

applyAllOptimizations();
