FROM nvidia/cuda:12.1.1-devel-ubuntu22.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip3 install --no-cache-dir \
    torch==2.1.0 \
    transformers==4.35.0 \
    vllm==0.2.0 \
    fastapi==0.104.1 \
    uvicorn==0.24.0 \
    pydantic==2.4.2 \
    redis==5.0.1 \
    prometheus-client==0.17.1

# Copy application code
COPY . .

# Expose the application port
EXPOSE 8000

# Set environment variables
ENV MODEL_NAME=Qwen/Qwen-32B-Coder
ENV MAX_BATCH_SIZE=32
ENV MAX_CONCURRENT_REQUESTS=16
ENV CUDA_VISIBLE_DEVICES=0

# Start the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
