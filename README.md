# LLM Service with Prometheus Monitoring

This project implements a simple LLM API service with Prometheus monitoring, designed to work with Grafana dashboards for visualization.

## Features

- FastAPI-based LLM inference API
- Prometheus metrics for monitoring
- Grafana dashboard integration
- GPU utilization tracking
- Support for small models like Phi-2

## Quick Start on RunPod

1. Launch a RunPod instance with GPU (see setup instructions below)
2. Clone this repository
3. Run the setup script:
   ```bash
   chmod +x scripts/setup_runpod.sh
   ./scripts/setup_runpod.sh
   ```
4. Start the LLM service:
   ```bash
   python -m app.main
   ```
5. Load a model:
   ```bash
   curl -X POST http://localhost:8080/load -H "Content-Type: application/json" -d '{"model_name_or_path": "./phi-2"}'
   ```
6. Generate text:
   ```bash
   curl -X POST http://localhost:8080/generate -H "Content-Type: application/json" -d '{"prompt": "Hello, world!"}'
   ```

## Monitoring

- Prometheus metrics are exposed on port 8000
- Connect your Grafana instance to the Prometheus server
- Import the dashboard from `monitoring/grafana/provisioning/dashboards/json/llm-service-dashboard.json`

## Metrics

- `llm_requests_total` - Total number of requests (success/error)
- `llm_request_latency_seconds` - Request latency in seconds
- `llm_tokens_generated_total` - Total number of tokens generated
- `nvidia_gpu_utilization` - GPU utilization percentage

## RunPod Setup Instructions

1. Create a RunPod account at [runpod.io](https://www.runpod.io)
2. Add a payment method
3. Deploy a GPU pod (RTX 4090 or A10 recommended)
4. Select the PyTorch template
5. Connect to your pod via SSH or JupyterLab
6. Follow the Quick Start instructions above

## API Endpoints

- `POST /generate` - Generate text from a prompt
- `POST /load` - Load a model by name or path
- `GET /health` - Check if the service is healthy