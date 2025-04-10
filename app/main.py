from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from prometheus_client import start_http_server
import uvicorn
import time
import threading
import os

from app.metrics import MetricsMiddleware, REQUEST_LATENCY
from app.model import LLMModel
from app.gpu_monitor import GPUMonitor

# Initialize the model
llm = LLMModel()

# Start Prometheus metrics server on a separate port
METRICS_PORT = int(os.environ.get("METRICS_PORT", 8000))
threading.Thread(target=start_http_server, args=(METRICS_PORT,), daemon=True).start()
print(f"Prometheus metrics server started on port {METRICS_PORT}")

# Initialize GPU monitoring
gpu_monitor = GPUMonitor(interval=10)  # Check GPU every 10 seconds
gpu_monitor.start()

# FastAPI app
app = FastAPI(title="LLM API Service")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add metrics middleware
app.middleware("http")(MetricsMiddleware())

# Request models
class TextGenerationRequest(BaseModel):
    prompt: str
    max_length: int = 100
    temperature: float = 0.7
    top_p: float = 0.9

class ModelLoadRequest(BaseModel):
    model_name_or_path: str

# Endpoints
@app.post("/generate")
@REQUEST_LATENCY.time()
async def generate_text(request: TextGenerationRequest):
    """Generate text based on the prompt."""
    try:
        if llm.model is None:
            raise HTTPException(status_code=400, detail="Model not loaded. Call /load endpoint first.")
        
        response = llm.generate(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p
        )
        
        return {"generated_text": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load")
async def load_model(request: ModelLoadRequest):
    """Load a model by name or path."""
    try:
        llm.load_model(request.model_name_or_path)
        return {"status": "success", "model": request.model_name_or_path}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "model_loaded": llm.model is not None}

@app.on_event("shutdown")
def shutdown_event():
    """Clean up resources when shutting down."""
    gpu_monitor.stop()

if __name__ == "__main__":
    # Get host and port from environment variables with defaults
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 8080))
    
    # Start the server
    print(f"Starting LLM API server on {host}:{port}")
    uvicorn.run("app.main:app", host=host, port=port, reload=False)