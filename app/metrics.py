from prometheus_client import Counter, Histogram, Gauge
import time

# Request metrics
REQUEST_COUNT = Counter(
    'llm_requests_total', 
    'Total number of requests',
    ['status']  # 'success' or 'error'
)

# Latency metrics
REQUEST_LATENCY = Histogram(
    'llm_request_latency_seconds',
    'Request latency in seconds',
    buckets=(0.05, 0.1, 0.2, 0.5, 1.0, 2.5, 5.0, 10.0, 25.0, 60.0)
)

# Token generation metrics
TOKENS_GENERATED = Counter(
    'llm_tokens_generated_total',
    'Total number of tokens generated'
)

# GPU utilization metric
GPU_UTILIZATION = Gauge(
    'nvidia_gpu_utilization',
    'GPU utilization percentage',
    ['index']  # GPU index
)

class MetricsMiddleware:
    """Middleware to track request metrics."""
    
    async def __call__(self, request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            REQUEST_COUNT.labels(status='success').inc()
            return response
        except Exception as e:
            REQUEST_COUNT.labels(status='error').inc()
            raise e
        finally:
            REQUEST_LATENCY.observe(time.time() - start_time)