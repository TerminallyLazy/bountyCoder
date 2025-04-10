import os
import time
import json
import logging
from typing import List, Optional, Dict, Any

import torch
from fastapi import FastAPI, HTTPException, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from prometheus_client import Counter, Histogram, start_http_server
import redis
import uvicorn

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Qwen 32B Coder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Try to connect to Redis, use a mock if it fails
try:
    redis_client = redis.Redis(
        host=os.getenv("REDIS_HOST", "localhost"),
        port=int(os.getenv("REDIS_PORT", 6379)),
        db=0,
        decode_responses=True,
        socket_connect_timeout=1  # Short timeout for quick failure
    )
    # Test connection
    redis_client.ping()
    logger.info("Connected to Redis successfully")
except Exception as e:
    logger.warning(f"Failed to connect to Redis: {str(e)}. Using mock Redis client.")
    # Create a simple mock Redis client
    class MockRedis:
        def __init__(self):
            self.data = {}
            self.expirations = {}
            
        def get(self, key):
            return self.data.get(key)
            
        def set(self, key, value, ex=None):
            self.data[key] = value
            if ex:
                self.expirations[key] = time.time() + ex
            return True
            
        def incr(self, key):
            if key not in self.data:
                self.data[key] = 1
            else:
                self.data[key] = int(self.data[key]) + 1
            return self.data[key]
            
        def expire(self, key, time_seconds):
            self.expirations[key] = time.time() + time_seconds
            return True
            
        def incrby(self, key, amount):
            if key not in self.data:
                self.data[key] = amount
            else:
                self.data[key] = int(self.data[key]) + amount
            return self.data[key]
    
    redis_client = MockRedis()
    logger.info("Using mock Redis client")

# Start Prometheus metrics server on port 8006
try:
    start_http_server(8006)
    logger.info("Started Prometheus metrics server on port 8006")
except Exception as e:
    logger.warning(f"Failed to start Prometheus metrics server: {str(e)}")

REQUESTS = Counter("llm_requests_total", "Total number of requests", ["endpoint", "status"])
LATENCY = Histogram("llm_request_latency_seconds", "Request latency in seconds", ["endpoint"])
TOKENS_GENERATED = Counter("llm_tokens_generated_total", "Total number of tokens generated")
TOKENS_PROCESSED = Counter("llm_tokens_processed_total", "Total number of tokens processed")

MODEL_NAME = os.getenv("MODEL_NAME", "Qwen/Qwen-32B-Coder")
MAX_BATCH_SIZE = int(os.getenv("MAX_BATCH_SIZE", 32))
MAX_CONCURRENT_REQUESTS = int(os.getenv("MAX_CONCURRENT_REQUESTS", 16))

class GenerateRequest(BaseModel):
    prompt: str = Field(..., description="The prompt to generate text from")
    max_tokens: int = Field(1024, description="Maximum number of tokens to generate")
    temperature: float = Field(0.7, description="Sampling temperature")
    top_p: float = Field(1.0, description="Top-p sampling")
    stop: Optional[List[str]] = Field(None, description="Stop sequences")
    api_key_id: str = Field(..., description="API key ID for tracking usage")

class GenerateResponse(BaseModel):
    id: str = Field(..., description="Unique ID for this generation")
    object: str = Field("text_completion", description="Object type")
    created: int = Field(..., description="Unix timestamp of creation")
    model: str = Field(..., description="Model used for generation")
    choices: List[Dict[str, Any]] = Field(..., description="Generated text choices")
    usage: Dict[str, int] = Field(..., description="Token usage statistics")

def load_model():
    logger.info(f"Loading model: {MODEL_NAME}")
    
    return "mock_model"

model = load_model()

async def check_rate_limit(request: Request, api_key_id: str = None):
    if not api_key_id:
        api_key_id = request.query_params.get("api_key_id")
        
    if not api_key_id:
        raise HTTPException(status_code=400, detail="API key ID is required")
    
    rate_limit_key = f"rate_limit:{api_key_id}"
    custom_limit = redis_client.get(rate_limit_key)
    
    if not custom_limit:
        custom_limit = 100
    else:
        custom_limit = int(custom_limit)
    
    current_minute = int(time.time() / 60)
    request_count_key = f"requests:{api_key_id}:{current_minute}"
    
    request_count = redis_client.incr(request_count_key)
    redis_client.expire(request_count_key, 60)  # Expire after 1 minute
    
    if request_count > custom_limit:
        REQUESTS.labels(endpoint="/generate", status="rate_limited").inc()
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded",
            headers={"Retry-After": "60"},
        )
    
    return api_key_id

@app.get("/")
async def root():
    return {"message": "Qwen 32B Coder API", "status": "running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "model": MODEL_NAME}

@app.post("/generate", response_model=GenerateResponse)
async def generate(
    request: GenerateRequest,
    background_tasks: BackgroundTasks,
    api_key_id: str = Depends(check_rate_limit),
):
    start_time = time.time()
    
    try:
        logger.info(f"Generate request: {request.prompt[:50]}...")
        
        
        prompt_tokens = len(request.prompt.split()) * 1.3  # Rough estimate
        completion_tokens = request.max_tokens / 2  # Simulate partial usage
        
        processing_time = (completion_tokens / 30)  # 30 tokens/second
        time.sleep(min(processing_time, 5))  # Cap at 5 seconds for demo
        
        response = {
            "id": f"gen_{int(time.time())}",
            "object": "text_completion",
            "created": int(time.time()),
            "model": MODEL_NAME,
            "choices": [
                {
                    "text": f"// Here's a function to {request.prompt}\n\nfunction example() {{\n  console.log('This is a mock response');\n  return true;\n}}",
                    "index": 0,
                    "finish_reason": "stop",
                }
            ],
            "usage": {
                "prompt_tokens": int(prompt_tokens),
                "completion_tokens": int(completion_tokens),
                "total_tokens": int(prompt_tokens + completion_tokens),
            },
        }
        
        REQUESTS.labels(endpoint="/generate", status="success").inc()
        LATENCY.labels(endpoint="/generate").observe(time.time() - start_time)
        TOKENS_GENERATED.inc(response["usage"]["completion_tokens"])
        TOKENS_PROCESSED.inc(response["usage"]["total_tokens"])
        
        background_tasks.add_task(record_usage, api_key_id, response["usage"]["total_tokens"])
        
        return response
    
    except Exception as e:
        REQUESTS.labels(endpoint="/generate", status="error").inc()
        logger.error(f"Error generating text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def record_usage(api_key_id: str, tokens: int):
    try:
        usage_key = f"usage:{api_key_id}:{int(time.time() / 3600)}"  # Hourly usage
        redis_client.incrby(usage_key, tokens)
        redis_client.expire(usage_key, 86400 * 7)  # Keep for 7 days
        
        total_usage_key = f"total_usage:{api_key_id}"
        redis_client.incrby(total_usage_key, tokens)
    except Exception as e:
        logger.error(f"Error recording usage: {str(e)}")

@app.post("/admin/set-rate-limit/{api_key_id}")
async def set_rate_limit(api_key_id: str, limit: int):
    try:
        rate_limit_key = f"rate_limit:{api_key_id}"
        redis_client.set(rate_limit_key, limit)
        return {"message": f"Rate limit for {api_key_id} set to {limit}"}
    except Exception as e:
        logger.error(f"Error setting rate limit: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Disable reload mode to avoid file watching issues in RunPod
    uvicorn.run("app:app", host="0.0.0.0", port=8007, reload=False, log_level="info")
